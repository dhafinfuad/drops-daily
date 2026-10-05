import type { Config } from "@netlify/functions";
import {
  getDispatchClaimStore,
  getReminderStore
} from "./_shared/stores.mts";

const RETENTION_MS = 72 * 60 * 60 * 1000;

function parseBucketFromKey(key: string): number | null {
  const parts = key.split("/");
  const bucket = parts[1];

  if (!bucket || !/^\d{8}T\d{4}Z$/.test(bucket)) return null;

  const year = Number(bucket.slice(0, 4));
  const month = Number(bucket.slice(4, 6)) - 1;
  const day = Number(bucket.slice(6, 8));
  const hour = Number(bucket.slice(9, 11));
  const minute = Number(bucket.slice(11, 13));

  const timestamp = Date.UTC(year, month, day, hour, minute);
  return Number.isFinite(timestamp) ? timestamp : null;
}

async function cleanupStore(
  store: ReturnType<typeof getReminderStore> | ReturnType<typeof getDispatchClaimStore>,
  prefix: string,
  cutoff: number
) {
  const { blobs } = await store.list({ prefix });
  let deleted = 0;

  for (const blob of blobs) {
    const timestamp = parseBucketFromKey(blob.key);
    if (timestamp !== null && timestamp < cutoff) {
      await store.delete(blob.key);
      deleted += 1;
    }
  }

  return deleted;
}

export default async function() {
  const cutoff = Date.now() - RETENTION_MS;
  const reminderStore = getReminderStore();
  const claimStore = getDispatchClaimStore();

  const [deletedReminders, deletedClaims] = await Promise.all([
    cleanupStore(reminderStore, "due/", cutoff),
    cleanupStore(claimStore, "claim/", cutoff)
  ]);

  console.log({ deletedReminders, deletedClaims });
}

export const config: Config = {
  schedule: "17 3 * * *"
};
