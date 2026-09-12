import React from 'react';
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface Props {
  etiqueta: string;
  valor: string;
  onCambio: (texto: string) => void;
  placeholder?: string;
  secreto?: boolean;
  tipoTeclado?: KeyboardTypeOptions;
  multilinea?: boolean;
  editable?: boolean;
}

export const AppInput = ({
  etiqueta,
  valor,
  onCambio,
  placeholder,
  secreto = false,
  tipoTeclado = 'default',
  multilinea = false,
  editable = true
}: Props) => (
  <View style={estilos.contenedor}>
    <Text style={typography.etiqueta}>{etiqueta}</Text>
    <TextInput
      value={valor}
      onChangeText={onCambio}
      placeholder={placeholder}
      placeholderTextColor={colors.textoTenue}
      secureTextEntry={secreto}
      keyboardType={tipoTeclado}
      autoCapitalize={tipoTeclado === 'email-address' ? 'none' : 'sentences'}
      autoCorrect={false}
      editable={editable}
      multiline={multilinea}
      style={[estilos.campo, multilinea && estilos.campoAlto, !editable && estilos.bloqueado]}
    />
  </View>
);

const estilos = StyleSheet.create({
  contenedor: { gap: spacing.xs, marginBottom: spacing.md },
  campo: {
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    color: colors.texto,
    fontSize: 15
  },
  campoAlto: { minHeight: 96, textAlignVertical: 'top', paddingTop: spacing.md },
  bloqueado: { opacity: 0.6 }
});
