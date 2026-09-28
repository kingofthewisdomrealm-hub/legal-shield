/**
 * Josias's gatekeeper → benefits-person phone play.
 * Rapport first, business last. The greeting and small-talk opener depend on the day of the week.
 */

export type DayOpener = { greeting: string; smallTalk: string[] };

const OPENERS: Record<number, DayOpener> = {
  0: { greeting: "Hope you're having a great Sunday!", smallTalk: ["Getting any rest this weekend?"] },
  1: {
    greeting: "Happy Monday!",
    smallTalk: ["How was your weekend?", "Do anything fun?", "Did you survive the Monday traffic?"],
  },
  2: {
    greeting: "Happy Taco Tuesday!",
    smallTalk: ["What are your plans for Taco Tuesday?", "Where's the best taco spot around you?"],
  },
  3: {
    greeting: "Happy Hump Day!",
    smallTalk: ["How's the week treating you so far?", "Over the hump yet?"],
  },
  4: {
    greeting: "Happy almost Friday!",
    smallTalk: ["Have you made any exciting plans for the weekend yet?", "Is the week flying by or dragging?"],
  },
  5: {
    greeting: "Happy Friday – Thank Goodness!",
    smallTalk: ["Have you made any exciting plans for the weekend yet?", "Big plans tonight?"],
  },
  6: { greeting: "Happy Saturday!", smallTalk: ["Enjoying the weekend?"] },
};

/** Returns the greeting + small-talk questions for a given date (uses the date's local weekday). */
export function openerFor(date: Date): DayOpener {
  return OPENERS[date.getDay()];
}

export type ScriptStep = { id: string; title: string; say: string[]; coach: string };

/** Script for the first person who answers (receptionist / front desk). */
export function gatekeeperSteps(date: Date, rapportNotes?: string | null): ScriptStep[] {
  const o = openerFor(date);
  return [
    {
      id: "greet",
      title: "1. Open warm",
      say: [o.greeting],
      coach: "Smile before you dial — they can hear it. Let them respond.",
    },
    {
      id: "rapport",
      title: "2. Get them talking",
      say: [
        ...(rapportNotes ? [`Bring up what you noted last time: "${rapportNotes}"`] : []),
        ...o.smallTalk,
      ],
      coach:
        "Nothing about business yet. Keep it going a minute or so. Read the room: if they're enjoying it, stay; if they're busy, move on. Write down anything personal they share.",
    },
    {
      id: "ask-name",
      title: "3. The ask",
      say: ["Oh, by the way — can you tell me the name of the person that deals with your company benefits?"],
      coach: "Write the name and title down right away.",
    },
    {
      id: "transfer",
      title: "4. Ask to be put through",
      say: [
        "Any chance you could put me through to them? If they don't pick up I'll just leave a quick introduction message.",
      ],
      coach: "If they say no or start asking questions: be short and friendly, then go to step 5.",
    },
    {
      id: "best-time",
      title: "5. If not now",
      say: ["No problem at all — when's the best time to catch them?"],
      coach: "End warm so they like and REMEMBER you. Save their name and what you chatted about for next call.",
    },
  ];
}

/** Script for the benefits decision-maker (HR, benefits manager, or the owner). */
export function decisionMakerSteps(date: Date, rapportNotes?: string | null): ScriptStep[] {
  const o = openerFor(date);
  return [
    { id: "dm-greet", title: "1. Open warm", say: [o.greeting], coach: "Same play as the front desk." },
    {
      id: "dm-rapport",
      title: "2. Talk about life, not business",
      say: [...(rapportNotes ? [`Use your notes: "${rapportNotes}"`] : []), ...o.smallTalk],
      coach: "Push the personal chat as far as it naturally goes. Wait for the moment.",
    },
    {
      id: "dm-reason",
      title: "3. Reason for the call",
      say: [
        "Reason for my call — I'm just calling companies to see how you're protecting your key employees from identity theft with everything going on these days?",
      ],
      coach: "Then stop talking and wait. Most will say they're not doing anything.",
    },
    {
      id: "dm-visit",
      title: "4. Ask for 10 minutes",
      say: [
        "Is there any way I could pop in for just 10 minutes to give you a quick overview of the LegalShield / IDShield identity theft protection plan?",
      ],
      coach: "If yes: lock a date and time. Don't quote prices or coverage details on this call.",
    },
    {
      id: "dm-email",
      title: "5. If no: offer the email",
      say: [
        "No problem — could I email you a short overview instead?",
        "What's the best email? And when would be a good time to follow up and answer any questions?",
      ],
      coach: "Get the email + a follow-up date. Any overview you send must use current official LegalShield material.",
    },
  ];
}
