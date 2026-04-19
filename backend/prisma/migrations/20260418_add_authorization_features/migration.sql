-- Add AUTHORIZATION_ANSWERED to NotificationType enum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'AUTHORIZATION_ANSWERED';

-- Create AuthorizationResponse enum
DO $$ BEGIN
  CREATE TYPE "AuthorizationResponse" AS ENUM ('PENDING', 'AUTHORIZED', 'REJECTED', 'WHATSAPP_CONTACT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create authorization_questions table
CREATE TABLE IF NOT EXISTS "authorization_questions" (
  "id"              TEXT NOT NULL,
  "serviceId"       TEXT NOT NULL,
  "question"        TEXT NOT NULL,
  "response"        "AuthorizationResponse" NOT NULL DEFAULT 'PENDING',
  "customerMessage" TEXT,
  "adminMessage"    TEXT,
  "adminMessageAt"  TIMESTAMP(3),
  "respondedAt"     TIMESTAMP(3),
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "authorization_questions_pkey" PRIMARY KEY ("id")
);

-- Create authorization_attachments table
CREATE TABLE IF NOT EXISTS "authorization_attachments" (
  "id"         TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "type"       TEXT NOT NULL,
  "url"        TEXT NOT NULL,
  "filename"   TEXT NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "authorization_attachments_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
DO $$ BEGIN
  ALTER TABLE "authorization_questions"
    ADD CONSTRAINT "authorization_questions_serviceId_fkey"
    FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "authorization_attachments"
    ADD CONSTRAINT "authorization_attachments_questionId_fkey"
    FOREIGN KEY ("questionId") REFERENCES "authorization_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS "authorization_questions_serviceId_idx" ON "authorization_questions"("serviceId");

-- Add adminMessageAt to existing installations (no-op if table was just created)
ALTER TABLE "authorization_questions" ADD COLUMN IF NOT EXISTS "adminMessageAt" TIMESTAMP(3);
