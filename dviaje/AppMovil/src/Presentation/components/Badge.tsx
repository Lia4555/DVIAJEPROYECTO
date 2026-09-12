import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface Props {
  texto: string;
  color?: string;
}

/** Etiqueta de color para estados (En ruta, Finalizado, Vencido...). */
export const Badge = ({ texto, color = colors.textoSuave }: Props) => (
  <View style={[estilos.contenedor, { borderColor: color }]}>
    <Text style={[estilos.texto, { color }]}>{texto.toUpperCase()}</Text>
  </View>
);

const estilos = StyleSheet.create({
  contenedor: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 3
  },
  texto: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }
});
