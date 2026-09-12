import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppCard, Badge, Pantalla } from '../components';
import { useSesion } from '../hooks';
import { ApiConfig } from '../../Data/config/ApiConfig';
import { colors, spacing, typography } from '../theme';

const Dato = ({ etiqueta, valor }: { etiqueta: string; valor: string }) => (
  <View style={estilos.dato}>
    <Text style={typography.etiqueta}>{etiqueta}</Text>
    <Text style={typography.cuerpo}>{valor}</Text>
  </View>
);

/** VISTA: datos de la cuenta y cierre de sesion. */
export const PerfilView = () => {
  const { usuario, salir, esAdmin } = useSesion();
  if (!usuario) return null;

  return (
    <Pantalla titulo="Mi perfil">
      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        <AppCard>
          <View style={estilos.encabezado}>
            <View style={estilos.inicial}>
              <Text style={estilos.inicialTexto}>
                {(usuario.nombre ?? usuario.correo).charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={estilos.identidad}>
              <Text style={typography.subtitulo}>
                {usuario.nombre ?? 'Usuario'} {usuario.apellido ?? ''}
              </Text>
              <Badge
                texto={usuario.rol}
                color={esAdmin ? colors.advertencia : colors.primarioClaro}
              />
            </View>
          </View>
          <Dato etiqueta="Correo" valor={usuario.correo} />
          <Dato etiqueta="Nivel de permiso" valor={String(usuario.nivel_permiso)} />
          {usuario.id_conductor && (
            <Dato etiqueta="Ficha de conductor" valor={usuario.id_conductor} />
          )}
        </AppCard>

        <AppCard>
          <Text style={typography.subtitulo}>Conexion</Text>
          <Dato etiqueta="Servidor" valor={ApiConfig.baseUrl} />
          <Text style={typography.ayuda}>
            Se cambia en src/Data/config/ApiConfig.ts. En el emulador de Android
            Studio, 10.0.2.2 es el computador; en un telefono real hay que poner
            la IP de la red local.
          </Text>
        </AppCard>

        <AppButton titulo="Cerrar sesion" variante="peligro" onPress={salir} />
      </ScrollView>
    </Pantalla>
  );
};

const estilos = StyleSheet.create({
  contenido: { gap: spacing.md, paddingBottom: spacing.xxl },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm
  },
  inicial: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: colors.primario,
    alignItems: 'center',
    justifyContent: 'center'
  },
  inicialTexto: { color: colors.primarioTexto, fontSize: 22, fontWeight: '700' },
  identidad: { gap: spacing.xs, flex: 1 },
  dato: { gap: 2 }
});
