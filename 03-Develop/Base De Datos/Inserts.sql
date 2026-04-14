–-INSERTS 

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Roles 
INSERT INTO Roles (nombre_rol, descripcion, nivel_permiso) VALUES
('Administrador', 'Acceso total al sistema', 5),
('Conductor', 'Acceso a servicios asignados y vehículo', 3),
('Cliente', 'Acceso a reservas y consultas', 1);

-- 2. TiposDocumentos
INSERT INTO TiposDocumentos (nombre_tipo, vigencia_meses) VALUES
('SOAT', 12),
('Tarjeta_Operacion', 12),
('Revision_Tecnomecanica', 6),
('Poliza_Contractuales', 12),
('Poliza_Extracontractuales', 12);

-- 3. EstadosServicio
INSERT INTO EstadosServicio (nombre_estado, descripcion) VALUES
('Programado', 'Servicio programado con anticipación'),
('En curso', 'Servicio en ejecución'),
('Completado', 'Servicio finalizado'),
('Cancelado', 'Servicio cancelado');

-- 4. TiposAlerta
INSERT INTO TiposAlerta (nombre_tipo, nivel_prioridad, descripcion) VALUES
('Vencimiento SOAT', 4, 'Alerta por vencimiento próximo de SOAT'),
('Vencimiento Tarjeta Operación', 4, 'Alerta por vencimiento de tarjeta de operación'),
('Mantenimiento programado', 3, 'Alerta por mantenimiento próximo del vehículo');

-- 5. Destinos
INSERT INTO Destinos (nombre_destino, ciudad, departamento, tiempo_estimado_viaje_horas, activo) VALUES
('Terminal del Norte', 'Bogotá', 'Cundinamarca', 0.5, true),
('Terminal de Medellín', 'Medellín', 'Antioquia', 8.5, true),
('Terminal de Cali', 'Cali', 'Valle del Cauca', 9.0, true),
('Aeropuerto El Dorado', 'Bogotá', 'Cundinamarca', 1.0, true);

-- 6. ClasesViaje
INSERT INTO ClasesViaje (nombre_clase, descripcion, multiplicador_precio, beneficios) VALUES
('Económico', 'Asientos estándar', 1.00, 'Sin beneficios adicionales'),
('Ejecutivo', 'Mayor espacio y snacks', 1.50, 'Snacks, bebidas, asiento reclinable'),
('Premium', 'Servicio VIP', 2.00, 'Comida, bebidas, entretenimiento, asiento cama');

-- 7. TiposVehiculo
INSERT INTO TiposVehiculo (nombre_tipo, descripcion) VALUES
('Bus', 'Vehículo de gran capacidad'),
('Minivan', 'Vehículo mediano'),
('Automóvil', 'Vehículo particular');

-- 8. Conductores 
INSERT INTO Conductor (nombre, apellido, tipo_documento, numero_documento, email, telefono, fecha_nacimiento, direccion, licencia_conduccion, categoria_licencia, fecha_expedicion_licencia, fecha_vencimiento_licencia, password, activo, id_rol) VALUES
('Carlos', 'Pérez', 'CC', '12345678', 'carlos.perez@empresa.com', '3001234567', '1985-06-15', 'Calle 123', 'LIC123', 'C3', '2020-01-10', '2026-01-10', crypt('conductor123', gen_salt('bf')), true, 2),
('Ana', 'Gómez', 'CC', '87654321', 'ana.gomez@empresa.com', '3017654321', '1990-09-20', 'Carrera 45', 'LIC456', 'C2', '2021-03-15', '2027-03-15', crypt('segura456', gen_salt('bf')), true, 2);

-- 9. Vehículos
INSERT INTO Vehiculos (placa, numero_interno, marca, linea, modelo, color, capacidad_pasajeros, estado_operativo, fecha_ultimo_mantenimiento, fecha_proximo_mantenimiento, id_tipo_vehiculo, id_conductor_asignado) VALUES
('ABC123', 'INT001', 'Mercedes Benz', 'Sprinter', '2022', 'Blanco', 20, true, '2024-01-15', '2024-07-15', 2, 1),
('XYZ789', 'INT002', 'Volkswagen', 'Constellation', '2021', 'Gris', 45, true, '2024-02-10', '2024-08-10', 1, 2);

-- 10. DocumentosVehiculo 
INSERT INTO DocumentosVehiculo (numero_documento, tipo_documento_legal, fecha_expedicion, fecha_vencimiento, aseguradora, valor_asegurado, estado_vigente, id_vehiculo, id_tipo_documento) VALUES
('SOAT2024001', 'SOAT', '2024-01-01', '2025-01-01', 'Seguros Mundial', 10000000, true, 1, 1),
('TARJ2024001', 'Tarjeta_Operacion', '2024-01-01', '2025-01-01', 'MinTransporte', NULL, true, 1, 2);

-- 11. HistorialConductores
INSERT INTO HistorialConductores (id_vehiculo, id_conductor, fecha_asignacion, fecha_desasignacion, observaciones) VALUES
(1, 1, '2024-01-20', NULL, 'Asignación actual'),
(2, 2, '2024-02-15', NULL, 'Asignación actual');

-- 12. Clientes
INSERT INTO Cliente (nombre, apellido, tipo_documento, numero_documento, email, telefono, fecha_nacimiento, direccion, password) VALUES
('Luis', 'Ramírez', 'CC', '111222333', 'luis.ramirez@gmail.com', '3109876543', '1995-04-10', 'Calle 50 #20-30', crypt('cliente123', gen_salt('bf'))),
('María', 'López', 'CC', '444555666', 'maria.lopez@gmail.com', '3201234567', '1988-07-22', 'Avenida siempre viva 123', crypt('maria2024', gen_salt('bf')));

-- 13. Servicios
INSERT INTO Servicios (codigo_servicio, tipo_servicio, fecha_salida, fecha_llegada_estimada, numero_pasajeros, precio_total, distancia_estimada_km, peajes_estimados, id_conductor, id_vehiculo, id_origen, id_destino, id_estado) VALUES
('SERV001', 'Regular', '2024-06-01 08:00:00', '2024-06-01 16:30:00', 15, 750000, 420, 150000, 1, 1, 1, 2, 1),
('SERV002', 'Empresarial', '2024-06-05 07:00:00', '2024-06-05 16:00:00', 40, 1800000, 430, 200000, 2, 2, 2, 3, 1);

-- 14. Reservas
INSERT INTO Reservas (numero_reserva, asiento_asignado, clase_viaje, precio_pagado, estado_reserva, id_servicio, id_Cliente) VALUES
('RES001', 'A1', 1, 50000, 'Confirmada', 1, 1),
('RES002', 'B3', 2, 75000, 'Confirmada', 1, 2),
('RES003', 'C10', 1, 45000, 'Confirmada', 2, 1);

-- 15. Alertas
INSERT INTO Alertas (tipo_alerta, descripcion, fecha_limite, prioridad, id_usuario_destino, id_tipo_alerta, id_vehiculo_relacionado) VALUES
('Vencimiento SOAT', 'El SOAT del vehículo ABC123 vence en 30 días', '2025-01-01', 4, 1, 1, 1),
('Mantenimiento programado', 'Mantenimiento preventivo próximo para vehículo ABC123', '2024-07-15', 3, 1, 3, 1);

-- 16. Mantenimientos
INSERT INTO Mantenimientos (fecha_mantenimiento, tipo_mantenimiento, descripcion, costo, taller_responsable, kilometraje_actual, proximo_mantenimiento, kilometraje_proximo_mantenimiento, id_vehiculo) VALUES
('2024-01-15', 'Preventivo', 'Cambio de aceite y filtros', 350000, 'Taller Central', 50000, '2024-07-15', 75000, 1),
('2024-02-10', 'Rutinario', 'Revisión de frenos y suspensión', 280000, 'Taller Norte', 32000, '2024-08-10', 52000, 2);
