import { format, getISOWeek } from "date-fns";

export function deriveCycleKey(referenceDate: Date = new Date()): string {
  const year = format(referenceDate, "yyyy");
  const week = String(getISOWeek(referenceDate)).padStart(2, "0");
  return `${year}-W${week}`;
}

export function resolveCycleKey(cycleKey?: string | null, referenceDate?: Date): string {
  if (cycleKey && cycleKey.trim().length > 0) {
    return cycleKey;
  }
  return deriveCycleKey(referenceDate);
}

