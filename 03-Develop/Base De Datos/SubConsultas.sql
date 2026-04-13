–1). Conductores con más servicios realizados 

SELECT 
    c.nombre,
    c.apellido,
    c.email,
    (SELECT COUNT(*) FROM Servicios s WHERE s.id_conductor = c.id_Conductor) AS total_servicios
FROM Conductor c
WHERE (SELECT COUNT(*) FROM Servicios s WHERE s.id_conductor = c.id_Conductor) > 0
ORDER BY total_servicios DESC;

–2). Vehiculos con documentacion a vencer en menos de 30 días 

SELECT 
    v.placa,
    v.marca,
    v.linea,
    (SELECT COUNT(*) FROM DocumentosVehiculo dv 
     WHERE dv.id_vehiculo = v.id_vehiculo 
     AND dv.estado_vigente = TRUE 
     AND dv.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days') AS documentos_por_vencer
FROM Vehiculos v
WHERE (SELECT COUNT(*) FROM DocumentosVehiculo dv 
       WHERE dv.id_vehiculo = v.id_vehiculo 
       AND dv.estado_vigente = TRUE 
       AND dv.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days') > 0;


–3).Clientes mas frecuentes 
SELECT 
    cl.nombre,
    cl.apellido,
    cl.email,
    (SELECT COUNT(*) FROM Reservas r 
     WHERE r.id_Cliente = cl.id_Cliente 
     AND r.estado_reserva != 'Cancelada') AS total_viajes,
    (SELECT SUM(r.precio_pagado) FROM Reservas r 
     WHERE r.id_Cliente = cl.id_Cliente 
     AND r.estado_reserva != 'Cancelada') AS total_gastado
FROM Cliente cl
WHERE (SELECT COUNT(*) FROM Reservas r WHERE r.id_Cliente = cl.id_Cliente) > 0
ORDER BY total_viajes DESC;

–4). Conductores sin vehiculo asignado actualmente pero que han trabajo antes 
SELECT 
    c.nombre,
    c.apellido,
    c.licencia_conduccion,
    (SELECT COUNT(*) FROM HistorialConductores hc 
     WHERE hc.id_conductor = c.id_Conductor) AS total_asignaciones_historicas,
    (SELECT MAX(fecha_asignacion) FROM HistorialConductores hc 
     WHERE hc.id_conductor = c.id_Conductor) AS ultima_asignacion
FROM Conductor c
WHERE NOT EXISTS (SELECT 1 FROM Vehiculos v WHERE v.id_conductor_asignado = c.id_Conductor)
AND EXISTS (SELECT 1 FROM HistorialConductores hc WHERE hc.id_conductor = c.id_Conductor);


–5).Destinos mas populares 
SELECT 
    d.nombre_destino,
    d.ciudad,
    (SELECT COUNT(*) FROM Servicios s WHERE s.id_destino = d.id_destino) AS veces_como_destino,
    (SELECT COUNT(*) FROM Servicios s WHERE s.id_origen = d.id_destino) AS veces_como_origen,
    ((SELECT COUNT(*) FROM Servicios s WHERE s.id_destino = d.id_destino) + 
     (SELECT COUNT(*) FROM Servicios s WHERE s.id_origen = d.id_destino)) AS total_movimientos
FROM Destinos d
WHERE (SELECT COUNT(*) FROM Servicios s WHERE s.id_destino = d.id_destino) > 0
   OR (SELECT COUNT(*) FROM Servicios s WHERE s.id_origen = d.id_destino) > 0
ORDER BY total_movimientos DESC;

–6). Vehículos que requieren mantenimiento proximo 

SELECT 
    v.placa,
    v.marca,
    v.modelo,
    v.fecha_proximo_mantenimiento,
    (SELECT COUNT(*) FROM Servicios s 
     WHERE s.id_vehiculo = v.id_vehiculo 
     AND s.fecha_salida > CURRENT_DATE 
     AND s.id_estado IN (1, 2)) AS servicios_programados,
    (SELECT COUNT(*) FROM Mantenimientos m 
     WHERE m.id_vehiculo = v.id_vehiculo 
     AND m.fecha_mantenimiento > CURRENT_DATE - INTERVAL '6 months') AS mantenimientos_ultimos_6_meses
FROM Vehiculos v
WHERE v.fecha_proximo_mantenimiento <= CURRENT_DATE + INTERVAL '15 days'
AND v.estado_operativo = TRUE;

–7).Reservas con requerimiento superior 
SELECT 
    r.numero_reserva,
    (SELECT CONCAT(cl.nombre, ' ', cl.apellido) FROM Cliente cl WHERE cl.id_Cliente = r.id_Cliente) AS nombre_cliente,
    (SELECT cv.nombre_clase FROM ClasesViaje cv WHERE cv.id_clase = r.clase_viaje) AS clase_reservada,
    r.precio_pagado,
    (SELECT s.codigo_servicio FROM Servicios s WHERE s.id_servicio = r.id_servicio) AS codigo_servicio,
    (SELECT AVG(r2.precio_pagado) FROM Reservas r2 
     WHERE r2.id_servicio = r.id_servicio) AS precio_promedio_servicio
FROM Reservas r
WHERE r.precio_pagado > (SELECT AVG(r2.precio_pagado) FROM Reservas r2 WHERE r2.id_servicio = r.id_servicio);

 –8). Alertas no resueltas de alta prioridad 
SELECT 
    a.id_alerta,
    a.tipo_alerta,
    a.descripcion,
    a.fecha_creacion,
    a.fecha_limite,
    (SELECT CONCAT(c.nombre, ' ', c.apellido) FROM Conductor c WHERE c.id_Conductor = a.id_usuario_destino) AS conductor_destino,
    (SELECT v.placa FROM Vehiculos v WHERE v.id_vehiculo = a.id_vehiculo_relacionado) AS vehiculo_relacionado,
    DATEDIFF(a.fecha_limite, CURRENT_DATE) AS dias_para_vencer
FROM Alertas a
WHERE a.estado_resuelta = FALSE 
AND a.prioridad >= 4
ORDER BY a.prioridad DESC, a.fecha_limite ASC;

