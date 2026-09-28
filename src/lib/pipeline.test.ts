import { describe, expect, it } from "vitest";
import { stageAfterActivity, suppressionKey } from "./pipeline";

describe("stageAfterActivity", () => {
  it("outbound touch moves a new prospect to Contacted", () => {
    expect(stageAfterActivity("PROSPECT", "EMAIL_SENT")).toBe("CONTACTED");
    expect(stageAfterActivity("PROSPECT", "CALL", "GATEKEEPER_ONLY")).toBe("CONTACTED");
  });
  it("never moves backward", () => {
    expect(stageAfterActivity("MEETING_BOOKED", "EMAIL_SENT")).toBe("MEETING_BOOKED");
    expect(stageAfterActivity("QUALIFIED", "EMAIL_RECEIVED")).toBe("QUALIFIED");
  });
  it("reply → Replied, meeting ask → Meeting booked", () => {
    expect(stageAfterActivity("CONTACTED", "EMAIL_RECEIVED")).toBe("REPLIED");
    expect(stageAfterActivity("CONTACTED", "CALL", "BOOK_MEETING")).toBe("MEETING_BOOKED");
  });
  it("opt-out and not-interested → Lost; not now → Follow-up later", () => {
    expect(stageAfterActivity("REPLIED", "EMAIL_RECEIVED", "REMOVE_OPT_OUT")).toBe("LOST");
    expect(stageAfterActivity("CONTACTED", "CALL", "NOT_INTERESTED")).toBe("LOST");
    expect(stageAfterActivity("CONTACTED", "CALL", "NOT_NOW")).toBe("FOLLOW_UP_LATER");
  });
  it("does not auto-reopen a lost prospect on outbound", () => {
    expect(stageAfterActivity("LOST", "EMAIL_SENT")).toBe("LOST");
  });
});

describe("suppressionKey", () => {
  it("normalizes emails, phones, domains", () => {
    expect(suppressionKey(" Bob@Acme.com ")).toEqual({ value: "bob@acme.com", kind: "email" });
    expect(suppressionKey("(772) 555-0100")).toEqual({ value: "7725550100", kind: "phone" });
    expect(suppressionKey("+1 772-555-0100")).toEqual({ value: "7725550100", kind: "phone" });
    expect(suppressionKey("@acme.com")).toEqual({ value: "@acme.com", kind: "domain" });
    expect(suppressionKey("hi")).toBeNull();
  });
});
