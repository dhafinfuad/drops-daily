export function parseTime(value: string): [number, number] {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error(`Invalid HH:mm time: ${value}`);

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error(`Invalid HH:mm time: ${value}`);
  }

  return [hour, minute];
}

export function formatLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getHydrationDayKey(date: Date, wakeTime: string): string {
  const [wakeHour, wakeMinute] = parseTime(wakeTime);
  const localMinutes = date.getHours() * 60 + date.getMinutes();
  const wakeMinutes = wakeHour * 60 + wakeMinute;

  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (localMinutes < wakeMinutes) {
    day.setDate(day.getDate() - 1);
  }

  return formatLocalDateKey(day);
}

export function getUtcOffsetMinutes(date: Date): number {
  return -date.getTimezoneOffset();
}

export function shiftDayKey(dayKey: string, deltaDays: number): string {
  const [year, month, day] = dayKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + deltaDays);
  return formatLocalDateKey(date);
}

export interface WeekDayInfo {
  dayKey: string;
  date: Date;
  dateNumber: number;
  weekdayInitial: string;
  isToday: boolean;
}

export function getWeekDaysForDayKey(
  dayKey: string,
  todayKey: string
): WeekDayInfo[] {
  const [year, month, day] = dayKey.split("-").map(Number);
  const refDate = new Date(year, month - 1, day);
  const dayOfWeek = refDate.getDay(); // 0 is Sunday, 6 is Saturday
  const sunday = new Date(year, month - 1, day - dayOfWeek);

  const initials = ["S", "M", "T", "W", "T", "F", "S"];
  const result: WeekDayInfo[] = [];

  for (let i = 0; i < 7; i++) {
    const curDate = new Date(
      sunday.getFullYear(),
      sunday.getMonth(),
      sunday.getDate() + i
    );
    const curKey = formatLocalDateKey(curDate);
    result.push({
      dayKey: curKey,
      date: curDate,
      dateNumber: curDate.getDate(),
      weekdayInitial: initials[i],
      isToday: curKey === todayKey
    });
  }

  return result;
}

function dateAtLocalTime(
  base: Date,
  hour: number,
  minute: number,
  dayOffset = 0
): Date {
  const value = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    hour,
    minute,
    0,
    0
  );

  if (dayOffset !== 0) {
    value.setDate(value.getDate() + dayOffset);
  }

  return value;
}

export interface ActivePeriod {
  active: boolean;
  wakeAt: Date;
  sleepAt: Date;
  nextWakeAt: Date;
}

/**
 * Determines whether `now` is inside the configured waking period.
 * Supports schedules that cross midnight, e.g. 18:00 -> 02:00.
 */
export function getActivePeriod(
  now: Date,
  wakeTime: string,
  sleepTime: string
): ActivePeriod {
  const [wakeHour, wakeMinute] = parseTime(wakeTime);
  const [sleepHour, sleepMinute] = parseTime(sleepTime);

  const wakeMinutes = wakeHour * 60 + wakeMinute;
  const sleepMinutes = sleepHour * 60 + sleepMinute;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (wakeMinutes === sleepMinutes) {
    const wakeAt = dateAtLocalTime(now, wakeHour, wakeMinute);
    return {
      active: false,
      wakeAt,
      sleepAt: wakeAt,
      nextWakeAt:
        now < wakeAt
          ? wakeAt
          : dateAtLocalTime(now, wakeHour, wakeMinute, 1)
    };
  }

  // Same-day waking period, e.g. 06:00 -> 22:00.
  if (wakeMinutes < sleepMinutes) {
    const todayWake = dateAtLocalTime(now, wakeHour, wakeMinute);
    const todaySleep = dateAtLocalTime(now, sleepHour, sleepMinute);

    if (now >= todayWake && now < todaySleep) {
      return {
        active: true,
        wakeAt: todayWake,
        sleepAt: todaySleep,
        nextWakeAt: dateAtLocalTime(now, wakeHour, wakeMinute, 1)
      };
    }

    if (now < todayWake) {
      return {
        active: false,
        wakeAt: dateAtLocalTime(now, wakeHour, wakeMinute, -1),
        sleepAt: dateAtLocalTime(now, sleepHour, sleepMinute, -1),
        nextWakeAt: todayWake
      };
    }

    return {
      active: false,
      wakeAt: todayWake,
      sleepAt: todaySleep,
      nextWakeAt: dateAtLocalTime(now, wakeHour, wakeMinute, 1)
    };
  }

  // Waking period crosses midnight, e.g. 18:00 -> 02:00.
  const todayWake = dateAtLocalTime(now, wakeHour, wakeMinute);
  const todaySleep = dateAtLocalTime(now, sleepHour, sleepMinute);

  if (nowMinutes >= wakeMinutes) {
    return {
      active: true,
      wakeAt: todayWake,
      sleepAt: dateAtLocalTime(now, sleepHour, sleepMinute, 1),
      nextWakeAt: dateAtLocalTime(now, wakeHour, wakeMinute, 1)
    };
  }

  if (nowMinutes < sleepMinutes) {
    return {
      active: true,
      wakeAt: dateAtLocalTime(now, wakeHour, wakeMinute, -1),
      sleepAt: todaySleep,
      nextWakeAt: todayWake
    };
  }

  return {
    active: false,
    wakeAt: dateAtLocalTime(now, wakeHour, wakeMinute, -1),
    sleepAt: todaySleep,
    nextWakeAt: todayWake
  };
}

export function isValidWakeSleepPair(
  wakeTime: string,
  sleepTime: string
): boolean {
  return wakeTime !== sleepTime;
}
