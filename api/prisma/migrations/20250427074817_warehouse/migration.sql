-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "currentLocationId" TEXT;

-- CreateTable
CREATE TABLE "WarehouseLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WarehouseLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceLocationHistory" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "fromLocationId" TEXT,
    "toLocationId" TEXT NOT NULL,
    "movedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceLocationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResourceLocationHistory_resourceId_idx" ON "ResourceLocationHistory"("resourceId");

-- CreateIndex
CREATE INDEX "ResourceLocationHistory_fromLocationId_idx" ON "ResourceLocationHistory"("fromLocationId");

-- CreateIndex
CREATE INDEX "ResourceLocationHistory_toLocationId_idx" ON "ResourceLocationHistory"("toLocationId");

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_currentLocationId_fkey" FOREIGN KEY ("currentLocationId") REFERENCES "WarehouseLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceLocationHistory" ADD CONSTRAINT "ResourceLocationHistory_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceLocationHistory" ADD CONSTRAINT "ResourceLocationHistory_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "WarehouseLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceLocationHistory" ADD CONSTRAINT "ResourceLocationHistory_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "WarehouseLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
