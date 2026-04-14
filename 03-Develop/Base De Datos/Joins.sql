
-- 1. Conductores con sus vehículos asignados actualmente
SELECT 
    c.nombre,
    c.apellido,
    v.placa,
    v.marca,
    v.modelo
FROM Conductor c
INNER JOIN Vehiculos v ON c.id_Conductor = v.id_conductor_asignado;

-- 2. Servicios con nombre del conductor y placa del vehículo

SELECT 
    s.codigo_servicio,
    s.fecha_salida,
    c.nombre AS conductor_nombre,
    c.apellido AS conductor_apellido,
    v.placa
FROM Servicios s
INNER JOIN Conductor c ON s.id_conductor = c.id_Conductor
INNER JOIN Vehiculos v ON s.id_vehiculo = v.id_vehiculo;

-- 3. Reservas con nombre del cliente y destino del servicio

SELECT 
    r.numero_reserva,
    r.asiento_asignado,
    cl.nombre AS cliente_nombre,
    cl.apellido AS cliente_apellido,
    d.nombre_destino AS destino
FROM Reservas r
INNER JOIN Cliente cl ON r.id_Cliente = cl.id_Cliente
INNER JOIN Servicios s ON r.id_servicio = s.id_servicio
INNER JOIN Destinos d ON s.id_destino = d.id_destino;

-- 4. Vehículos con sus documentos vigentes

SELECT 
    v.placa,
    v.marca,
    dv.tipo_documento_legal,
    dv.fecha_vencimiento
FROM Vehiculos v
INNER JOIN DocumentosVehiculo dv ON v.id_vehiculo = dv.id_vehiculo
WHERE dv.estado_vigente = TRUE;

-- 5. Historial de asignaciones conductor-vehículo

SELECT 
    c.nombre,
    c.apellido,
    v.placa,
    hc.fecha_asignacion,
    hc.fecha_desasignacion
FROM HistorialConductores hc
INNER JOIN Conductor c ON hc.id_conductor = c.id_Conductor
INNER JOIN Vehiculos v ON hc.id_vehiculo = v.id_vehiculo;

-- 6. Alertas con nombre del conductor destino y tipo de alerta
-- Descripción: Lista alertas con el conductor responsable y el tipo
SELECT 
    a.descripcion,
    a.fecha_creacion,
    a.prioridad,
    c.nombre AS conductor_nombre,
    c.apellido AS conductor_apellido,
    ta.nombre_tipo AS tipo_alerta
FROM Alertas a
INNER JOIN Conductor c ON a.id_usuario_destino = c.id_Conductor
INNER JOIN TiposAlerta ta ON a.id_tipo_alerta = ta.id_tipo_alerta;

-- 7. Servicios con origen y destino (nombres de ciudades)
-- Descripción: Muestra cada servicio con su ciudad de origen y destino
SELECT 
    s.codigo_servicio,
    s.fecha_salida,
    o.nombre_destino AS origen,
    d.nombre_destino AS destino,
    s.precio_total
FROM Servicios s
INNER JOIN Destinos o ON s.id_origen = o.id_destino
INNER JOIN Destinos d ON s.id_destino = d.id_destino;

-- 8. Mantenimientos con datos del vehículo
-- Descripción: Lista todos los mantenimientos realizados con la información del vehículo
SELECT 
    m.fecha_mantenimiento,
    m.tipo_mantenimiento,
    m.costo,
    v.placa,
    v.marca,
    v.linea
FROM Mantenimientos m
INNER JOIN Vehiculos v ON m.id_vehiculo = v.id_vehiculo;