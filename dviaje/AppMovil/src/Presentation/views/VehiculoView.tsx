import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppCard, AvisoError, Badge, Cargando, Pantalla, SinDatos } from '../components';
import { useVehiculoViewModel } from '../hooks';
import { documentoVencido } from '../../Domain/entities';
import { colors, diasRestantes, formatearFecha, spacing, typography } from '../theme';

/** VISTA: ficha del vehiculo, sus papeles y el reporte de estado. */
export const VehiculoView = ({ soloLectura }: { soloLectura: boolean }) => {
  const vm = useVehiculoViewModel();

  if (vm.cargando) {
    return (
      <Pantalla titulo="Mi vehiculo">
        <Cargando texto="Consultando el vehiculo..." />
      </Pantalla>
    );
  }

  return (
    <Pantalla titulo="Mi vehiculo" subtitulo="Ficha, documentos y mantenimientos">
      <ScrollView
        contentContainerStyle={estilos.contenido}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={vm.refrescando}
            onRefresh={vm.refrescar}
            tintColor={colors.primarioClaro}
          />
        }
      >
        {vm.error && <AvisoError mensaje={vm.error} onReintentar={vm.reintentar} />}

        {vm.vehiculos.length === 0 && (
          <SinDatos
            titulo="Sin vehiculo asignado"
            detalle="El administrador todavia no te asigno un vehiculo."
          />
        )}

        {vm.vehiculos.map(({ vehiculo, documentos, mantenimientos }) => (
          <View key={vehiculo.id_vehiculo} style={estilos.bloque}>
            <AppCard>
              <View style={estilos.fila}>
                <Text style={estilos.placa}>{vehiculo.placa}</Text>
                <Badge
                  texto={vehiculo.estado_operativo ? 'Operativo' : 'Fuera de servicio'}
                  color={vehiculo.estado_operativo ? colors.exito : colors.peligro}
                />
              </View>
              <Text style={typography.cuerpo}>
                {vehiculo.marca} {vehiculo.linea} {vehiculo.modelo}
              </Text>
              <Text style={typography.ayuda}>
                Capacidad: {vehiculo.capacidad_pasajeros} pasajeros
                {vehiculo.numero_interno ? ` · Interno ${vehiculo.numero_interno}` : ''}
              </Text>
              <Text style={typography.ayuda}>
                Ultimo mantenimiento: {formatearFecha(vehiculo.fecha_ultimo_mantenimiento)} ·
                Proximo: {formatearFecha(vehiculo.fecha_proximo_mantenimiento)}
              </Text>

              {!soloLectura && (
                <AppButton
                  titulo={
                    vehiculo.estado_operativo
                      ? 'Reportar fuera de servicio'
                      : 'Marcar como operativo'
                  }
                  variante={vehiculo.estado_operativo ? 'peligro' : 'primario'}
                  cargando={vm.reportando === vehiculo.id_vehiculo}
                  onPress={() =>
                    vm.reportarEstado(vehiculo.id_vehiculo, !vehiculo.estado_operativo)
                  }
                />
              )}
            </AppCard>

            <AppCard>
              <Text style={typography.subtitulo}>Documentos</Text>
              {documentos.length === 0 && (
                <Text style={typography.ayuda}>Sin documentos registrados.</Text>
              )}
              {documentos.map((documento) => {
                const vencido = documentoVencido(documento);
                const dias = diasRestantes(documento.fecha_vencimiento);
                const porVencer = !vencido && dias !== null && dias <= 30;

                return (
                  <View key={documento.id_documento} style={estilos.itemLista}>
                    <View style={estilos.fila}>
                      <Text style={typography.cuerpo}>{documento.tipo_documento_legal}</Text>
                      <Badge
                        texto={vencido ? 'Vencido' : porVencer ? `${dias} dias` : 'Vigente'}
                        color={
                          vencido ? colors.peligro : porVencer ? colors.advertencia : colors.exito
                        }
                      />
                    </View>
                    <Text style={typography.ayuda}>
                      No. {documento.numero_documento} · Vence{' '}
                      {formatearFecha(documento.fecha_vencimiento)}
                    </Text>
                  </View>
                );
              })}
            </AppCard>

            <AppCard>
              <Text style={typography.subtitulo}>Mantenimientos recientes</Text>
              {mantenimientos.length === 0 && (
                <Text style={typography.ayuda}>Sin mantenimientos registrados.</Text>
              )}
              {mantenimientos.slice(0, 5).map((mantenimiento) => (
                <View key={mantenimiento.id_mantenimiento} style={estilos.itemLista}>
                  <Text style={typography.cuerpo}>{mantenimiento.tipo_mantenimiento}</Text>
                  <Text style={typography.ayuda}>
                    {formatearFecha(mantenimiento.fecha_mantenimiento)}
                    {mantenimiento.taller_responsable
                      ? ` · ${mantenimiento.taller_responsable}`
                      : ''}
                  </Text>
                </View>
              ))}
            </AppCard>
          </View>
        ))}
      </ScrollView>
    </Pantalla>
  );
};

const estilos = StyleSheet.create({
  contenido: { gap: spacing.md, paddingBottom: spacing.xxl },
  bloque: { gap: spacing.md },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  placa: { ...typography.titulo, letterSpacing: 1 },
  itemLista: {
    borderTopWidth: 1,
    borderTopColor: colors.borde,
    paddingTop: spacing.sm,
    gap: 2
  }
});
