-- Roles del sistema
CREATE TABLE Roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    nivel_permiso INT DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tipos de documentos legales
CREATE TABLE TiposDocumentos (
    id_tipo_documento SERIAL PRIMARY KEY,
    nombre_tipo VARCHAR(50) NOT NULL UNIQUE,
    vigencia_meses INT -- Vigencia en meses del documento
);

-- Estados de servicios
CREATE TABLE EstadosServicio (
    id_estado SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

-- Tipos de alertas
CREATE TABLE TiposAlerta (
    id_tipo_alerta SERIAL PRIMARY KEY,
    nombre_tipo VARCHAR(50) NOT NULL UNIQUE,
    nivel_prioridad INT DEFAULT 1,
    descripcion VARCHAR(255)
);

-- Destinos
CREATE TABLE Destinos (
    id_destino SERIAL PRIMARY KEY,
    nombre_destino VARCHAR(100) NOT NULL UNIQUE,
    ciudad VARCHAR(100) NOT NULL,
    departamento VARCHAR(100),
    tiempo_estimado_viaje_horas DECIMAL(8,2),
    activo BOOLEAN DEFAULT TRUE
);

-- Clases de viaje
CREATE TABLE ClasesViaje (
    id_clase SERIAL PRIMARY KEY,
    nombre_clase VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    multiplicador_precio DECIMAL(3,2) DEFAULT 1.00,
    beneficios TEXT
);


--Tipo de vehiculo
CREATE TABLE TiposVehiculo (
    id_tipo_vehiculo SERIAL PRIMARY KEY,
    nombre_tipo VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);



-- Usuarios del sistema
CREATE TABLE Conductor (
    id_Conductor SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    tipo_documento VARCHAR(20) NOT NULL,
    numero_documento VARCHAR(20) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20) NOT NULL,
    fecha_nacimiento DATE,
    direccion VARCHAR(255),
    licencia_conduccion VARCHAR(50) UNIQUE,
    categoria_licencia VARCHAR(5),
    fecha_expedicion_licencia DATE,
    fecha_vencimiento_licencia DATE,
    password VARCHAR(255) NOT NULL, 
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    id_rol INT NOT NULL,
    CONSTRAINT FK_Conductor_Rol FOREIGN KEY (id_rol)
        REFERENCES Roles(id_rol),
    CONSTRAINT UQ_Conductor_TipoNumeroDocumento UNIQUE (tipo_documento, numero_documento)
);

-- Vehículos
CREATE TABLE Vehiculos (
    id_vehiculo SERIAL PRIMARY KEY,
    placa VARCHAR(10) NOT NULL UNIQUE,
    numero_interno VARCHAR(20) UNIQUE,
    marca VARCHAR(50) NOT NULL,
    linea VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    color VARCHAR(30),
    capacidad_pasajeros INT NOT NULL,
    estado_operativo BOOLEAN DEFAULT TRUE,
    fecha_ultimo_mantenimiento DATE,
    fecha_proximo_mantenimiento DATE,
    id_tipo_vehiculo INT NOT NULL,
    id_conductor_asignado INT NULL,
    CONSTRAINT FK_Vehiculo_Tipo FOREIGN KEY (id_tipo_vehiculo)
        REFERENCES TiposVehiculo(id_tipo_vehiculo),
    CONSTRAINT FK_Vehiculo_Conductor FOREIGN KEY (id_conductor_asignado)
        REFERENCES Conductor(id_Conductor),
    CONSTRAINT UQ_Vehiculo_Conductor UNIQUE (id_conductor_asignado)
);

-- Documentos de vehículos
CREATE TABLE DocumentosVehiculo (
    id_documento SERIAL PRIMARY KEY,
    numero_documento VARCHAR(100) NOT NULL,
tipo_documento_legal VARCHAR(50) NOT NULL, -- SOAT, Tarjeta_Operacion, Revision_Tecnomecanica, Poliza_Contractuales, Poliza_Extracontractuales
    fecha_expedicion DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    aseguradora VARCHAR(200),
    valor_asegurado DECIMAL(15,2),
    archivo_url VARCHAR(500),
    estado_vigente BOOLEAN DEFAULT TRUE,
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_vehiculo INT NOT NULL,
    id_tipo_documento INT NOT NULL,
    CONSTRAINT FK_DocVehiculo_Vehiculo FOREIGN KEY (id_vehiculo)
        REFERENCES Vehiculos(id_vehiculo),
    CONSTRAINT FK_DocVehiculo_TipoDoc FOREIGN KEY (id_tipo_documento)
        REFERENCES TiposDocumentos(id_tipo_documento),
    CONSTRAINT CK_FechaVencimiento CHECK (fecha_vencimiento > fecha_expedicion),
    CONSTRAINT UQ_DocumentoVehiculo_Numero UNIQUE (numero_documento),
    CONSTRAINT UQ_DocumentoVehiculo_TipoVehiculo UNIQUE (id_vehiculo, id_tipo_documento, estado_vigente)-- Solo un documento vigente por tipo por vehículo

);

-- Historial de conductores asignados
CREATE TABLE HistorialConductores (
    id_historial SERIAL PRIMARY KEY,
    id_vehiculo INT NOT NULL,
    id_conductor INT NOT NULL,
    fecha_asignacion DATE NOT NULL,
    fecha_desasignacion DATE,
    observaciones TEXT,
    CONSTRAINT FK_Historial_Vehiculo FOREIGN KEY (id_vehiculo)
        REFERENCES Vehiculos(id_vehiculo),
    CONSTRAINT FK_Historial_Conductor FOREIGN KEY (id_conductor)
        REFERENCES Conductor(id_Conductor),
    CONSTRAINT CK_Historial_Fechas CHECK (fecha_desasignacion IS NULL OR fecha_desasignacion >= fecha_asignacion)
);

-- Pasajeros (clientes)
CREATE TABLE Cliente (
    id_Cliente SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    tipo_documento VARCHAR(20) NOT NULL,
    numero_documento VARCHAR(20) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    direccion VARCHAR(255),
    password VARCHAR(255) NOT NULL, 
    CONSTRAINT UQ_Cliente_TipoNumeroDocumento UNIQUE (tipo_documento, numero_documento)
);

-- Servicios de transporte (viajes)
CREATE TABLE Servicios (
    id_servicio SERIAL PRIMARY KEY,
    codigo_servicio VARCHAR(50) NOT NULL UNIQUE,
    tipo_servicio VARCHAR(20) DEFAULT 'Regular',-- Regular, Especial, Empresarial, Turístico
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_salida TIMESTAMP NOT NULL,
    fecha_llegada_estimada TIMESTAMP NOT NULL,
    fecha_llegada_real TIMESTAMP,
    numero_pasajeros INT NOT NULL,
    precio_total DECIMAL(12,2) NOT NULL,
    distancia_estimada_km DECIMAL(10,2),
    peajes_estimados DECIMAL(10,2) DEFAULT 0,
    observaciones TEXT,
    id_conductor INT NOT NULL,
    id_vehiculo INT NOT NULL,
    id_origen INT NOT NULL,
    id_destino INT NOT NULL,
    id_estado INT NOT NULL,
    CONSTRAINT FK_Servicio_Conductor FOREIGN KEY (id_conductor)
        REFERENCES Conductor(id_Conductor),
    CONSTRAINT FK_Servicio_Vehiculo FOREIGN KEY (id_vehiculo)
        REFERENCES Vehiculos(id_vehiculo),
    CONSTRAINT FK_Servicio_Origen FOREIGN KEY (id_origen)
        REFERENCES Destinos(id_destino),
    CONSTRAINT FK_Servicio_Destino FOREIGN KEY (id_destino)
        REFERENCES Destinos(id_destino),
    CONSTRAINT FK_Servicio_Estado FOREIGN KEY (id_estado)
        REFERENCES EstadosServicio(id_estado),
    CONSTRAINT UQ_Servicio_Vehiculo_Fecha UNIQUE (id_vehiculo, fecha_salida) -- Un vehículo no puede tener dos servicios a la misma hora
);

-- Reservas (pasajeros por servicio)
CREATE TABLE Reservas (
    id_reserva SERIAL PRIMARY KEY,
    numero_reserva VARCHAR(50) NOT NULL UNIQUE,
    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    asiento_asignado VARCHAR(10),
    clase_viaje INT NOT NULL,
    precio_pagado DECIMAL(10,2) NOT NULL,
    estado_reserva VARCHAR(20) DEFAULT 'Confirmada',
    fecha_check_in TIMESTAMP,
    id_servicio INT NOT NULL,
    id_Cliente INT NOT NULL,
    CONSTRAINT FK_Reserva_Servicio FOREIGN KEY (id_servicio)
        REFERENCES Servicios(id_servicio),
    CONSTRAINT FK_Reserva_Cliente FOREIGN KEY (id_Cliente)
        REFERENCES Cliente(id_Cliente),
    CONSTRAINT FK_Reserva_Clase FOREIGN KEY (clase_viaje)
        REFERENCES ClasesViaje(id_clase),
    CONSTRAINT UQ_Reserva_Servicio_Asiento UNIQUE (id_servicio, asiento_asignado),
    CONSTRAINT UQ_Reserva_Servicio_Cliente UNIQUE (id_servicio, id_Cliente)-- Un pasajero no puede tener dos reservas en el mismo servicio
);

-- Alertas del sistema
CREATE TABLE Alertas (
    id_alerta SERIAL PRIMARY KEY,
    tipo_alerta VARCHAR(50), -- Vencimiento_SOAT, Vencimiento_Tarjeta, Mantenimiento.
    descripcion TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMP,
    fecha_limite DATE,
    estado_resuelta BOOLEAN DEFAULT FALSE,
    prioridad INT DEFAULT 1,
    id_usuario_destino INT NOT NULL,
    id_tipo_alerta INT NOT NULL,
    id_vehiculo_relacionado INT NULL,
    id_servicio_relacionado INT NULL,
    id_reserva_relacionada INT NULL,
    CONSTRAINT FK_Alerta_Usuario FOREIGN KEY (id_usuario_destino)
        REFERENCES Conductor(id_Conductor),
    CONSTRAINT FK_Alerta_Tipo FOREIGN KEY (id_tipo_alerta)
        REFERENCES TiposAlerta(id_tipo_alerta),
    CONSTRAINT FK_Alerta_Vehiculo FOREIGN KEY (id_vehiculo_relacionado)
        REFERENCES Vehiculos(id_vehiculo),
    CONSTRAINT FK_Alerta_Servicio FOREIGN KEY (id_servicio_relacionado)
        REFERENCES Servicios(id_servicio),
    CONSTRAINT FK_Alerta_Reserva FOREIGN KEY (id_reserva_relacionada)
        REFERENCES Reservas(id_reserva)
);



-- Mantenimiento de vehículos
CREATE TABLE Mantenimientos (
    id_mantenimiento SERIAL PRIMARY KEY,
    fecha_mantenimiento DATE NOT NULL,
    tipo_mantenimiento VARCHAR(50) NOT NULL,-- Preventivo, Rutinario, Mayor
    descripcion TEXT,
    costo DECIMAL(12,2),
    taller_responsable VARCHAR(200),
    kilometraje_actual DECIMAL(12,2),
    proximo_mantenimiento DATE,
    kilometraje_proximo_mantenimiento DECIMAL(12,2),
    observaciones TEXT,
    id_vehiculo INT NOT NULL,
    CONSTRAINT FK_Mantenimiento_Vehiculo FOREIGN KEY (id_vehiculo)
        REFERENCES Vehiculos(id_vehiculo),
    CONSTRAINT CK_Mantenimiento_Fechas CHECK (proximo_mantenimiento IS NULL OR proximo_mantenimiento >= fecha_mantenimiento)
);

