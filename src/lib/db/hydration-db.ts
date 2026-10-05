import { deleteDB, openDB, type IDBPDatabase } from "idb";
import type {
  AppMetaRecord,
  DailyTargetRecord,
  HydrationDBSchema,
  IntakeEntryRecord,
  ProfileRecord,
  ReminderStateRecord,
  SettingsRecord
} from "./schema";
import { getHydrationDayKey, getUtcOffsetMinutes } from "./hydration-day";

export const DB_NAME = "hydration-pwa";
export const DB_VERSION = 1;
let dbPromise: Promise<IDBPDatabase<HydrationDBSchema>> | null = null;

function nowMs() { return Date.now(); }

function randomSecret(byteLength = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return Array.from(bytes).map((v) => v.toString(16).padStart(2, "0")).join("");
}

export function openHydrationDB() {
  if (!dbPromise) {
    dbPromise = openDB<HydrationDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore("appMeta", { keyPath: "id" });
          db.createObjectStore("profile", { keyPath: "id" });
          db.createObjectStore("settings", { keyPath: "id" });
          const intake = db.createObjectStore("intakeEntries", { keyPath: "id" });
          intake.createIndex("by-day-key", "hydrationDayKey");
          intake.createIndex("by-occurred-at", "occurredAt");
          intake.createIndex("by-day-time", ["hydrationDayKey", "occurredAt"]);
          db.createObjectStore("dailyTargets", { keyPath: "hydrationDayKey" });
          db.createObjectStore("reminderState", { keyPath: "id" });
        }
      }
    });
  }
  return dbPromise;
}

export async function ensureAppMeta(): Promise<AppMetaRecord> {
  const db = await openHydrationDB();
  const existing = await db.get("appMeta", "current");
  const now = nowMs();
  if (existing) {
    const updated = { ...existing, schemaVersion: DB_VERSION, lastOpenedAt: now, updatedAt: now };
    await db.put("appMeta", updated);
    return updated;
  }
  const created: AppMetaRecord = {
    id: "current",
    schemaVersion: DB_VERSION,
    installId: crypto.randomUUID(),
    pushAuthSecret: randomSecret(),
    pushEnabled: false,
    pendingPushSync: false,
    onboardingCompleted: false,
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now
  };
  await db.add("appMeta", created);
  return created;
}

export async function updateAppMeta(patch: Partial<Omit<AppMetaRecord, "id" | "createdAt">>) {
  const db = await openHydrationDB();
  const current = await ensureAppMeta();
  const updated: AppMetaRecord = {
    ...current,
    ...patch,
    id: "current",
    createdAt: current.createdAt,
    updatedAt: nowMs()
  };
  await db.put("appMeta", updated);
  return updated;
}

export async function getProfile() {
  const db = await openHydrationDB();
  return db.get("profile", "current");
}

export async function saveProfile(profile: Omit<ProfileRecord, "id" | "updatedAt">): Promise<ProfileRecord> {
  const db = await openHydrationDB();
  const record: ProfileRecord = { id: "current", ...profile, updatedAt: nowMs() };
  await db.put("profile", record);
  return record;
}

export async function getSettings() {
  const db = await openHydrationDB();
  return db.get("settings", "current");
}

export async function saveSettings(settings: Omit<SettingsRecord, "id" | "updatedAt">): Promise<SettingsRecord> {
  const db = await openHydrationDB();
  const record: SettingsRecord = { id: "current", ...settings, updatedAt: nowMs() };
  await db.put("settings", record);
  return record;
}

export async function ensureSettings(): Promise<SettingsRecord> {
  const existing = await getSettings();
  if (existing) {
    if (typeof existing.quickAddMl !== "number" || existing.quickAddMl <= 0) {
      existing.quickAddMl = 250;
    }
    return existing;
  }
  return saveSettings({
    targetMode: "automatic",
    manualTargetMl: null,
    wakeTime: "06:00",
    sleepTime: "22:00",
    remindersEnabled: true,
    locale: "en-US",
    volumeUnit: "ml",
    quickAddMl: 250
  });
}

export async function addIntake(input: { amountMl: number; occurredAt?: Date; source: "quick" | "custom" | "import" }): Promise<IntakeEntryRecord> {
  if (!Number.isFinite(input.amountMl) || input.amountMl <= 0) throw new Error("Jumlah minum harus lebih dari 0 ml.");
  const settings = await ensureSettings();
  const occurredAt = input.occurredAt ?? new Date();
  const now = nowMs();
  const record: IntakeEntryRecord = {
    id: crypto.randomUUID(),
    hydrationDayKey: getHydrationDayKey(occurredAt, settings.wakeTime),
    amountMl: Math.round(input.amountMl),
    occurredAt: occurredAt.getTime(),
    utcOffsetMinutes: getUtcOffsetMinutes(occurredAt),
    source: input.source,
    createdAt: now,
    updatedAt: now
  };
  const db = await openHydrationDB();
  await db.add("intakeEntries", record);
  return record;
}

export async function deleteIntake(id: string) {
  const db = await openHydrationDB();
  await db.delete("intakeEntries", id);
}

export async function getIntakesByDay(dayKey: string) {
  const db = await openHydrationDB();
  const items = await db.getAllFromIndex("intakeEntries", "by-day-key", dayKey);
  return items.sort((a, b) => a.occurredAt - b.occurredAt);
}

export async function getAllIntakes() {
  const db = await openHydrationDB();
  return db.getAll("intakeEntries");
}

export async function getDailyTarget(dayKey: string) {
  const db = await openHydrationDB();
  return db.get("dailyTargets", dayKey);
}

export async function getAllDailyTargets() {
  const db = await openHydrationDB();
  return db.getAll("dailyTargets");
}

export async function saveDailyTarget(target: Omit<DailyTargetRecord, "createdAt" | "updatedAt"> & Partial<Pick<DailyTargetRecord, "createdAt">>): Promise<DailyTargetRecord> {
  const db = await openHydrationDB();
  const existing = await db.get("dailyTargets", target.hydrationDayKey);
  const now = nowMs();
  const record: DailyTargetRecord = {
    ...target,
    createdAt: existing?.createdAt ?? target.createdAt ?? now,
    updatedAt: now
  };
  await db.put("dailyTargets", record);
  return record;
}

export async function getReminderState() {
  const db = await openHydrationDB();
  return db.get("reminderState", "current");
}

export async function saveReminderState(state: Omit<ReminderStateRecord, "id">) {
  const db = await openHydrationDB();
  const record: ReminderStateRecord = { id: "current", ...state };
  await db.put("reminderState", record);
  return record;
}

export async function resetHydrationDB() {
  const db = await openHydrationDB();
  db.close();
  dbPromise = null;
  await deleteDB(DB_NAME);
}
