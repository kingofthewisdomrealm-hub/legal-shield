import { describe, expect, it } from "vitest";
import { decisionMakerSteps, gatekeeperSteps, openerFor } from "./callScript";

// new Date(y, m, d) uses local time, same as getDay().
describe("openerFor", () => {
  it.each([
    [new Date(2026, 8, 28), "Happy Monday!"],
    [new Date(2026, 8, 29), "Happy Taco Tuesday!"],
    [new Date(2026, 8, 30), "Happy Hump Day!"],
    [new Date(2026, 9, 1), "Happy almost Friday!"],
    [new Date(2026, 9, 2), "Happy Friday – Thank Goodness!"],
  ])("%s → %s", (date, greeting) => {
    expect(openerFor(date).greeting).toBe(greeting);
  });
});

describe("scripts", () => {
  it("puts saved rapport notes first in the small-talk step", () => {
    const steps = gatekeeperSteps(new Date(2026, 8, 28), "daughter plays softball");
    expect(steps[1].say[0]).toContain("daughter plays softball");
  });
  it("gatekeeper script asks for the benefits person", () => {
    expect(gatekeeperSteps(new Date()).some((s) => s.say.join(" ").includes("deals with your company benefits"))).toBe(true);
  });
  it("decision-maker script asks for 10 minutes and has an email fallback", () => {
    const text = decisionMakerSteps(new Date()).map((s) => s.say.join(" ")).join(" ");
    expect(text).toContain("10 minutes");
    expect(text).toContain("email");
  });
});
