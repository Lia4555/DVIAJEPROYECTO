import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableStateCallbackType,
  StyleSheet,
  Text,
  ViewStyle
} from 'react-native';
import { colors, radius, spacing } from '../theme';

type Variante = 'primario' | 'secundario' | 'peligro';

interface Props {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  cargando?: boolean;
  deshabilitado?: boolean;
  estilo?: ViewStyle;
}

const fondos: Record<Variante, string> = {
  primario: colors.primario,
  secundario: colors.superficieAlta,
  peligro: colors.peligro
};

/** Boton unico de la app: mismo alto, mismo radio, mismo estado de carga. */
export const AppButton = ({
  titulo,
  onPress,
  variante = 'primario',
  cargando = false,
  deshabilitado = false,
  estilo
}: Props) => {
  const inactivo = deshabilitado || cargando;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }: PressableStateCallbackType) => [
        estilos.boton,
        { backgroundColor: fondos[variante] },
        pressed && !inactivo && estilos.presionado,
        inactivo && estilos.inactivo,
        estilo
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={colors.primarioTexto} />
      ) : (
        <Text style={estilos.texto}>{titulo}</Text>
      )}
    </Pressable>
  );
};

const estilos = StyleSheet.create({
  boton: {
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg
  },
  presionado: { opacity: 0.8 },
  inactivo: { opacity: 0.5 },
  texto: { color: colors.primarioTexto, fontSize: 15, fontWeight: '700' }
});
