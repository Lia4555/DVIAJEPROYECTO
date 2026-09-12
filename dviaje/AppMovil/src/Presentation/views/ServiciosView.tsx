import React from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { AppCard, AvisoError, Badge, Cargando, Pantalla, SinDatos } from '../components';
import { FiltroServicios, useServiciosViewModel } from '../hooks';
import { Catalogos, Servicio, nombreDestino, nombreEstado, vaConRetraso } from '../../Domain/entities';
import { colorEstado, colors, formatearFechaHora, radius, spacing, typography } from '../theme';

interface Props {
  catalogos: Catalogos;
  onAbrirServicio: (idServicio: number) => void;
  nombreUsuario: string;
}

const FILTROS: { id: FiltroServicios; titulo: string }[] = [
  { id: 'todos', titulo: 'Todos' },
  { id: 'pendientes', titulo: 'Pendientes' },
  { id: 'retrasados', titulo: 'Retrasados' }
];

/** VISTA: lista de viajes asignados. */
export const ServiciosView = ({ catalogos, onAbrirServicio, nombreUsuario }: Props) => {
  const vm = useServiciosViewModel();

  const tarjeta = (servicio: Servicio) => {
    const estado = nombreEstado(catalogos, servicio.id_estado);
    const retrasado = vaConRetraso(servicio);

    return (
      <AppCard onPress={() => onAbrirServicio(servicio.id_servicio)} estilo={estilos.tarjeta}>
        <View style={estilos.fila}>
          <Text style={typography.subtitulo}>{servicio.codigo_servicio}</Text>
          <Badge texto={estado} color={colorEstado(estado)} />
        </View>

        <Text style={typography.cuerpo}>
          {nombreDestino(catalogos, servicio.id_origen)}
          {'  ->  '}
          {nombreDestino(catalogos, servicio.id_destino)}
        </Text>

        <View style={estilos.fila}>
          <Text style={typography.ayuda}>
            Salida: {formatearFechaHora(servicio.fecha_salida)}
          </Text>
          <Text style={typography.ayuda}>{servicio.numero_pasajeros} pasajeros</Text>
        </View>

        {retrasado && <Badge texto="Fuera de horario" color={colors.advertencia} />}
      </AppCard>
    );
  };

  return (
    <Pantalla titulo="Mis servicios" subtitulo={`Hola, ${nombreUsuario}`}>
      <View style={estilos.filtros}>
        {FILTROS.map((f) => {
          const activo = vm.filtro === f.id;
          return (
            <Pressable
              key={f.id}
              onPress={() => vm.cambiarFiltro(f.id)}
              style={[estilos.chip, activo && estilos.chipActivo]}
            >
              <Text style={[estilos.chipTexto, activo && estilos.chipTextoActivo]}>
                {f.titulo}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={estilos.resumen}>
        <Text style={typography.ayuda}>
          {vm.resumen.total} en total · {vm.resumen.pendientes} pendientes ·{' '}
          {vm.resumen.retrasados} retrasados
        </Text>
      </View>

      {vm.error && <AvisoError mensaje={vm.error} onReintentar={vm.reintentar} />}

      {vm.cargando ? (
        <Cargando texto="Consultando tus servicios..." />
      ) : (
        <FlatList
          data={vm.servicios}
          keyExtractor={(item: Servicio) => String(item.id_servicio)}
          renderItem={({ item }: ListRenderItemInfo<Servicio>) => tarjeta(item)}
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
            <SinDatos
              titulo="No hay servicios"
              detalle="Cuando el administrador te asigne un viaje aparecera aqui. Desliza hacia abajo para actualizar."
            />
          }
        />
      )}
    </Pantalla>
  );
};

const estilos = StyleSheet.create({
  filtros: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borde
  },
  chipActivo: { backgroundColor: colors.primario, borderColor: colors.primario },
  chipTexto: { color: colors.textoSuave, fontSize: 13, fontWeight: '600' },
  chipTextoActivo: { color: colors.primarioTexto },
  resumen: { marginBottom: spacing.md },
  lista: { gap: spacing.md, paddingBottom: spacing.xl },
  tarjeta: { gap: spacing.sm },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }
});
