–-UPDATES 

-- 1. Actualizar el estado de un servicio (de Programado a En curso)
UPDATE Servicios 
SET id_estado = 2, -- En curso
    observaciones = 'Servicio iniciado puntualmente'
WHERE id_servicio = 1 AND id_estado = 1;

-- 2. Desasignar un conductor de un vehículo y actualizar el historial
UPDATE Vehiculos 
SET id_conductor_asignado = NULL
WHERE id_vehiculo = 1;

-- Registrar la desasignación en el historial
UPDATE HistorialConductores 
SET fecha_desasignacion = CURRENT_DATE,
    observaciones = 'Conductor reasignado a otra ruta'
WHERE id_vehiculo = 1 AND id_conductor = 1 AND fecha_desasignacion IS NULL;

-- 3. Actualizar la contraseña de un cliente
UPDATE Cliente 
SET password = crypt('nuevaContraseña123', gen_salt('bf'))
WHERE email = 'luis.ramirez@gmail.com';

-- 4. Marcar un documento de vehículo como no vigente y registrar uno nuevo
UPDATE DocumentosVehiculo 
SET estado_vigente = FALSE,
    observaciones = 'Documento vencido, se renovó con nuevo número'
WHERE id_vehiculo = 1 AND id_tipo_documento = 1 AND estado_vigente = TRUE;

-- Insertar el nuevo documento vigente (opcional, para mantener consistencia)
INSERT INTO DocumentosVehiculo (numero_documento, tipo_documento_legal, fecha_expedicion, fecha_vencimiento, aseguradora, valor_asegurado, estado_vigente, id_vehiculo, id_tipo_documento) 
VALUES ('SOAT2025001', 'SOAT', CURRENT_DATE, CURRENT_DATE + INTERVAL '12 months', 'Seguros Mundial', 12000000, TRUE, 1, 1);

-- 5. Cambiar el estado de una reserva
UPDATE Reservas 
SET estado_reserva = 'Check-in realizado',
    fecha_check_in = CURRENT_TIMESTAMP
WHERE numero_reserva = 'RES001' AND estado_reserva = 'Confirmada';

-- 6. Actualizar la fecha de llegada real de un servicio completado
UPDATE Servicios 
SET fecha_llegada_real = fecha_llegada_estimada + INTERVAL '30 minutes',
    observaciones = 'Llegada con retraso de 30 minutos por obras en la vía',
    id_estado = 3 -- Completado
WHERE id_servicio = 2 AND id_estado = 1;

-- 7. Marcar una alerta como resuelta
UPDATE Alertas 
SET estado_resuelta = TRUE,
    fecha_resolucion = CURRENT_TIMESTAMP
WHERE id_alerta = 1 AND estado_resuelta = FALSE;

-- 8. Actualizar el precio total de un servicio por cambios en peajes
UPDATE Servicios 
SET peajes_estimados = peajes_estimados + 50000,
    precio_total = precio_total + 50000,
    observaciones = COALESCE(observaciones, '') || ' Se incrementaron peajes por nueva vía'
WHERE id_servicio = 1;

-- 9. Actualizar el próximo mantenimiento de un vehículo después de realizar el servicio
UPDATE Vehiculos 
SET fecha_ultimo_mantenimiento = CURRENT_DATE,
    fecha_proximo_mantenimiento = CURRENT_DATE + INTERVAL '6 months',
    estado_operativo = TRUE
WHERE id_vehiculo = 2;

-- Registrar el mantenimiento realizado
UPDATE Mantenimientos 
SET observaciones = COALESCE(observaciones, '') || ' Mantenimiento completado según lo programado'
WHERE id_vehiculo = 2 AND fecha_mantenimiento = '2024-02-10';

-- 10. Actualizar la clase de viaje y precio pagado en una reserva (upgrade)
UPDATE Reservas 
SET clase_viaje = 2, -- Ejecutivo
    precio_pagado = precio_pagado * 1.5,
    estado_reserva = 'Modificada'
WHERE id_reserva = 3 AND clase_viaje = 1;
