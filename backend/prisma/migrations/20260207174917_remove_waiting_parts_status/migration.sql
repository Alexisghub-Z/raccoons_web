-- RemoveWaitingPartsStatus
-- Update any existing services with WAITING_PARTS status to IN_REPAIR
UPDATE "services" SET "status" = 'IN_REPAIR' WHERE "status" = 'WAITING_PARTS';
UPDATE "service_history" SET "status" = 'IN_REPAIR' WHERE "status" = 'WAITING_PARTS';

-- Remove default constraint first
ALTER TABLE "services" ALTER COLUMN "status" DROP DEFAULT;

-- Remove WAITING_PARTS from the enum
ALTER TYPE "ServiceStatus" RENAME TO "ServiceStatus_old";
CREATE TYPE "ServiceStatus" AS ENUM ('RECEIVED', 'IN_DIAGNOSIS', 'IN_REPAIR', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED');
ALTER TABLE "services" ALTER COLUMN "status" TYPE "ServiceStatus" USING "status"::text::"ServiceStatus";
ALTER TABLE "service_history" ALTER COLUMN "status" TYPE "ServiceStatus" USING "status"::text::"ServiceStatus";
DROP TYPE "ServiceStatus_old";

-- Restore default
ALTER TABLE "services" ALTER COLUMN "status" SET DEFAULT 'RECEIVED'::"ServiceStatus";
