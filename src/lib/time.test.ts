import { describe, expect, it } from "vitest";
import { startOfTodayInTz } from "./time";

describe("startOfTodayInTz", () => {
  it("11:40 AM New York (EDT) → midnight New York = 04:00 UTC", () => {
    const now = new Date("2026-09-28T15:40:00Z");
    expect(startOfTodayInTz(now, "America/New_York").toISOString()).toBe("2026-09-28T04:00:00.000Z");
  });
  it("1 AM UTC is still the previous day in New York", () => {
    const now = new Date("2026-09-29T01:00:00Z");
    expect(startOfTodayInTz(now, "America/New_York").toISOString()).toBe("2026-09-28T04:00:00.000Z");
  });
});
