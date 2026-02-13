-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "LocationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PointType" AS ENUM ('NEW', 'EDIT');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

-- AlterTable - drop the old string columns and images
ALTER TABLE "Location" 
DROP COLUMN "status",
DROP COLUMN "pointType",
DROP COLUMN "images",
DROP COLUMN "photoConfidence";

-- AlterTable - add back with proper types
ALTER TABLE "Location"
ADD COLUMN "status" "LocationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "pointType" "PointType" NOT NULL DEFAULT 'NEW',
ADD COLUMN "photoConfidence" INTEGER NOT NULL DEFAULT 100;

-- CreateTable LocationImage
CREATE TABLE "LocationImage" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocationImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LocationImage_locationId_idx" ON "LocationImage"("locationId");

-- AddForeignKey
ALTER TABLE "LocationImage" ADD CONSTRAINT "LocationImage_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
