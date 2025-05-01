/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Resource` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Resource_code_key" ON "Resource"("code");
