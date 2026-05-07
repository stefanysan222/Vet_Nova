/*
  Warnings:

  - You are about to drop the column `id_rol` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `propietarios` will be added. If there are existing duplicate values, this will fail.
  - Made the column `fecha` on table `citas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hora` on table `citas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `estado` on table `citas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_mascota` on table `citas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_usuario` on table `citas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fecha` on table `consultas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_historia` on table `consultas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_usuario` on table `consultas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_factura` on table `detalle_productos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_producto` on table `detalle_productos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cantidad` on table `detalle_productos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `precio_unitario` on table `detalle_productos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_factura` on table `detalle_servicios` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_servicio` on table `detalle_servicios` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cantidad` on table `detalle_servicios` required. This step will fail if there are existing NULL values in that column.
  - Made the column `precio_unitario` on table `detalle_servicios` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fecha` on table `facturas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `total` on table `facturas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_propietario` on table `facturas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_mascota` on table `facturas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_mascota` on table `historias_clinicas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fecha_creacion` on table `historias_clinicas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nombre` on table `mascotas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `especie` on table `mascotas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `raza` on table `mascotas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `edad` on table `mascotas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_propietario` on table `mascotas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tipo` on table `movimientos_inventario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cantidad` on table `movimientos_inventario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fecha` on table `movimientos_inventario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_producto` on table `movimientos_inventario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nombre` on table `productos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tipo` on table `productos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `precio` on table `productos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stock` on table `productos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nombre` on table `propietarios` required. This step will fail if there are existing NULL values in that column.
  - Made the column `telefono` on table `propietarios` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `propietarios` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mensaje` on table `recordatorios` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fecha_recordatorio` on table `recordatorios` required. This step will fail if there are existing NULL values in that column.
  - Made the column `estado` on table `recordatorios` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_mascota` on table `recordatorios` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fecha` on table `registro_vacunas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `proxima_fecha` on table `registro_vacunas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_mascota` on table `registro_vacunas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_vacuna` on table `registro_vacunas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nombre` on table `servicios` required. This step will fail if there are existing NULL values in that column.
  - Made the column `precio` on table `servicios` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nombre` on table `usuarios` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nombre` on table `vacunas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `frecuencia_dias` on table `vacunas` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'VETERINARIO', 'ASISTENTE');

-- DropForeignKey
ALTER TABLE "citas" DROP CONSTRAINT "citas_id_mascota_fkey";

-- DropForeignKey
ALTER TABLE "citas" DROP CONSTRAINT "citas_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "consultas" DROP CONSTRAINT "consultas_id_historia_fkey";

-- DropForeignKey
ALTER TABLE "consultas" DROP CONSTRAINT "consultas_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "detalle_productos" DROP CONSTRAINT "detalle_productos_id_factura_fkey";

-- DropForeignKey
ALTER TABLE "detalle_productos" DROP CONSTRAINT "detalle_productos_id_producto_fkey";

-- DropForeignKey
ALTER TABLE "detalle_servicios" DROP CONSTRAINT "detalle_servicios_id_factura_fkey";

-- DropForeignKey
ALTER TABLE "detalle_servicios" DROP CONSTRAINT "detalle_servicios_id_servicio_fkey";

-- DropForeignKey
ALTER TABLE "facturas" DROP CONSTRAINT "facturas_id_mascota_fkey";

-- DropForeignKey
ALTER TABLE "facturas" DROP CONSTRAINT "facturas_id_propietario_fkey";

-- DropForeignKey
ALTER TABLE "historias_clinicas" DROP CONSTRAINT "historias_clinicas_id_mascota_fkey";

-- DropForeignKey
ALTER TABLE "mascotas" DROP CONSTRAINT "mascotas_id_propietario_fkey";

-- DropForeignKey
ALTER TABLE "movimientos_inventario" DROP CONSTRAINT "movimientos_inventario_id_producto_fkey";

-- DropForeignKey
ALTER TABLE "recordatorios" DROP CONSTRAINT "recordatorios_id_mascota_fkey";

-- DropForeignKey
ALTER TABLE "registro_vacunas" DROP CONSTRAINT "registro_vacunas_id_mascota_fkey";

-- DropForeignKey
ALTER TABLE "registro_vacunas" DROP CONSTRAINT "registro_vacunas_id_vacuna_fkey";

-- DropForeignKey
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_id_rol_fkey";

-- AlterTable
ALTER TABLE "citas" ALTER COLUMN "fecha" SET NOT NULL,
ALTER COLUMN "fecha" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "hora" SET NOT NULL,
ALTER COLUMN "hora" SET DATA TYPE TEXT,
ALTER COLUMN "estado" SET NOT NULL,
ALTER COLUMN "id_mascota" SET NOT NULL,
ALTER COLUMN "id_usuario" SET NOT NULL;

-- AlterTable
ALTER TABLE "consultas" ALTER COLUMN "fecha" SET NOT NULL,
ALTER COLUMN "fecha" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "id_historia" SET NOT NULL,
ALTER COLUMN "id_usuario" SET NOT NULL;

-- AlterTable
ALTER TABLE "detalle_productos" ALTER COLUMN "id_factura" SET NOT NULL,
ALTER COLUMN "id_producto" SET NOT NULL,
ALTER COLUMN "cantidad" SET NOT NULL,
ALTER COLUMN "precio_unitario" SET NOT NULL;

-- AlterTable
ALTER TABLE "detalle_servicios" ALTER COLUMN "id_factura" SET NOT NULL,
ALTER COLUMN "id_servicio" SET NOT NULL,
ALTER COLUMN "cantidad" SET NOT NULL,
ALTER COLUMN "precio_unitario" SET NOT NULL;

-- AlterTable
ALTER TABLE "facturas" ALTER COLUMN "fecha" SET NOT NULL,
ALTER COLUMN "fecha" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "total" SET NOT NULL,
ALTER COLUMN "id_propietario" SET NOT NULL,
ALTER COLUMN "id_mascota" SET NOT NULL;

-- AlterTable
ALTER TABLE "historias_clinicas" ALTER COLUMN "id_mascota" SET NOT NULL,
ALTER COLUMN "fecha_creacion" SET NOT NULL,
ALTER COLUMN "fecha_creacion" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "mascotas" ALTER COLUMN "nombre" SET NOT NULL,
ALTER COLUMN "especie" SET NOT NULL,
ALTER COLUMN "raza" SET NOT NULL,
ALTER COLUMN "edad" SET NOT NULL,
ALTER COLUMN "id_propietario" SET NOT NULL;

-- AlterTable
ALTER TABLE "movimientos_inventario" ALTER COLUMN "tipo" SET NOT NULL,
ALTER COLUMN "cantidad" SET NOT NULL,
ALTER COLUMN "fecha" SET NOT NULL,
ALTER COLUMN "fecha" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "id_producto" SET NOT NULL;

-- AlterTable
ALTER TABLE "productos" ALTER COLUMN "nombre" SET NOT NULL,
ALTER COLUMN "tipo" SET NOT NULL,
ALTER COLUMN "precio" SET NOT NULL,
ALTER COLUMN "stock" SET NOT NULL;

-- AlterTable
ALTER TABLE "propietarios" ALTER COLUMN "nombre" SET NOT NULL,
ALTER COLUMN "telefono" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- AlterTable
ALTER TABLE "recordatorios" ALTER COLUMN "mensaje" SET NOT NULL,
ALTER COLUMN "fecha_recordatorio" SET NOT NULL,
ALTER COLUMN "fecha_recordatorio" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "estado" SET NOT NULL,
ALTER COLUMN "estado" SET DATA TYPE TEXT,
ALTER COLUMN "id_mascota" SET NOT NULL;

-- AlterTable
ALTER TABLE "registro_vacunas" ALTER COLUMN "fecha" SET NOT NULL,
ALTER COLUMN "fecha" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "proxima_fecha" SET NOT NULL,
ALTER COLUMN "proxima_fecha" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "id_mascota" SET NOT NULL,
ALTER COLUMN "id_vacuna" SET NOT NULL;

-- AlterTable
ALTER TABLE "servicios" ALTER COLUMN "nombre" SET NOT NULL,
ALTER COLUMN "precio" SET NOT NULL;

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "id_rol",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "rol" "Rol" NOT NULL DEFAULT 'ASISTENTE',
ALTER COLUMN "nombre" SET NOT NULL,
ALTER COLUMN "nombre" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "password" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "vacunas" ALTER COLUMN "nombre" SET NOT NULL,
ALTER COLUMN "frecuencia_dias" SET NOT NULL;

-- DropTable
DROP TABLE "roles";

-- CreateIndex
CREATE UNIQUE INDEX "propietarios_email_key" ON "propietarios"("email");

-- AddForeignKey
ALTER TABLE "mascotas" ADD CONSTRAINT "mascotas_id_propietario_fkey" FOREIGN KEY ("id_propietario") REFERENCES "propietarios"("id_propietario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_id_mascota_fkey" FOREIGN KEY ("id_mascota") REFERENCES "mascotas"("id_mascota") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historias_clinicas" ADD CONSTRAINT "historias_clinicas_id_mascota_fkey" FOREIGN KEY ("id_mascota") REFERENCES "mascotas"("id_mascota") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_id_historia_fkey" FOREIGN KEY ("id_historia") REFERENCES "historias_clinicas"("id_historia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_id_propietario_fkey" FOREIGN KEY ("id_propietario") REFERENCES "propietarios"("id_propietario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_id_mascota_fkey" FOREIGN KEY ("id_mascota") REFERENCES "mascotas"("id_mascota") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_servicios" ADD CONSTRAINT "detalle_servicios_id_factura_fkey" FOREIGN KEY ("id_factura") REFERENCES "facturas"("id_factura") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_servicios" ADD CONSTRAINT "detalle_servicios_id_servicio_fkey" FOREIGN KEY ("id_servicio") REFERENCES "servicios"("id_servicio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_productos" ADD CONSTRAINT "detalle_productos_id_factura_fkey" FOREIGN KEY ("id_factura") REFERENCES "facturas"("id_factura") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_productos" ADD CONSTRAINT "detalle_productos_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_vacunas" ADD CONSTRAINT "registro_vacunas_id_mascota_fkey" FOREIGN KEY ("id_mascota") REFERENCES "mascotas"("id_mascota") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_vacunas" ADD CONSTRAINT "registro_vacunas_id_vacuna_fkey" FOREIGN KEY ("id_vacuna") REFERENCES "vacunas"("id_vacuna") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recordatorios" ADD CONSTRAINT "recordatorios_id_mascota_fkey" FOREIGN KEY ("id_mascota") REFERENCES "mascotas"("id_mascota") ON DELETE RESTRICT ON UPDATE CASCADE;
