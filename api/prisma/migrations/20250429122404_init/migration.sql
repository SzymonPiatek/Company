/*
  Warnings:

  - You are about to drop the column `currentLocationId` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ResourceLocationHistory` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ResourceLocationHistory` table. All the data in the column will be lost.
  - You are about to drop the `WarehouseLocation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Resource" DROP CONSTRAINT "Resource_currentLocationId_fkey";

-- DropForeignKey
ALTER TABLE "ResourceLocationHistory" DROP CONSTRAINT "ResourceLocationHistory_fromLocationId_fkey";

-- DropForeignKey
ALTER TABLE "ResourceLocationHistory" DROP CONSTRAINT "ResourceLocationHistory_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "ResourceLocationHistory" DROP CONSTRAINT "ResourceLocationHistory_toLocationId_fkey";

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "currentLocationId";

-- AlterTable
ALTER TABLE "ResourceLocationHistory" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- DropTable
DROP TABLE "WarehouseLocation";

-- CreateTable
CREATE TABLE "ResourceLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignedResource" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignedResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssignedResource_resourceId_idx" ON "AssignedResource"("resourceId");

-- CreateIndex
CREATE INDEX "AssignedResource_locationId_idx" ON "AssignedResource"("locationId");

-- AddForeignKey
ALTER TABLE "AssignedResource" ADD CONSTRAINT "AssignedResource_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "ResourceLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceLocationHistory" ADD CONSTRAINT "ResourceLocationHistory_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "ResourceLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceLocationHistory" ADD CONSTRAINT "ResourceLocationHistory_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "ResourceLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
