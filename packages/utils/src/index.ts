export const BUSINESS_TIME_ZONE = "America/Argentina/Buenos_Aires";

const BUSINESS_UTC_OFFSET = "-03:00";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

/** Fecha calendario de la operación en Argentina (YYYY-MM-DD). */
export function businessDate(date: Date = new Date()): string {
  const parts = dateParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function todayISO(): string {
  return businessDate();
}

/** Índice compatible con JavaScript: 0 domingo … 6 sábado. */
export function dayOfWeekInBusinessTimeZone(date: Date = new Date()): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    weekday: "short",
  }).format(date);

  return WEEKDAYS.indexOf(weekday);
}

/** Obtiene el día de semana de una fecha calendario sin depender del huso local. */
export function dayOfWeekForBusinessDate(isoDate: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) throw new Error("Fecha inválida. Usar YYYY-MM-DD");

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day, 12));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("Fecha inválida. Usar YYYY-MM-DD");
  }

  return date.getUTCDay();
}

export function isValidBusinessDate(value: string): boolean {
  try {
    dayOfWeekForBusinessDate(value);
    return true;
  } catch {
    return false;
  }
}

export function timeNowInBusinessTimeZone(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BUSINESS_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return `${hour}:${minute}`;
}

export function businessDayStart(isoDate: string): Date {
  if (!isValidBusinessDate(isoDate)) {
    throw new Error("Fecha inválida. Usar YYYY-MM-DD");
  }
  return new Date(`${isoDate}T00:00:00.000${BUSINESS_UTC_OFFSET}`);
}

export function businessDayEnd(isoDate: string): Date {
  if (!isValidBusinessDate(isoDate)) {
    throw new Error("Fecha inválida. Usar YYYY-MM-DD");
  }
  return new Date(`${isoDate}T23:59:59.999${BUSINESS_UTC_OFFSET}`);
}

export function businessMonthRange(date: Date = new Date()) {
  const current = businessDate(date);
  const [year = 0, month = 0] = current.split("-").map(Number);
  const monthValue = String(month).padStart(2, "0");
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return {
    from: businessDayStart(`${year}-${monthValue}-01`),
    to: businessDayEnd(
      `${year}-${monthValue}-${String(lastDay).padStart(2, "0")}`,
    ),
  };
}

export function addBusinessDays(isoDate: string, amount: number): string {
  if (!isValidBusinessDate(isoDate)) {
    throw new Error("Fecha inválida. Usar YYYY-MM-DD");
  }
  const [year = 0, month = 0, day = 0] = isoDate.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + amount, 12));
  return `${result.getUTCFullYear()}-${String(result.getUTCMonth() + 1).padStart(2, "0")}-${String(result.getUTCDate()).padStart(2, "0")}`;
}

export function formatBusinessDateTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: BUSINESS_TIME_ZONE,
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function formatBusinessCalendarDate(isoDate: string): string {
  if (!isValidBusinessDate(isoDate)) {
    throw new Error("Fecha inválida. Usar YYYY-MM-DD");
  }

  return new Intl.DateTimeFormat("es-AR", {
    timeZone: BUSINESS_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${isoDate}T12:00:00${BUSINESS_UTC_OFFSET}`));
}

// Compatibilidad con el nombre anterior usado por integraciones antiguas.
export const todayISOArgentina = todayISO;
