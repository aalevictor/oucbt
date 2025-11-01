/*
  Warnings:

  - You are about to alter the column `status` on the `votantes` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Enum(EnumId(1))`.
  - Added the required column `dataNascimento` to the `votantes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `votantes` ADD COLUMN `dataNascimento` DATE NOT NULL,
    MODIFY `status` ENUM('EM_ANALISE', 'DEFERIDO', 'INDEFERIDO') NOT NULL DEFAULT 'EM_ANALISE';
