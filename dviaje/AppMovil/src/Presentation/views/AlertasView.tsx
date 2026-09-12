import React from 'react';
import { FlatList,  ListRenderItemInfo,  RefreshControl,  StyleSheet,  Text,  View} from 'react-native';
import { AppCard, AvisoError, Badge, Cargando, Pantalla, SinDatos } from '../components';
import { useAlertasViewModel } from '../hooks';
import { Alerta } from '../../Domain/entities';
import { colors, formatearFecha, spacing, typography } from '../theme';

const colorPrioridad = (prioridad: number): string => {
  if (prioridad >= 3) return colors.peligro;
  if (prioridad === 2) return colors.advertencia;
  return colors.info;
};

const textoPrioridad = (prioridad: number): string => {
  if (prioridad >= 3) return 'Alta';
  if (prioridad === 2) return 'Media';
  return 'Baja';
};

/** VISTA: avisos dirigidos al usuario. */
export const AlertasView = ({ vm }: { vm: ReturnType<typeof useAlertasViewModel> }) => {
  const tarjeta = (alerta: Alerta) => (
    <AppCard estilo={alerta.estado_resuelta ? estilos.resuelta : undefined}>
      <View style={estilos.fila}>
        <Text style={typography.subtitulo}>{alerta.tipo_alerta ?? 'Aviso'}</Text>
        <Badge
          texto={alerta.estado_resuelta ? 'Resuelta' : textoPrioridad(alerta.prioridad)}
          color={alerta.estado_resuelta ? colors.textoTenue : colorPrioridad(alerta.prioridad)}
        />
      </View>
      <Text style={typography.cuerpo}>{alerta.descripcion}</Text>
      {alerta.fecha_limite && (
        <Text style={typography.ayuda}>Fecha limite: {formatearFecha(alerta.fecha_limite)}</Text>
      )}
    </AppCard>
  );

  return (
    <Pantalla titulo="Alertas" subtitulo={`${vm.pendientes} sin resolver`}>
      {vm.error && <AvisoError mensaje={vm.error} onReintentar={vm.reintentar} />}

      {vm.cargando ? (
        <Cargando texto="Consultando alertas..." />
      ) : (
        <FlatList
          data={vm.alertas}
          keyExtractor={(item: Alerta) => String(item.id_alerta)}
          renderItem={({ item }: ListRenderItemInfo<Alerta>) => tarjeta(item)}
          contentContainerStyle={estilos.lista}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={vm.refrescando}
              onRefresh={vm.refrescar}
              tintColor={colors.primarioClaro}
            />
          }
          ListEmptyComponent={
            <SinDatos titulo="Todo en orden" detalle="No tienes alertas pendientes." />
          }
        />
      )}
    </Pantalla>
  );
};

const estilos = StyleSheet.create({
  lista: { gap: spacing.md, paddingBottom: spacing.xl },
  resuelta: { opacity: 0.55 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm
  }
});
