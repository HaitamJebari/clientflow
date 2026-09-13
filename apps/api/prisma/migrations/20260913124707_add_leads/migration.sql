-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "LeadTemperature" AS ENUM ('HOT', 'WARM', 'COLD');

-- CreateEnum
CREATE TYPE "LeadQualification" AS ENUM ('UNASSESSED', 'STRONG_FIT', 'GOOD_FIT', 'WEAK_FIT', 'UNQUALIFIED');

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    "website" TEXT,
    "source" TEXT,
    "stage" "LeadStage" NOT NULL DEFAULT 'NEW',
    "temperature" "LeadTemperature",
    "qualification" "LeadQualification" NOT NULL DEFAULT 'UNASSESSED',
    "valueCents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "notes" TEXT,
    "lastActivityAt" TIMESTAMP(3),
    "lastContactedAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "aiSummary" TEXT,
    "aiNextBestAction" TEXT,
    "aiInformationConfidence" INTEGER,
    "aiRisks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aiMissingInformation" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aiUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leads_organizationId_idx" ON "leads"("organizationId");

-- CreateIndex
CREATE INDEX "leads_organizationId_stage_idx" ON "leads"("organizationId", "stage");

-- CreateIndex
CREATE INDEX "leads_organizationId_temperature_idx" ON "leads"("organizationId", "temperature");

-- CreateIndex
CREATE INDEX "leads_organizationId_qualification_idx" ON "leads"("organizationId", "qualification");

-- CreateIndex
CREATE INDEX "leads_organizationId_email_idx" ON "leads"("organizationId", "email");

-- CreateIndex
CREATE INDEX "leads_organizationId_nextFollowUpAt_idx" ON "leads"("organizationId", "nextFollowUpAt");

-- CreateIndex
CREATE INDEX "leads_organizationId_createdAt_idx" ON "leads"("organizationId", "createdAt");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
