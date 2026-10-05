export type ReminderStatus = "disabled" | "complete" | "quiet_hours" | "active" | "active_with_shortfall";
export type UserStage = "standard" | "infant_0_5" | "infant_6_11";

export interface ReminderEngineConfig {
  minIntervalMinutes: number;
  maxIntervalMinutes: number;
  minFirstDelayMinutes: number;
  maxFirstDelayMinutes: number;
  cooldownAfterIntakeMinutes: number;
  quietBeforeSleepMinutes: number;
  roundStepMl: number;
  completionToleranceRatio: number;
  completionToleranceMinMl: number;
}

export interface ReminderInput {
  goalMl: number;
  consumedMl: number;
  now: Date;
  sleepAt: Date;
  lastIntakeAt?: Date | null;
  reminderEnabled: boolean;
  userStage: UserStage;
  withinActiveWindow?: boolean;
}

export interface ReminderItem { id: string; at: Date; amountMl: number; }
export interface ReminderPlan {
  status: ReminderStatus;
  remainingMl: number;
  baseServingMl: number;
  maxServingMl: number;
  intervalMinutes: number | null;
  reminders: ReminderItem[];
  projectedIntakeMl: number;
  projectedShortfallMl: number;
}

export const DEFAULT_REMINDER_CONFIG: ReminderEngineConfig = {
  minIntervalMinutes: 60,
  maxIntervalMinutes: 180,
  minFirstDelayMinutes: 30,
  maxFirstDelayMinutes: 60,
  cooldownAfterIntakeMinutes: 45,
  quietBeforeSleepMinutes: 30,
  roundStepMl: 50,
  completionToleranceRatio: 0.025,
  completionToleranceMinMl: 50
};

const clamp = (v:number,min:number,max:number) => Math.min(max, Math.max(min, v));
const roundTo = (v:number,step:number) => Math.round(v / step) * step;
const addMinutes = (d:Date,m:number) => new Date(d.getTime() + m * 60_000);

export function generateReminderPlan(input: ReminderInput, config: ReminderEngineConfig = DEFAULT_REMINDER_CONFIG): ReminderPlan {
  const goalMl = Math.max(0, input.goalMl);
  const consumedMl = Math.max(0, input.consumedMl);
  const remainingMl = Math.max(0, goalMl - consumedMl);
  const baseServingMl = clamp(roundTo(goalMl * 0.1, config.roundStepMl), 100, 250);
  const maxServingMl = clamp(roundTo(goalMl * 0.125, config.roundStepMl), 100, 300);
  const empty = (status: ReminderStatus, shortfall = remainingMl): ReminderPlan => ({ status, remainingMl, baseServingMl, maxServingMl, intervalMinutes: null, reminders: [], projectedIntakeMl: 0, projectedShortfallMl: shortfall });

  if (!input.reminderEnabled || input.userStage !== "standard") return empty("disabled");
  if (input.withinActiveWindow === false) return empty("quiet_hours");
  const completionToleranceMl = Math.max(config.completionToleranceMinMl, goalMl * config.completionToleranceRatio);
  if (remainingMl <= completionToleranceMl) return { ...empty("complete", 0), projectedShortfallMl: 0 };

  const latestReminderAt = addMinutes(input.sleepAt, -config.quietBeforeSleepMinutes);
  if (input.now >= latestReminderAt || input.sleepAt <= input.now) return empty("quiet_hours");

  const hoursUntilSleep = (input.sleepAt.getTime() - input.now.getTime()) / 3_600_000;
  const neededRateMlPerHour = remainingMl / hoursUntilSleep;
  let intervalMinutes = roundTo((baseServingMl / neededRateMlPerHour) * 60, 15);
  intervalMinutes = clamp(intervalMinutes, config.minIntervalMinutes, config.maxIntervalMinutes);
  let amountMl = roundTo(neededRateMlPerHour * (intervalMinutes / 60), config.roundStepMl);
  amountMl = clamp(amountMl, Math.min(100, remainingMl), maxServingMl);

  const firstDelayMinutes = clamp(intervalMinutes / 2, config.minFirstDelayMinutes, config.maxFirstDelayMinutes);
  let firstAt = addMinutes(input.now, firstDelayMinutes);
  if (input.lastIntakeAt) {
    const cooldownEnd = addMinutes(input.lastIntakeAt, config.cooldownAfterIntakeMinutes);
    if (cooldownEnd > firstAt) firstAt = cooldownEnd;
  }
  if (firstAt > latestReminderAt) return empty("quiet_hours");

  const reminders: ReminderItem[] = [];
  let scheduledMl = 0;
  let cursor = firstAt;
  while (cursor <= latestReminderAt && scheduledMl < remainingMl) {
    const amountForThisReminder = Math.min(amountMl, remainingMl - scheduledMl);
    reminders.push({ id: crypto.randomUUID(), at: new Date(cursor), amountMl: amountForThisReminder });
    scheduledMl += amountForThisReminder;
    cursor = addMinutes(cursor, intervalMinutes);
  }
  const projectedShortfallMl = Math.max(0, remainingMl - scheduledMl);
  return {
    status: projectedShortfallMl > 0 ? "active_with_shortfall" : "active",
    remainingMl,
    baseServingMl,
    maxServingMl,
    intervalMinutes,
    reminders,
    projectedIntakeMl: scheduledMl,
    projectedShortfallMl
  };
}
