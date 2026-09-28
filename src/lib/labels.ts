import type { ActivityType, OpportunityType, Outcome, Stage } from "@prisma/client";

export const STAGES: Stage[] = [
  "PROSPECT",
  "CONTACTED",
  "REPLIED",
  "QUALIFIED",
  "MEETING_BOOKED",
  "PRESENTED",
  "ENROLLMENT_LINK_SENT",
  "ENROLLED",
  "LOST",
  "FOLLOW_UP_LATER",
];

export const STAGE_LABEL: Record<Stage, string> = {
  PROSPECT: "Prospect",
  CONTACTED: "Contacted",
  REPLIED: "Replied",
  QUALIFIED: "Qualified",
  MEETING_BOOKED: "Meeting booked",
  PRESENTED: "Presented",
  ENROLLMENT_LINK_SENT: "Enrollment link sent",
  ENROLLED: "Enrolled",
  LOST: "Lost",
  FOLLOW_UP_LATER: "Follow-up later",
};

export const TYPE_LABEL: Record<OpportunityType, string> = {
  BUSINESS: "Business",
  GROUP: "Group",
  UNKNOWN: "Not sure yet",
};

export const ACTIVITY_LABEL: Record<ActivityType, string> = {
  EMAIL_SENT: "Email sent",
  EMAIL_RECEIVED: "Email received",
  CALL: "Phone call",
  LINKEDIN: "LinkedIn",
  CONTACT_FORM: "Contact form",
  MEETING: "Meeting",
  NOTE: "Note",
  STAGE_CHANGE: "Stage change",
};

export const OUTCOME_LABEL: Record<Outcome, string> = {
  INTERESTED: "Interested",
  NEEDS_INFORMATION: "Needs information",
  NOT_NOW: "Not now",
  NOT_INTERESTED: "Not interested",
  WRONG_PERSON: "Wrong person",
  REFERRAL: "Referral",
  BOOK_MEETING: "Book meeting",
  REMOVE_OPT_OUT: "Remove / opt out",
  UNKNOWN: "Unknown",
  NO_ANSWER: "No answer",
  LEFT_VOICEMAIL: "Left voicemail",
  GATEKEEPER_ONLY: "Talked to gatekeeper only",
};

/** Outcomes that count as a "positive reply" on the dashboard. */
export const POSITIVE_OUTCOMES: Outcome[] = ["INTERESTED", "NEEDS_INFORMATION", "BOOK_MEETING", "REFERRAL"];

/** Activity types that count as "outreach sent". */
export const OUTBOUND_TYPES: ActivityType[] = ["EMAIL_SENT", "CALL", "LINKEDIN", "CONTACT_FORM"];
