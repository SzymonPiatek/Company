/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ResourceLocation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ResourceLocation_name_key" ON "ResourceLocation"("name");
