import React, { useState } from 'react';
import {  KeyboardAvoidingView,  Platform,  ScrollView,  StyleSheet,  Text,  View} from 'react-native';import { AppButton, AppInput, AvisoError } from '../components';
import { useSesion } from '../hooks';
import { colors, spacing, typography } from '../theme';

/** VISTA de entrada. Solo pinta y recoge datos: la logica esta en useSesion. */
export const LoginView = () => {
  const { entrar, entrando, error, limpiarError } = useSesion();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');

  const enviar = () => {
    limpiarError();
    entrar(correo, contrasena);
  };

  return (
    <KeyboardAvoidingView
      style={estilos.fondo}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={estilos.centro} keyboardShouldPersistTaps="handled">
        <View style={estilos.marca}>
          <Text style={estilos.logo}>TRANSPORTE</Text>
          <Text style={typography.titulo}>Panel del conductor</Text>
          <Text style={typography.ayuda}>
            Entra con el correo que te asigno el administrador.
          </Text>
        </View>

        {error && <AvisoError mensaje={error} />}

        <AppInput
          etiqueta="Correo"
          valor={correo}
          onCambio={setCorreo}
          placeholder="conductor@empresa.com"
          tipoTeclado="email-address"
        />
        <AppInput
          etiqueta="Contrasena"
          valor={contrasena}
          onCambio={setContrasena}
          placeholder="Tu contrasena"
          secreto
        />

        <AppButton titulo="Entrar" onPress={enviar} cargando={entrando} />

        <Text style={estilos.pie}>
          Si no tienes cuenta, pidesela al administrador: el registro no es
          publico.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colors.fondo },
  centro: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  marca: { gap: spacing.xs, marginBottom: spacing.xl },
  logo: {
    color: colors.primarioClaro,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3
  },
  pie: {
    ...typography.ayuda,
    textAlign: 'center',
    marginTop: spacing.xl
  }
});
