/*
  Warnings:

  - You are about to drop the column `dpi` on the `User` table. All the data in the column will be lost.
  - The `rol` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USUARIO', 'DOCENTE', 'ADMIN');

-- DropIndex
DROP INDEX "User_dpi_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "dpi",
ADD COLUMN     "contactoEmergencia" TEXT,
ADD COLUMN     "dni" TEXT,
ADD COLUMN     "requiresPasswordChange" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "telefonoEmergencia" TEXT,
DROP COLUMN "rol",
ADD COLUMN     "rol" "UserRole" NOT NULL DEFAULT 'USUARIO';
