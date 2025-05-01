/*
  Warnings:

  - A unique constraint covering the columns `[resourceId]` on the table `AssignedResource` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AssignedResource_resourceId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "AssignedResource_resourceId_key" ON "AssignedResource"("resourceId");
