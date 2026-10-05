import type { DBSchema } from "idb";
import type { AppSettings, Profile } from "$lib/types";

export type ReminderStatus =
  | "disabled"
  | "complete"
  | "quiet_hours"
  | "active"
  | "active_with_shortfall";

export interface AppMetaRecord {
  id: "current";
  schemaVersion: number;
  installId: string;
  pushAuthSecret: string;
  pushEnabled: boolean;
  pendingPushSync: boolean;
  storagePersistent?: boolean;
  lastSuccessfulPushSyncAt?: number | null;
  lastPushError?: string | null;
  onboardingCompleted: boolean;
  createdAt: number;
  updatedAt: number;
  lastOpenedAt: number;
}

export type ProfileRecord = Profile;
export type SettingsRecord = AppSettings;

export interface IntakeEntryRecord {
  id: string;
  hydrationDayKey: string;
  amountMl: number;
  occurredAt: number;
  utcOffsetMinutes: number;
  source: "quick" | "custom" | "import";
  createdAt: number;
  updatedAt: number;
}

export interface DailyTargetRecord {
  hydrationDayKey: string;
  plainWaterGoalMl: number;
  totalWaterReferenceMl: number | null;
  targetMode: "automatic" | "manual";
  calculationMethod:
    | "kemkes_akg_2019"
    | "manual"
    | "caregiver_information";
  calculationVersion: string;
  createdAt: number;
  updatedAt: number;
}

export interface PlannedReminderRecord {
  id: string;
  at: number;
  amountMl: number;
}

export interface ReminderStateRecord {
  id: "current";
  hydrationDayKey: string;
  revision: number;
  status: ReminderStatus;
  generatedAt: number;
  reminders: PlannedReminderRecord[];
  projectedShortfallMl: number;
}

export interface HydrationDBSchema extends DBSchema {
  appMeta: { key: "current"; value: AppMetaRecord };
  profile: { key: "current"; value: ProfileRecord };
  settings: { key: "current"; value: SettingsRecord };
  intakeEntries: {
    key: string;
    value: IntakeEntryRecord;
    indexes: {
      "by-day-key": string;
      "by-occurred-at": number;
      "by-day-time": [string, number];
    };
  };
  dailyTargets: { key: string; value: DailyTargetRecord };
  reminderState: { key: "current"; value: ReminderStateRecord };
}
