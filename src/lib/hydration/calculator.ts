import type { AppSettings, Profile } from "$lib/types";

export const HYDRATION_CALCULATION_VERSION = "hydration-v1-kemkes-akg-2019";

export type HydrationStatus =
  | "automatic"
  | "manual"
  | "manual_required"
  | "infant_exclusive"
  | "caregiver_information";

export interface HydrationResult {
  status: HydrationStatus;
  plainWaterGoalMl: number | null;
  totalWaterReferenceMl: number | null;
  calculationMethod: "kemkes_akg_2019" | "manual" | "caregiver_information";
  calculationVersion: string;
  adaptiveReminderAllowed: boolean;
  caregiverPlainWaterRangeMl?: [number, number];
  warnings: string[];
}

function round50(value: number) { return Math.round(value / 50) * 50; }
function ageInMonths(profile: Profile) { return profile.age.unit === "months" ? profile.age.value : profile.age.value * 12; }
function ageInYears(profile: Profile) { return ageInMonths(profile) / 12; }

function baseTotalWaterMl(profile: Profile): number {
  const months = ageInMonths(profile);
  const years = ageInYears(profile);
  if (months <= 5) return 700;
  if (months <= 11) return 900;
  if (years <= 3) return 1150;
  if (years <= 6) return 1450;
  if (years <= 9) return 1650;
  if (years <= 12) return 1850;
  if (years <= 15) return 2100;
  if (years <= 18) return profile.sex === "male" ? 2300 : 2150;
  if (years <= 64) return profile.sex === "male" ? 2500 : 2350;
  if (years <= 80) return profile.sex === "male" ? 1800 : 1550;
  return profile.sex === "male" ? 1600 : 1400;
}

export function getUserStage(profile: Profile): "infant_0_5" | "infant_6_11" | "standard" {
  const months = ageInMonths(profile);
  if (months <= 5) return "infant_0_5";
  if (months <= 11) return "infant_6_11";
  return "standard";
}

export function calculateHydration(profile: Profile, settings: AppSettings): HydrationResult {
  const warnings: string[] = [];

  if (settings.targetMode === "manual" && settings.manualTargetMl && settings.manualTargetMl > 0) {
    return {
      status: "manual",
      plainWaterGoalMl: Math.round(settings.manualTargetMl),
      totalWaterReferenceMl: null,
      calculationMethod: "manual",
      calculationVersion: HYDRATION_CALCULATION_VERSION,
      adaptiveReminderAllowed: getUserStage(profile) === "standard",
      warnings
    };
  }

  if (profile.fluidRestrictionByDoctor) {
    return {
      status: "manual_required",
      plainWaterGoalMl: null,
      totalWaterReferenceMl: null,
      calculationMethod: "manual",
      calculationVersion: HYDRATION_CALCULATION_VERSION,
      adaptiveReminderAllowed: false,
      warnings: ["Gunakan target manual sesuai arahan tenaga kesehatan."]
    };
  }

  const stage = getUserStage(profile);

  if (stage === "infant_0_5") {
    return {
      status: "infant_exclusive",
      plainWaterGoalMl: null,
      totalWaterReferenceMl: 700,
      calculationMethod: "caregiver_information",
      calculationVersion: HYDRATION_CALCULATION_VERSION,
      adaptiveReminderAllowed: false,
      warnings: ["Usia 0–5 bulan tidak menggunakan target air putih pada aplikasi ini."]
    };
  }

  if (stage === "infant_6_11") {
    return {
      status: "caregiver_information",
      plainWaterGoalMl: null,
      totalWaterReferenceMl: 900,
      calculationMethod: "caregiver_information",
      calculationVersion: HYDRATION_CALCULATION_VERSION,
      adaptiveReminderAllowed: false,
      caregiverPlainWaterRangeMl: [120, 240],
      warnings: ["Mode bayi bersifat informasi untuk caregiver dan tidak memakai target-chasing reminder."]
    };
  }

  let totalWaterReferenceMl = baseTotalWaterMl(profile);
  if (profile.userType === "pregnant") totalWaterReferenceMl += 300;
  if (profile.userType === "breastfeeding") totalWaterReferenceMl += profile.lactationPeriod === "month_7_12" ? 650 : 800;

  if (profile.activity === "high" || profile.activity === "very_high") {
    warnings.push("Aktivitas tinggi dapat meningkatkan kebutuhan cairan; target dasar belum menaksir kehilangan keringat secara individual.");
  }
  if (profile.environment === "hot" || profile.environment === "very_hot") {
    warnings.push("Kondisi panas dapat meningkatkan kebutuhan cairan; target dasar tidak memakai multiplier cuaca buatan.");
  }

  return {
    status: "automatic",
    plainWaterGoalMl: round50(totalWaterReferenceMl * 0.8),
    totalWaterReferenceMl,
    calculationMethod: "kemkes_akg_2019",
    calculationVersion: HYDRATION_CALCULATION_VERSION,
    adaptiveReminderAllowed: true,
    warnings
  };
}
