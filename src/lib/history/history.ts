import type { DailyTargetRecord, IntakeEntryRecord } from "$lib/db/schema";
import { shiftDayKey } from "$lib/db/hydration-day";

export const STREAK_THRESHOLD = 0.9;
export interface HistoryDay { dayKey:string; consumedMl:number; targetMl:number|null; percentage:number|null; reached:boolean; }
export interface HistorySummary { days:HistoryDay[]; averageConsumedMl:number; averagePercentage:number; reachedDays:number; streak:number; }

export function buildHistorySummary(currentDayKey:string, dayCount:number, intakes:IntakeEntryRecord[], targets:DailyTargetRecord[]):HistorySummary {
  const targetMap = new Map(targets.map((item) => [item.hydrationDayKey, item]));
  const consumedMap = new Map<string, number>();
  for (const intake of intakes) consumedMap.set(intake.hydrationDayKey, (consumedMap.get(intake.hydrationDayKey) ?? 0) + intake.amountMl);
  const days:HistoryDay[] = [];
  for (let offset = dayCount - 1; offset >= 0; offset--) {
    const dayKey = shiftDayKey(currentDayKey, -offset);
    const consumedMl = consumedMap.get(dayKey) ?? 0;
    const targetMl = targetMap.get(dayKey)?.plainWaterGoalMl ?? null;
    const ratio = targetMl && targetMl > 0 ? consumedMl / targetMl : null;
    days.push({ dayKey, consumedMl, targetMl, percentage: ratio === null ? null : Math.min(1, ratio), reached: ratio !== null && ratio >= STREAK_THRESHOLD });
  }
  const averageConsumedMl = Math.round(days.reduce((t,d) => t + d.consumedMl, 0) / dayCount);
  const targetDays = days.filter((d) => d.targetMl && d.targetMl > 0);
  const averagePercentage = targetDays.length ? targetDays.reduce((t,d) => t + (d.percentage ?? 0), 0) / targetDays.length : 0;
  const reachedDays = days.filter((d) => d.reached).length;
  let index = days.length - 1;
  if (index >= 0 && !days[index].reached) index--;
  let streak = 0;
  while (index >= 0 && days[index].reached) { streak++; index--; }
  return { days, averageConsumedMl, averagePercentage, reachedDays, streak };
}
