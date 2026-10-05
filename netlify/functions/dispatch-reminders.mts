import type { Config } from "@netlify/functions";
import {
  getDeviceStore,
  getDispatchClaimStore,
  getReminderStore,
  type PushDeviceRecord,
  type PushReminderRecord
} from "./_shared/stores.mts";
import { getWebPush } from "./_shared/webpush.mts";

function minuteBucket(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${y}${m}${d}T${hh}${mm}Z`;
}

export default async function() {
  const deviceStore = getDeviceStore();
  const reminderStore = getReminderStore();
  const claimStore = getDispatchClaimStore();
  const webpush = getWebPush();

  let sent = 0;
  let stale = 0;
  let failed = 0;
  let duplicateSkipped = 0;

  const now = new Date();

  for (const offset of [0, 1, 2]) {
    const minute = new Date(now.getTime() - offset * 60_000);
    const prefix = `due/${minuteBucket(minute)}/`;
    const { blobs } = await reminderStore.list({ prefix });

    for (const blob of blobs) {
      const reminder = await reminderStore.get(blob.key, {
        type: "json"
      }) as PushReminderRecord | null;

      if (!reminder) continue;

      const deviceKey = `device/${reminder.deviceId}`;
      const device = await deviceStore.get(deviceKey, {
        type: "json",
        consistency: "strong"
      }) as PushDeviceRecord | null;

      if (
        !device ||
        !device.active ||
        device.revision !== reminder.revision
      ) {
        stale += 1;
        await reminderStore.delete(blob.key);
        continue;
      }

      // Atomic claim: only one overlapping dispatcher invocation may
      // send a given reminder. Netlify Blobs onlyIfNew is an atomic
      // conditional write.
      const claimKey = blob.key.replace(/^due\//, "claim/");
      const claimResult = await claimStore.setJSON(
        claimKey,
        { claimedAt: Date.now() },
        { onlyIfNew: true }
      );

      if (!claimResult.modified) {
        duplicateSkipped += 1;
        continue;
      }

      try {
        await webpush.sendNotification(
          device.subscription,
          JSON.stringify({
            type: "hydration-reminder",
            reminderId: reminder.reminderId,
            revision: reminder.revision,
            amountMl: reminder.amountMl
          }),
          { TTL: 600 }
        );

        sent += 1;
        await reminderStore.delete(blob.key);
        // Keep successful claim temporarily as a deduplication marker.
      } catch (error: any) {
        const status = Number(error?.statusCode);

        if (status === 404 || status === 410) {
          await deviceStore.delete(deviceKey);
          await reminderStore.delete(blob.key);
          await claimStore.delete(claimKey);
        } else {
          failed += 1;
          // Release claim so the 2-minute grace window can retry
          // a temporary delivery failure.
          await claimStore.delete(claimKey);
        }
      }
    }
  }

  console.log({ sent, stale, failed, duplicateSkipped });
}

export const config: Config = {
  schedule: "* * * * *"
};
