-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'VETERINARIO', 'RECEPCIONISTA', 'CLIENTE');

-- CreateTable
CREATE TABLE "propietarios" (
    "id_propietario" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "direccion" TEXT,
    "email" VARCHAR(100) NOT NULL,

    CONSTRAINT "propietarios_pkey" PRIMARY KEY ("id_propietario")
);

-- CreateTable
CREATE TABLE "documentos_medicos" (
    "id_documento" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "id_mascota" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_medicos_pkey" PRIMARY KEY ("id_documento")
);

-- CreateTable
CREATE TABLE "mascotas" (
    "id_mascota" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "especie" VARCHAR(50) NOT NULL,
    "raza" VARCHAR(50) NOT NULL,
    "edad" INTEGER NOT NULL,
    "peso" DECIMAL(5,2),
    "foto" TEXT,
    "id_propietario" INTEGER NOT NULL,

    CONSTRAINT "mascotas_pkey" PRIMARY KEY ("id_mascota")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'RECEPCIONISTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "citas" (
    "id_cita" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "hora" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "id_mascota" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "citas_pkey" PRIMARY KEY ("id_cita")
);

-- CreateTable
CREATE TABLE "historias_clinicas" (
    "id_historia" SERIAL NOT NULL,
    "id_mascota" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historias_clinicas_pkey" PRIMARY KEY ("id_historia")
);

-- CreateTable
CREATE TABLE "consultas" (
    "id_consulta" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT,
    "diagnostico" TEXT,
    "tratamiento" TEXT,
    "id_historia" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "consultas_pkey" PRIMARY KEY ("id_consulta")
);

-- CreateTable
CREATE TABLE "servicios" (
    "id_servicio" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id_servicio")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id_factura" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL(10,2) NOT NULL,
    "id_propietario" INTEGER NOT NULL,
    "id_mascota" INTEGER NOT NULL,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id_factura")
);

-- CreateTable
CREATE TABLE "detalle_servicios" (
    "id_detalle" SERIAL NOT NULL,
    "id_factura" INTEGER NOT NULL,
    "id_servicio" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "detalle_servicios_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "productos" (
    "id_producto" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "detalle_productos" (
    "id_detalle" SERIAL NOT NULL,
    "id_factura" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "detalle_productos_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "movimientos_inventario" (
    "id_movimiento" SERIAL NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_producto" INTEGER NOT NULL,

    CONSTRAINT "movimientos_inventario_pkey" PRIMARY KEY ("id_movimiento")
);

-- CreateTable
CREATE TABLE "vacunas" (
    "id_vacuna" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "frecuencia_dias" INTEGER NOT NULL,

    CONSTRAINT "vacunas_pkey" PRIMARY KEY ("id_vacuna")
);

-- CreateTable
CREATE TABLE "registro_vacunas" (
    "id_registro" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "proxima_fecha" TIMESTAMP(3) NOT NULL,
    "id_mascota" INTEGER NOT NULL,
    "id_vacuna" INTEGER NOT NULL,

    CONSTRAINT "registro_vacunas_pkey" PRIMARY KEY ("id_registro")
);

-- CreateTable
CREATE TABLE "recordatorios" (
    "id_recordatorio" SERIAL NOT NULL,
    "mensaje" TEXT NOT NULL,
    "fecha_recordatorio" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "id_mascota" INTEGER NOT NULL,

    CONSTRAINT "recordatorios_pkey" PRIMARY KEY ("id_recordatorio")
);

-- CreateIndex
CREATE UNIQUE INDEX "propietarios_email_key" ON "propietarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "historias_clinicas_id_mascota_key" ON "historias_clinicas"("id_mascota");

-- AddForeignKey
ALTER TABLE "documentos_medicos" ADD CONSTRAINT "documentos_medicos_id_mascota_fkey" FOREIGN KEY ("id_mascota") REFERENCES "mascotas"("id_mascota") ON DELETE RESTRICT ON UPDATE CASCADE;

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

