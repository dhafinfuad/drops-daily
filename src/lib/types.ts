export type UserType =
  | "child"
  | "teen"
  | "adult"
  | "older_adult"
  | "pregnant"
  | "breastfeeding";

export type Sex = "male" | "female";

export type ActivityLevel =
  | "very_light"
  | "light"
  | "moderate"
  | "high"
  | "very_high";

export type EnvironmentLevel =
  | "cool"
  | "normal"
  | "hot"
  | "very_hot";

export interface Profile {
  id: "current";
  userType: UserType;
  age: {
    value: number;
    unit: "months" | "years";
  };
  sex: Sex;
  weightKg: number | null;
  activity: ActivityLevel;
  environment: EnvironmentLevel;
  pregnancyTrimester: 1 | 2 | 3 | null;
  lactationPeriod: "month_0_6" | "month_7_12" | null;
  fluidRestrictionByDoctor: boolean;
  updatedAt: number;
}

export interface AppSettings {
  id: "current";
  targetMode: "automatic" | "manual";
  manualTargetMl: number | null;
  wakeTime: string;
  sleepTime: string;
  remindersEnabled: boolean;
  locale: string;
  volumeUnit: "ml";
  quickAddMl?: number;
  updatedAt: number;
}
