import {
  businessDate,
  businessDayEnd,
  businessDayStart,
  dayOfWeekForBusinessDate,
  dayOfWeekInBusinessTimeZone,
} from "@config/utils";
import { describe, expect, it } from "vitest";

describe("date utility", () => {
  it("mantiene el contrato 0 domingo … 6 sábado", () => {
    expect(dayOfWeekForBusinessDate("2026-08-16")).toBe(0);
    expect(dayOfWeekForBusinessDate("2026-08-17")).toBe(1);
    expect(dayOfWeekForBusinessDate("2026-08-22")).toBe(6);
  });

  it("calcula el día operativo en Argentina, no en UTC", () => {
    expect(businessDate(new Date("2026-08-15T02:59:59.999Z"))).toBe(
      "2026-08-14",
    );
    expect(businessDate(new Date("2026-08-15T03:00:00.000Z"))).toBe(
      "2026-08-15",
    );
    expect(dayOfWeekInBusinessTimeZone(new Date("2026-08-16T03:30:00Z"))).toBe(
      0,
    );
  });

  it("convierte los límites del día argentino a instantes UTC", () => {
    expect(businessDayStart("2026-08-15").toISOString()).toBe(
      "2026-08-15T03:00:00.000Z",
    );
    expect(businessDayEnd("2026-08-15").toISOString()).toBe(
      "2026-08-16T02:59:59.999Z",
    );
  });
});
