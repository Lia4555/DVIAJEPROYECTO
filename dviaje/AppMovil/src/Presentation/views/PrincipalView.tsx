import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BarraNavegacion, Cargando } from '../components';
import { useAlertasViewModel, useCatalogos, useNavegacion, useSesion } from '../hooks';
import { colors } from '../theme';
import { AlertasView } from './AlertasView';
import { LoginView } from './LoginView';
import { PerfilView } from './PerfilView';
import { ServicioDetalleView } from './ServicioDetalleView';
import { ServiciosView } from './ServiciosView';
import { VehiculoView } from './VehiculoView';

/**
 * VISTA RAIZ. Decide que se ve:
 *   1. arranque -> rueda de carga mientras se revisa la sesion guardada
 *   2. sin sesion -> login
 *   3. con sesion -> pestanas, y encima el detalle de un servicio
 */
export const PrincipalView = () => {
  const { usuario, iniciando, esAdmin } = useSesion();

  if (iniciando) {
    return (
      <View style={estilos.fondo}>
        <Cargando texto="Abriendo tu sesion..." />
      </View>
    );
  }

  if (!usuario) return <LoginView />;

  return <AplicacionConSesion soloLectura={esAdmin} nombre={usuario.nombre ?? usuario.correo} />;
};

/**
 * Se separa en su propio componente para que los ViewModels de catalogos
 * y alertas solo se monten cuando ya hay sesion: si se llamaran antes,
 * cada peticion moriria con un 401.
 */
const AplicacionConSesion = ({
  soloLectura,
  nombre
}: {
  soloLectura: boolean;
  nombre: string;
}) => {
  const navegacion = useNavegacion();
  const { catalogos } = useCatalogos();
  const alertas = useAlertasViewModel();

  const contenido = () => {
    // El detalle se abre encima de la pestana de servicios.
    if (navegacion.servicioAbierto !== null) {
      return (
        <ServicioDetalleView
          idServicio={navegacion.servicioAbierto}
          catalogos={catalogos}
          onVolver={navegacion.volver}
          soloLectura={soloLectura}
        />
      );
    }

    switch (navegacion.pestana) {
      case 'vehiculo':
        return <VehiculoView soloLectura={soloLectura} />;
      case 'alertas':
        return <AlertasView vm={alertas} />;
      case 'perfil':
        return <PerfilView />;
      default:
        return (
          <ServiciosView
            catalogos={catalogos}
            onAbrirServicio={navegacion.abrirServicio}
            nombreUsuario={nombre}
          />
        );
    }
  };

  return (
    <View style={estilos.fondo}>
      <View style={estilos.contenido}>{contenido()}</View>
      <BarraNavegacion
        activa={navegacion.pestana}
        onCambiar={navegacion.irA}
        alertasPendientes={alertas.pendientes}
      />
    </View>
  );
};

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colors.fondo },
  contenido: { flex: 1 }
});
