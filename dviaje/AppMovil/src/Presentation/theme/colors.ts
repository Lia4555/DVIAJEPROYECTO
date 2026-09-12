// Paleta unica de la app. Ninguna pantalla escribe un color a mano:
// asi se cambia la imagen de toda la app desde este archivo.
export const colors = {
  fondo: '#0F172A',
  superficie: '#1E293B',
  superficieAlta: '#334155',
  borde: '#3E4C63',

  primario: '#2563EB',
  primarioClaro: '#60A5FA',
  primarioTexto: '#FFFFFF',

  texto: '#F1F5F9',
  textoSuave: '#94A3B8',
  textoTenue: '#64748B',

  exito: '#16A34A',
  advertencia: '#F59E0B',
  peligro: '#DC2626',
  info: '#0EA5E9',

  transparente: 'transparent'
} as const;

/** Color con el que se pinta cada estado de servicio. */
export const colorEstado = (nombreEstado: string): string => {
  const estado = nombreEstado.toLowerCase();
  if (estado.includes('final') || estado.includes('complet')) return colors.exito;
  if (estado.includes('ruta') || estado.includes('curso')) return colors.info;
  if (estado.includes('cancel')) return colors.peligro;
  if (estado.includes('retras') || estado.includes('demor')) return colors.advertencia;
  return colors.textoSuave;
};
