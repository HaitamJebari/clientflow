-- DropIndex
DROP INDEX "leads_organizationId_stage_idx";

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "contactId" TEXT;

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "identityKey" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    "website" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contacts_organizationId_idx" ON "contacts"("organizationId");

-- CreateIndex
CREATE INDEX "contacts_organizationId_email_idx" ON "contacts"("organizationId", "email");

-- CreateIndex
CREATE INDEX "contacts_organizationId_phone_idx" ON "contacts"("organizationId", "phone");

-- CreateIndex
CREATE INDEX "contacts_organizationId_company_idx" ON "contacts"("organizationId", "company");

-- CreateIndex
CREATE INDEX "contacts_organizationId_updatedAt_idx" ON "contacts"("organizationId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_organizationId_identityKey_key" ON "contacts"("organizationId", "identityKey");

-- CreateIndex
CREATE INDEX "leads_organizationId_contactId_idx" ON "leads"("organizationId", "contactId");

-- CreateIndex
CREATE INDEX "leads_organizationId_stage_updatedAt_idx" ON "leads"("organizationId", "stage", "updatedAt");

-- CreateIndex
CREATE INDEX "leads_organizationId_stage_valueCents_idx" ON "leads"("organizationId", "stage", "valueCents");

-- CreateIndex
CREATE INDEX "leads_organizationId_updatedAt_idx" ON "leads"("organizationId", "updatedAt");

-- CreateIndex
CREATE INDEX "leads_organizationId_company_idx" ON "leads"("organizationId", "company");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
