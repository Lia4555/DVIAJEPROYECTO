
-- 1.Elimina un tipo de documento legal si no está siendo usado
DELETE FROM TiposDocumentos
WHERE id_tipo_documento NOT IN (SELECT DISTINCT id_tipo_documento FROM DocumentosVehiculo);

-- 2.Eliminar un destino que no ha sido usado como origen ni destino
DELETE FROM Destinos
WHERE id_destino NOT IN (
  SELECT id_origen FROM Servicios
  UNION
  SELECT id_destino FROM Servicios
);
-- 3. Eliminar mantenimiento específico por ID (sin dependencias)
DELETE FROM Mantenimientos 
WHERE id_mantenimiento = 1;


-- 4. Eliminar documentos de vehículo vencidos (no vigentes)
DELETE FROM DocumentosVehiculo 
WHERE estado_vigente = FALSE 
  AND fecha_vencimiento < CURRENT_DATE - INTERVAL '1 year';