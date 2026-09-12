import React, { ReactNode } from 'react';
import {
  Pressable,
  PressableStateCallbackType,
  StyleSheet,
  View,
  ViewStyle
} from 'react-native';
import { colors, radius, spacing } from '../theme';

interface Props {
  children: ReactNode;
  onPress?: () => void;
  estilo?: ViewStyle;
}

/** Tarjeta contenedora. Si recibe onPress se comporta como boton. */
export const AppCard = ({ children, onPress, estilo }: Props) => {
  if (!onPress) return <View style={[estilos.tarjeta, estilo]}>{children}</View>;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }: PressableStateCallbackType) => [
        estilos.tarjeta,
        pressed && estilos.presionada,
        estilo
      ]}
    >
      {children}
    </Pressable>
  );
};

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colors.superficie,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borde,
    padding: spacing.lg,
    gap: spacing.sm
  },
  presionada: { opacity: 0.75 }
});
