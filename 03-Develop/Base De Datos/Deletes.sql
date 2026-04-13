
-- 1. Eliminar una reserva específica por su número
DELETE FROM Reservas 
WHERE numero_reserva = 'RES001' 
  AND EXISTS (SELECT 1 FROM Servicios s WHERE s.id_servicio = Reservas.id_servicio AND s.fecha_salida > CURRENT_TIMESTAMP);

-- 2. Eliminar alertas resueltas de baja prioridad (prioridad < 3)
DELETE FROM Alertas 
WHERE estado_resuelta = TRUE 
  AND prioridad < 3 
  AND fecha_resolucion < CURRENT_DATE - INTERVAL '30 days';

-- 3. Eliminar mantenimiento específico por ID (sin dependencias)
DELETE FROM Mantenimientos 
WHERE id_mantenimiento = 1;

-- 4. Eliminar conductor inactivo sin servicios asignados
DELETE FROM Conductor 
WHERE activo = FALSE 
  AND NOT EXISTS (SELECT 1 FROM Servicios s WHERE s.id_conductor = Conductor.id_Conductor);

-- 5. Eliminar documentos de vehículo vencidos (no vigentes)
DELETE FROM DocumentosVehiculo 
WHERE estado_vigente = FALSE 
  AND fecha_vencimiento < CURRENT_DATE - INTERVAL '1 year';