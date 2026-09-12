// Como se muestran fechas y dinero en la app. Vive en theme porque es
// parte de la presentacion: el dominio guarda los datos en crudo.

const RELLENO = (n: number) => String(n).padStart(2, '0');

/** 2026-03-14T08:30:00Z -> "14/03/2026 08:30" */
export const formatearFechaHora = (iso: string | null): string => {
  if (!iso) return 'Sin registrar';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return 'Sin registrar';
  return `${RELLENO(fecha.getDate())}/${RELLENO(fecha.getMonth() + 1)}/${fecha.getFullYear()} ${RELLENO(fecha.getHours())}:${RELLENO(fecha.getMinutes())}`;
};

/** Solo la fecha, sin hora. */
export const formatearFecha = (iso: string | null): string => {
  if (!iso) return 'Sin registrar';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return 'Sin registrar';
  return `${RELLENO(fecha.getDate())}/${RELLENO(fecha.getMonth() + 1)}/${fecha.getFullYear()}`;
};

/** 125000 -> "$ 125.000" */
export const formatearPesos = (valor: number | null): string => {
  if (valor === null || Number.isNaN(valor)) return '-';
  return `$ ${Math.round(valor).toLocaleString('es-CO')}`;
};

/** Dias que faltan (negativo si ya paso). */
export const diasRestantes = (iso: string | null): number | null => {
  if (!iso) return null;
  const objetivo = Date.parse(iso);
  if (Number.isNaN(objetivo)) return null;
  return Math.ceil((objetivo - Date.now()) / (1000 * 60 * 60 * 24));
};
