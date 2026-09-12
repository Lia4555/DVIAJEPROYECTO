import { useCallback, useState } from 'react';

// ============================================================
//  VIEWMODEL DE NAVEGACION
// ------------------------------------------------------------
//  Navegacion propia con un estado simple, sin librerias extra.
//  Cuatro pestanas y una pantalla de detalle encima.
// ============================================================

export type Pestana = 'servicios' | 'vehiculo' | 'alertas' | 'perfil';

export const useNavegacion = () => {
  const [pestana, setPestana] = useState<Pestana>('servicios');
  const [servicioAbierto, setServicioAbierto] = useState<number | null>(null);

  const irA = useCallback((destino: Pestana) => {
    setServicioAbierto(null); // cambiar de pestana cierra el detalle
    setPestana(destino);
  }, []);

  const abrirServicio = useCallback((idServicio: number) => {
    setServicioAbierto(idServicio);
  }, []);

  const volver = useCallback(() => setServicioAbierto(null), []);

  return { pestana, servicioAbierto, irA, abrirServicio, volver };
};
