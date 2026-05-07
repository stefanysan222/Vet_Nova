-- CreateTable
CREATE TABLE "citas" (
    "id_cita" SERIAL NOT NULL,
    "fecha" DATE,
    "hora" TIME(6),
    "estado" TEXT DEFAULT 'pendiente',
    "id_mascota" INTEGER,
    "id_usuario" INTEGER,

    CONSTRAINT "citas_pkey" PRIMARY KEY ("id_cita")
);

-- CreateTable
CREATE TABLE "consultas" (
    "id_consulta" SERIAL NOT NULL,
    "fecha" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT,
    "diagnostico" TEXT,
    "tratamiento" TEXT,
    "id_historia" INTEGER,
    "id_usuario" INTEGER,

    CONSTRAINT "consultas_pkey" PRIMARY KEY ("id_consulta")
);

-- CreateTable
CREATE TABLE "detalle_productos" (
    "id_detalle" SERIAL NOT NULL,
    "id_factura" INTEGER,
    "id_producto" INTEGER,
    "cantidad" INTEGER,
    "precio_unitario" DECIMAL(10,2),

    CONSTRAINT "detalle_productos_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "detalle_servicios" (
    "id_detalle" SERIAL NOT NULL,
    "id_factura" INTEGER,
    "id_servicio" INTEGER,
    "cantidad" INTEGER,
    "precio_unitario" DECIMAL(10,2),

    CONSTRAINT "detalle_servicios_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id_factura" SERIAL NOT NULL,
    "fecha" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL(10,2),
    "id_propietario" INTEGER,
    "id_mascota" INTEGER,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id_factura")
);

-- CreateTable
CREATE TABLE "historias_clinicas" (
    "id_historia" SERIAL NOT NULL,
    "id_mascota" INTEGER,
    "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historias_clinicas_pkey" PRIMARY KEY ("id_historia")
);

-- CreateTable
CREATE TABLE "mascotas" (
    "id_mascota" SERIAL NOT NULL,
    "nombre" VARCHAR(100),
    "especie" VARCHAR(50),
    "raza" VARCHAR(50),
    "edad" INTEGER,
    "peso" DECIMAL(5,2),
    "id_propietario" INTEGER,

    CONSTRAINT "mascotas_pkey" PRIMARY KEY ("id_mascota")
);

-- CreateTable
CREATE TABLE "movimientos_inventario" (
    "id_movimiento" SERIAL NOT NULL,
    "tipo" VARCHAR(20),
    "cantidad" INTEGER,
    "fecha" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "id_producto" INTEGER,

    CONSTRAINT "movimientos_inventario_pkey" PRIMARY KEY ("id_movimiento")
);

-- CreateTable
CREATE TABLE "productos" (
    "id_producto" SERIAL NOT NULL,
    "nombre" VARCHAR(100),
    "tipo" VARCHAR(50),
    "precio" DECIMAL(10,2),
    "stock" INTEGER,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "propietarios" (
    "id_propietario" SERIAL NOT NULL,
    "nombre" VARCHAR(100),
    "telefono" VARCHAR(20),
    "direccion" TEXT,
    "email" VARCHAR(100),

    CONSTRAINT "propietarios_pkey" PRIMARY KEY ("id_propietario")
);

-- CreateTable
CREATE TABLE "recordatorios" (
    "id_recordatorio" SERIAL NOT NULL,
    "mensaje" TEXT,
    "fecha_recordatorio" DATE,
    "estado" VARCHAR(20) DEFAULT 'pendiente',
    "id_mascota" INTEGER,

    CONSTRAINT "recordatorios_pkey" PRIMARY KEY ("id_recordatorio")
);

-- CreateTable
CREATE TABLE "registro_vacunas" (
    "id_registro" SERIAL NOT NULL,
    "fecha" DATE,
    "proxima_fecha" DATE,
    "id_mascota" INTEGER,
    "id_vacuna" INTEGER,

    CONSTRAINT "registro_vacunas_pkey" PRIMARY KEY ("id_registro")
);

-- CreateTable
CREATE TABLE "roles" (
    "id_rol" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "servicios" (
    "id_servicio" SERIAL NOT NULL,
    "nombre" VARCHAR(100),
    "precio" DECIMAL(10,2),

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id_servicio")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" VARCHAR(100),
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "id_rol" INTEGER,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "vacunas" (
    "id_vacuna" SERIAL NOT NULL,
    "nombre" VARCHAR(100),
    "frecuencia_dias" INTEGER,

    CONSTRAINT "vacunas_pkey" PRIMARY KEY ("id_vacuna")
);

-- CreateIndex
CREATE UNIQUE INDEX "historias_clinicas_id_mascota_key" ON "historias_clinicas"("id_mascota");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_id_mascota_fkey" FOREIGN KEY ("id_mascota") REFERENCES "mascotas"("id_mascota") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_id_historia_fkey" FOREIGN KEY ("id_historia") REFERENCES "historias_clinicas"("id_historia") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalle_productos" ADD CONSTRAINT "detalle_productos_id_factura_fkey" FOREIGN KEY ("id_factura") REFERENCES "facturas"("id_factura") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalle_productos" ADD CONSTRAINT "detalle_productos_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalle_servicios" ADD CONSTRAINT "detalle_servicios_id_factura_fkey" FOREIGN KEY ("id_factura") REFERENCES "facturas"("id_factura") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalle_servicios" ADD CONSTRAINT "detalle_servicios_id_servicio_fkey" FOREIGN KEY ("id_servicio") REFERENCES "servicios"("id_servicio") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_id_mascota_fkey" FOREIGN KEY ("id_mascota") REFERENCES "mascotas"("id_mascota") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_id_propietario_fkey" FOREIGN KEY ("id_propietario") REFERENCES "propietarios"("id_propietario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "historias_clinicas" ADD CONSTRAINT "historias_clinicas_id_mascota_fkey" FOREIGN KEY ("id_mascota") REFERENCES "mascotas"("id_mascota") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mascotas" ADD CONSTRAINT "mascotas_id_propietario_fkey" FOREIGN KEY ("id_propietario") REFERENCES "propietarios"("id_propietario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recordatorios" ADD CONSTRAINT "recordatorios_id_mascota_fkey" FOREIGN KEY ("id_mascota") REFERENCES "mascotas"("id_mascota") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro_vacunas" ADD CONSTRAINT "registro_vacunas_id_mascota_fkey" FOREIGN KEY ("id_mascota") REFERENCES "mascotas"("id_mascota") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro_vacunas" ADD CONSTRAINT "registro_vacunas_id_vacuna_fkey" FOREIGN KEY ("id_vacuna") REFERENCES "vacunas"("id_vacuna") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "roles"("id_rol") ON DELETE NO ACTION ON UPDATE NO ACTION;
