-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FollowUpChannel" AS ENUM ('EMAIL', 'CALL', 'WHATSAPP', 'LINKEDIN', 'OTHER');

-- CreateTable
CREATE TABLE "follow_ups" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "contactId" TEXT,
    "channel" "FollowUpChannel" NOT NULL DEFAULT 'EMAIL',
    "status" "FollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "subject" TEXT,
    "draftMessage" TEXT,
    "reason" TEXT,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "follow_ups_organizationId_idx" ON "follow_ups"("organizationId");

-- CreateIndex
CREATE INDEX "follow_ups_organizationId_status_scheduledFor_idx" ON "follow_ups"("organizationId", "status", "scheduledFor");

-- CreateIndex
CREATE INDEX "follow_ups_organizationId_leadId_idx" ON "follow_ups"("organizationId", "leadId");

-- CreateIndex
CREATE INDEX "follow_ups_organizationId_contactId_idx" ON "follow_ups"("organizationId", "contactId");

-- CreateIndex
CREATE INDEX "follow_ups_organizationId_createdAt_idx" ON "follow_ups"("organizationId", "createdAt");

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
