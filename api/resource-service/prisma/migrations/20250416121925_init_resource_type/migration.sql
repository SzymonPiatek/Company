/*
  Warnings:

  - You are about to drop the column `available` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ResourceType` table. All the data in the column will be lost.
  - You are about to drop the column `schema` on the `ResourceType` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `ResourceType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `ResourceType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Resource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `ResourceType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "available",
DROP COLUMN "location",
DROP COLUMN "metadata",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ResourceType" DROP COLUMN "description",
DROP COLUMN "schema",
ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ResourceType_name_key" ON "ResourceType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceType_code_key" ON "ResourceType"("code");
