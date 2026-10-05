import type { DailyTargetRecord, IntakeEntryRecord, ProfileRecord, SettingsRecord } from "./schema";
import { openHydrationDB } from "./hydration-db";

export const BACKUP_FORMAT = "hydration-pwa-backup";
export const BACKUP_VERSION = 1;

export interface HydrationBackupV1 {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: number;
  profile: ProfileRecord | null;
  settings: SettingsRecord | null;
  dailyTargets: DailyTargetRecord[];
  intakeEntries: IntakeEntryRecord[];
}

export async function exportBackup(): Promise<HydrationBackupV1> {
  const db = await openHydrationDB();
  const [profile, settings, dailyTargets, intakeEntries] = await Promise.all([
    db.get("profile", "current"),
    db.get("settings", "current"),
    db.getAll("dailyTargets"),
    db.getAll("intakeEntries")
  ]);
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    profile: profile ?? null,
    settings: settings ?? null,
    dailyTargets,
    intakeEntries
  };
}

export function validateBackup(value: unknown): HydrationBackupV1 {
  if (!value || typeof value !== "object") throw new Error("File backup tidak valid.");
  const backup = value as Partial<HydrationBackupV1>;
  if (backup.format !== BACKUP_FORMAT || backup.version !== BACKUP_VERSION || !Array.isArray(backup.dailyTargets) || !Array.isArray(backup.intakeEntries)) {
    throw new Error("Format backup tidak didukung.");
  }
  return backup as HydrationBackupV1;
}

export async function importBackupReplace(backup: HydrationBackupV1) {
  const db = await openHydrationDB();
  const tx = db.transaction(["profile", "settings", "dailyTargets", "intakeEntries", "reminderState"], "readwrite");
  await Promise.all([
    tx.objectStore("profile").clear(),
    tx.objectStore("settings").clear(),
    tx.objectStore("dailyTargets").clear(),
    tx.objectStore("intakeEntries").clear(),
    tx.objectStore("reminderState").clear()
  ]);
  if (backup.profile) await tx.objectStore("profile").put(backup.profile);
  if (backup.settings) await tx.objectStore("settings").put(backup.settings);
  for (const target of backup.dailyTargets) await tx.objectStore("dailyTargets").put(target);
  for (const entry of backup.intakeEntries) await tx.objectStore("intakeEntries").put(entry);
  await tx.done;
}
