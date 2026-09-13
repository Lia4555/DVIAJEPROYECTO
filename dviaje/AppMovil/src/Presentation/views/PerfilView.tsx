import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppCard, Badge, Dato, Pantalla } from '../components';
import { useSesion } from '../hooks';
import { ApiConfig } from '../../Data/config/ApiConfig';
import { colors, spacing, TONOS, typography } from '../theme';

/**
 * VISTA: datos de la cuenta y cierre de sesion.
 * Solo muestra lo que le sirve a la persona: nada de codigos internos
 * (ids, nivel de permiso), igual que en el panel web.
 */
export const PerfilView = () => {
  const { usuario, salir, esAdmin } = useSesion();
  if (!usuario) return null;

  const nombre = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ') || 'Usuario';
  const iniciales = nombre
    .split(' ')
    .map((p) => p.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  return (
    <Pantalla titulo="Mi perfil" subtitulo="Tu cuenta de trabajo en D' VIAJE.">
      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        <AppCard>
          <View style={estilos.encabezado}>
            <View style={estilos.avatar}>
              <Text style={estilos.avatarTexto}>{iniciales}</Text>
            </View>
            <View style={estilos.identidad}>
              <Text style={typography.subtitulo}>{nombre}</Text>
              <Badge texto={usuario.rol} tono={esAdmin ? TONOS.programado : TONOS.cancelado} />
            </View>
          </View>
          <View style={estilos.separador} />
          <Dato rotulo="Correo" valor={usuario.correo} estilo={estilos.datoCompleto} />
          <Text style={typography.ayuda}>
            {esAdmin
              ? 'Desde la app apruebas cuentas, despachas servicios y envías alertas. Catálogos, flota, clientes y reservas se administran en el panel web.'
              : 'Aquí ves los servicios, el vehículo y las alertas que te asignó el administrador.'}
          </Text>
        </AppCard>

        <AppButton titulo="Cerrar sesión" icono="salir" variante="ghost" onPress={salir} />

        {/* Dato tecnico para quien desarrolla: en la app instalada para
            conductores (compilacion de produccion) no aparece. */}
        {__DEV__ && (
          <Text style={estilos.desarrollo}>Modo desarrollo · servidor {ApiConfig.baseUrl}</Text>
        )}
      </ScrollView>
    </Pantalla>
  );
};

const estilos = StyleSheet.create({
  contenido: { gap: 14, paddingBottom: spacing.xxl },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.vino,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarTexto: { color: colors.blanco, fontSize: 20, fontWeight: '800' },
  identidad: { gap: 6, flex: 1 },
  separador: { height: 1, backgroundColor: colors.linea2 },
  datoCompleto: { width: '100%' },
  desarrollo: { textAlign: 'center', fontSize: 11.5, color: colors.muted2 }
});
