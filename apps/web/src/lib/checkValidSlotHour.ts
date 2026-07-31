import { todayISOArgentina } from "../components/ui/formatters";
import type { Slot } from "../types";
import { getTimeNow, timeToMinutes } from "./timeTominutes";

export function checkHourIsValid(arr: Slot[], currentDate: string) {
  // Si no es hoy, todos los slots son válidos (día futuro).
  if (currentDate !== todayISOArgentina()) return arr;

  // Si es hoy, solo mantener los que aún no pasaron.
  const nowMinutes = timeToMinutes(getTimeNow());
  return arr.filter((s) => timeToMinutes(s.startTime) > nowMinutes);
}
