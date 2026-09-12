import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {  AppButton,  AppCard, AppInput,  AvisoError,  Badge,  Cargando,  Pantalla,  SinDatos} from '../components';
import { useServicioDetalleViewModel } from '../hooks';
import { Catalogos, nombreDestino, nombreEstado } from '../../Domain/entities';
import {
  colorEstado,
  colors,
  formatearFechaHora,
  formatearPesos,
  spacing,
  typography
} from '../theme';

interface Props {
  idServicio: number;
  catalogos: Catalogos;
  onVolver: () => void;
  soloLectura: boolean;
}

const Dato = ({ etiqueta, valor }: { etiqueta: string; valor: string }) => (
  <View style={estilos.dato}>
    <Text style={typography.etiqueta}>{etiqueta}</Text>
    <Text style={typography.cuerpo}>{valor}</Text>
  </View>
);

/** VISTA: detalle del viaje y cambio de estado. */
export const ServicioDetalleView = ({ idServicio, catalogos, onVolver, soloLectura }: Props) => {
  const vm = useServicioDetalleViewModel(idServicio);

  const volver = (
    <AppButton titulo="Volver" variante="secundario" onPress={onVolver} estilo={estilos.volver} />
  );

  if (vm.cargando) {
    return (
      <Pantalla titulo="Servicio" accion={volver}>
        <Cargando />
      </Pantalla>
    );
  }

  if (!vm.servicio) {
    return (
      <Pantalla titulo="Servicio" accion={volver}>
        {vm.error && <AvisoError mensaje={vm.error} onReintentar={vm.reintentar} />}
        <SinDatos titulo="Servicio no disponible" />
      </Pantalla>
    );
  }

  const servicio = vm.servicio;
  const estadoActual = nombreEstado(catalogos, servicio.id_estado);

  return (
    <Pantalla titulo={servicio.codigo_servicio} subtitulo={servicio.tipo_servicio} accion={volver}>
      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        {vm.error && <AvisoError mensaje={vm.error} onReintentar={vm.reintentar} />}
        {vm.aviso && (
          <View style={estilos.aviso}>
            <Text style={estilos.avisoTexto}>{vm.aviso}</Text>
          </View>
        )}

        <AppCard>
          <Badge texto={estadoActual} color={colorEstado(estadoActual)} />
          <Dato
            etiqueta="Ruta"
            valor={`${nombreDestino(catalogos, servicio.id_origen)} -> ${nombreDestino(catalogos, servicio.id_destino)}`}
          />
          <Dato etiqueta="Salida" valor={formatearFechaHora(servicio.fecha_salida)} />
          <Dato
            etiqueta="Llegada estimada"
            valor={formatearFechaHora(servicio.fecha_llegada_estimada)}
          />
          <Dato
            etiqueta="Llegada real"
            valor={formatearFechaHora(servicio.fecha_llegada_real)}
          />
        </AppCard>

        <AppCard>
          <Dato etiqueta="Pasajeros" valor={String(servicio.numero_pasajeros)} />
          <Dato etiqueta="Valor del servicio" valor={formatearPesos(servicio.precio_total)} />
          <Dato
            etiqueta="Distancia estimada"
            valor={servicio.distancia_estimada_km ? `${servicio.distancia_estimada_km} km` : '-'}
          />
          <Dato etiqueta="Peajes" valor={formatearPesos(servicio.peajes_estimados)} />
        </AppCard>

        {soloLectura ? (
          <AppCard>
            <Text style={typography.etiqueta}>Observaciones</Text>
            <Text style={typography.cuerpo}>{servicio.observaciones ?? 'Sin observaciones'}</Text>
            <Text style={typography.ayuda}>
              Como administrador ves el servicio completo; el cambio de estado lo
              hace el conductor asignado.
            </Text>
          </AppCard>
        ) : (
          <AppCard>
            <Text style={typography.subtitulo}>Actualizar el viaje</Text>
            <AppInput
              etiqueta="Observaciones"
              valor={vm.observaciones}
              onCambio={vm.escribirObservaciones}
              placeholder="Novedades del viaje (opcional)"
              multilinea
            />
            <Text style={typography.etiqueta}>Cambiar estado a:</Text>
            <View style={estilos.botones}>
              {catalogos.estados
                .filter((estado) => estado.id_estado !== servicio.id_estado)
                .map((estado) => (
                  <AppButton
                    key={estado.id_estado}
                    titulo={estado.nombre_estado}
                    variante={/cancel/i.test(estado.nombre_estado) ? 'peligro' : 'primario'}
                    cargando={vm.guardando}
                    onPress={() => vm.cambiarEstado(estado)}
                    estilo={estilos.botonEstado}
                  />
                ))}
            </View>
            <Text style={typography.ayuda}>
              Al pasar el viaje a Finalizado se guarda automaticamente la hora
              real de llegada.
            </Text>
          </AppCard>
        )}
      </ScrollView>
    </Pantalla>
  );
};

const estilos = StyleSheet.create({
  contenido: { gap: spacing.md, paddingBottom: spacing.xxl },
  volver: { paddingHorizontal: spacing.lg, minHeight: 40 },
  dato: { gap: 2 },
  botones: { gap: spacing.sm },
  botonEstado: { width: '100%' },
  aviso: {
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    borderWidth: 1,
    borderColor: colors.exito,
    borderRadius: 10,
    padding: spacing.md
  },
  avisoTexto: { color: '#86EFAC', fontSize: 14 }
});
