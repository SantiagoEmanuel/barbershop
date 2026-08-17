import { timeNowInBusinessTimeZone } from "@config/utils";

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

export function getTimeNow() {
  return timeNowInBusinessTimeZone();
}
