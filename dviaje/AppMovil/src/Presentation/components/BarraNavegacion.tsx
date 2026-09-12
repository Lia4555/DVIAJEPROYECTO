import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import { Pestana } from '../hooks/useNavegacion';

interface Props {
  activa: Pestana;
  onCambiar: (pestana: Pestana) => void;
  alertasPendientes: number;
}

const PESTANAS: { id: Pestana; icono: string; titulo: string }[] = [
  { id: 'servicios', icono: 'RUTA', titulo: 'Servicios' },
  { id: 'vehiculo', icono: 'BUS', titulo: 'Vehiculo' },
  { id: 'alertas', icono: 'AVISO', titulo: 'Alertas' },
  { id: 'perfil', icono: 'YO', titulo: 'Perfil' }
];

/** Barra inferior. Navegacion propia, sin librerias externas. */
export const BarraNavegacion = ({ activa, onCambiar, alertasPendientes }: Props) => (
  <View style={estilos.barra}>
    {PESTANAS.map((pestana) => {
      const seleccionada = pestana.id === activa;
      const conAviso = pestana.id === 'alertas' && alertasPendientes > 0;

      return (
        <Pressable
          key={pestana.id}
          onPress={() => onCambiar(pestana.id)}
          style={estilos.item}
        >
          <View style={estilos.iconoFila}>
            <Text style={[estilos.icono, seleccionada && estilos.activo]}>
              {pestana.icono}
            </Text>
            {conAviso && (
              <View style={estilos.punto}>
                <Text style={estilos.puntoTexto}>
                  {alertasPendientes > 9 ? '9+' : alertasPendientes}
                </Text>
              </View>
            )}
          </View>
          <Text style={[estilos.titulo, seleccionada && estilos.activo]}>
            {pestana.titulo}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    backgroundColor: colors.superficie,
    borderTopWidth: 1,
    borderTopColor: colors.borde,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm
  },
  item: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: spacing.xs },
  iconoFila: { flexDirection: 'row', alignItems: 'flex-start' },
  icono: { fontSize: 13, fontWeight: '800', color: colors.textoTenue, letterSpacing: 0.5 },
  titulo: { fontSize: 11, color: colors.textoTenue, fontWeight: '600' },
  activo: { color: colors.primarioClaro },
  punto: {
    backgroundColor: colors.peligro,
    borderRadius: 999,
    minWidth: 16,
    paddingHorizontal: 4,
    marginLeft: 2,
    alignItems: 'center'
  },
  puntoTexto: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' }
});
