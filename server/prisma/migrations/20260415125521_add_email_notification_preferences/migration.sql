-- AlterTable
ALTER TABLE "User" ADD COLUMN     "budgetAlertsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "digestEmailFrequency" TEXT NOT NULL DEFAULT 'weekly',
ADD COLUMN     "emailNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "goalsNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastDigestEmailSentAt" TIMESTAMP(3);
