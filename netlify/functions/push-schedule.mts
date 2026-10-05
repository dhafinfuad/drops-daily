import {
  getDeviceStore,
  getReminderStore,
  type PushDeviceRecord,
  type PushReminderRecord
} from "./_shared/stores.mts";
import { assertString, verifySecret } from "./_shared/auth.mts";
import { errorResponse, json, readJson } from "./_shared/http.mts";

function minuteBucket(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${y}${m}${d}T${hh}${mm}Z`;
}

export default async function(req: Request) {
  try {
    const body = await readJson(req);

    assertString(body.deviceId, "deviceId", 100);
    assertString(body.deviceSecret, "deviceSecret", 256);

    if (!Number.isSafeInteger(body.revision) || body.revision < 1) {
      throw new Error("Invalid revision");
    }

    if (!Array.isArray(body.reminders) || body.reminders.length > 24) {
      throw new Error("Invalid reminders");
    }

    const deviceStore = getDeviceStore();
    const reminderStore = getReminderStore();
    const deviceKey = `device/${body.deviceId}`;

    const device = await deviceStore.get(deviceKey, {
      type: "json",
      consistency: "strong"
    }) as PushDeviceRecord | null;

    if (
      !device ||
      !device.active ||
      !verifySecret(body.deviceSecret, device.secretHash)
    ) {
      return json({ error: "Device authentication failed" }, { status: 403 });
    }

    if (body.revision <= device.revision) {
      return json({ ok: true, ignored: "stale_revision" });
    }

    const now = Date.now();
    const horizon = now + 48 * 60 * 60 * 1000;
    const validated: { id: string; at: Date; amountMl: number }[] = [];

    for (const reminder of body.reminders) {
      assertString(reminder.id, "reminder.id", 100);

      const at = new Date(reminder.at);
      const amountMl = Number(reminder.amountMl);

      if (
        Number.isNaN(at.getTime()) ||
        at.getTime() < now - 5 * 60_000 ||
        at.getTime() > horizon ||
        !Number.isFinite(amountMl) ||
        amountMl <= 0 ||
        amountMl > 500
      ) {
        throw new Error("Invalid reminder");
      }

      validated.push({
        id: reminder.id,
        at,
        amountMl: Math.round(amountMl)
      });
    }

    // Stage the complete new schedule before activating its revision.
    for (const reminder of validated) {
      const record: PushReminderRecord = {
        deviceId: body.deviceId,
        revision: body.revision,
        reminderId: reminder.id,
        at: reminder.at.toISOString(),
        amountMl: reminder.amountMl
      };

      const key = [
        "due",
        minuteBucket(reminder.at),
        body.deviceId,
        body.revision,
        reminder.id
      ].join("/");

      await reminderStore.setJSON(key, record);
    }

    // Re-read before moving the active revision pointer so an older retry
    // cannot trivially overwrite a newer completed revision.
    const latestDevice = await deviceStore.get(deviceKey, {
      type: "json",
      consistency: "strong"
    }) as PushDeviceRecord | null;

    if (
      !latestDevice ||
      !latestDevice.active ||
      !verifySecret(body.deviceSecret, latestDevice.secretHash)
    ) {
      return json({ error: "Device authentication failed" }, { status: 403 });
    }

    if (body.revision > latestDevice.revision) {
      await deviceStore.setJSON(deviceKey, {
        ...latestDevice,
        revision: body.revision,
        updatedAt: now
      } satisfies PushDeviceRecord);
    }

    return json({
      ok: true,
      revision: body.revision,
      scheduled: validated.length
    });
  } catch (error) {
    return errorResponse(error);
  }
}
