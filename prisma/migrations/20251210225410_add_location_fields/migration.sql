-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "belongsToRoute" TEXT,
ADD COLUMN     "formalPlaceName" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "photoConfidence" TEXT NOT NULL DEFAULT '100',
ADD COLUMN     "pointType" TEXT NOT NULL DEFAULT 'new',
ADD COLUMN     "side" TEXT,
ADD COLUMN     "street" TEXT;
