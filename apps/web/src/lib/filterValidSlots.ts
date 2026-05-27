import type { Slot } from "../types";
function toMin(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function toTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
export function filterValidSlots(slots: Slot[], duration: number): Slot[] {
  if (slots.length === 0) return [];
  const effectiveDuration = Math.max(duration, 30);
  const rawStep =
    slots.length >= 2
      ? toMin(slots[1]!.startTime) - toMin(slots[0]!.startTime)
      : 10;
  const slotsNeeded = Math.ceil(effectiveDuration / rawStep);
  const startTimes = new Set(slots.map((s) => s.startTime));
  const valid: Slot[] = [];
  for (let i = 0; i < slots.length; i++) {
    const candidate = slots[i]!;
    const startMin = toMin(candidate.startTime);
    let consecutive = true;
    for (let k = 1; k < slotsNeeded; k++) {
      const needed = toTime(startMin + k * rawStep);
      if (!startTimes.has(needed)) {
        consecutive = false;
        break;
      }
    }
    if (consecutive) {
      valid.push({
        startTime: candidate.startTime,
        endTime: toTime(startMin + effectiveDuration),
      });
    }
  }
  return valid;
}
