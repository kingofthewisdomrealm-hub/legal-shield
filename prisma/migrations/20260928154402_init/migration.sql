-- CreateEnum
CREATE TYPE "OpportunityType" AS ENUM ('BUSINESS', 'GROUP', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('PROSPECT', 'CONTACTED', 'REPLIED', 'QUALIFIED', 'MEETING_BOOKED', 'PRESENTED', 'ENROLLMENT_LINK_SENT', 'ENROLLED', 'LOST', 'FOLLOW_UP_LATER');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('EMAIL_SENT', 'EMAIL_RECEIVED', 'CALL', 'LINKEDIN', 'CONTACT_FORM', 'MEETING', 'NOTE', 'STAGE_CHANGE');

-- CreateEnum
CREATE TYPE "Outcome" AS ENUM ('INTERESTED', 'NEEDS_INFORMATION', 'NOT_NOW', 'NOT_INTERESTED', 'WRONG_PERSON', 'REFERRAL', 'BOOK_MEETING', 'REMOVE_OPT_OUT', 'UNKNOWN', 'NO_ANSWER', 'LEFT_VOICEMAIL', 'GATEKEEPER_ONLY');

-- CreateTable
CREATE TABLE "Prospect" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "website" TEXT,
    "contactName" TEXT,
    "title" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "linkedin" TEXT,
    "city" TEXT,
    "state" TEXT,
    "industry" TEXT,
    "employeeEstimate" INTEGER,
    "employeeIsEstimate" BOOLEAN NOT NULL DEFAULT true,
    "type" "OpportunityType" NOT NULL DEFAULT 'UNKNOWN',
    "qualificationScore" INTEGER,
    "whyContacted" TEXT,
    "source" TEXT,
    "stage" "Stage" NOT NULL DEFAULT 'PROSPECT',
    "firstContactAt" TIMESTAMP(3),
    "lastContactAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "notes" TEXT,
    "gatekeeperName" TEXT,
    "benefitsContactName" TEXT,
    "benefitsContactTitle" TEXT,
    "bestTimeToCall" TEXT,
    "rapportNotes" TEXT,
    "optedOut" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "outcome" "Outcome",
    "summary" TEXT NOT NULL,
    "body" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suppression" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Suppression_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Prospect_stage_idx" ON "Prospect"("stage");

-- CreateIndex
CREATE INDEX "Prospect_nextFollowUpAt_idx" ON "Prospect"("nextFollowUpAt");

-- CreateIndex
CREATE INDEX "Prospect_email_idx" ON "Prospect"("email");

-- CreateIndex
CREATE INDEX "Activity_prospectId_occurredAt_idx" ON "Activity"("prospectId", "occurredAt");

-- CreateIndex
CREATE INDEX "Activity_type_occurredAt_idx" ON "Activity"("type", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "Suppression_value_key" ON "Suppression"("value");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE CASCADE ON UPDATE CASCADE;
