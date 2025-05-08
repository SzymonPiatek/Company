/*
  Warnings:

  - Added the required column `action` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "action" TEXT NOT NULL,
ADD COLUMN     "subject" TEXT NOT NULL;
