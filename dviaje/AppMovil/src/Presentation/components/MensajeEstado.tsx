import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { AppButton } from './AppButton';

/** Rueda de carga centrada, para mientras llegan los datos. */
export const Cargando = ({ texto = 'Cargando...' }: { texto?: string }) => (
  <View style={estilos.centro}>
    <ActivityIndicator size="large" color={colors.primarioClaro} />
    <Text style={typography.ayuda}>{texto}</Text>
  </View>
);

/** Aviso rojo con opcion de reintentar: el error nunca se traga en silencio. */
export const AvisoError = ({
  mensaje,
  onReintentar
}: {
  mensaje: string;
  onReintentar?: () => void;
}) => (
  <View style={estilos.error}>
    <Text style={estilos.textoError}>{mensaje}</Text>
    {onReintentar && (
      <AppButton titulo="Reintentar" variante="secundario" onPress={onReintentar} />
    )}
  </View>
);

/** Lista vacia: se explica por que no hay nada, en vez de dejar el hueco. */
export const SinDatos = ({ titulo, detalle }: { titulo: string; detalle?: string }) => (
  <View style={estilos.centro}>
    <Text style={typography.subtitulo}>{titulo}</Text>
    {detalle && <Text style={[typography.ayuda, estilos.centrado]}>{detalle}</Text>}
  </View>
);

const estilos = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl
  },
  centrado: { textAlign: 'center' },
  error: {
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
    borderWidth: 1,
    borderColor: colors.peligro,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md
  },
  textoError: { color: '#FCA5A5', fontSize: 14, lineHeight: 20 }
});
