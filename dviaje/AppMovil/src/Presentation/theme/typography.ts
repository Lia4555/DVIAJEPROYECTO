import { TextStyle } from 'react-native';
import { colors } from './colors';

export const typography: Record<string, TextStyle> = {
  titulo: { fontSize: 24, fontWeight: '700', color: colors.texto },
  subtitulo: { fontSize: 18, fontWeight: '600', color: colors.texto },
  cuerpo: { fontSize: 15, fontWeight: '400', color: colors.texto },
  etiqueta: { fontSize: 13, fontWeight: '600', color: colors.textoSuave },
  ayuda: { fontSize: 12, fontWeight: '400', color: colors.textoTenue }
};
