import React, { ReactNode } from 'react';
import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface Props {
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
  accion?: ReactNode;
}

// En Android la barra de estado se dibuja encima del contenido, asi que
// hay que dejarle su altura libre a mano.
const altoBarraEstado = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

/** Marco comun de todas las pantallas: cabecera + area de contenido. */
export const Pantalla = ({ titulo, subtitulo, children, accion }: Props) => (
  <View style={estilos.fondo}>
    <View style={estilos.cabecera}>
      <View style={estilos.textos}>
        <Text style={typography.titulo}>{titulo}</Text>
        {subtitulo && <Text style={typography.ayuda}>{subtitulo}</Text>}
      </View>
      {accion}
    </View>
    <View style={estilos.contenido}>{children}</View>
  </View>
);

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colors.fondo, paddingTop: altoBarraEstado },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md
  },
  textos: { flex: 1, gap: 2 },
  contenido: { flex: 1, paddingHorizontal: spacing.lg }
});
