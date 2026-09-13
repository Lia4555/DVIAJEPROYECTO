import {
  ActualizarEstadoServicio,
  CargarCatalogos,
  CerrarSesion,
  CrearAlerta,
  CrearServicio,
  EditarServicio,
  GestionarCuenta,
  IniciarSesion,
  ListarAlertas,
  ListarConductores,
  ListarCuentas,
  ListarServicios,
  ObtenerResumenAdmin,
  ObtenerVehiculos,
  RegistrarCuenta,
  ReportarEstadoVehiculo,
  ResolverAlerta,
  RestaurarSesion
} from '../../Domain/useCases';
import { httpClient } from '../api/HttpClient';
import { SessionStorage } from '../local/SessionStorage';
import { AuthApiSource } from '../sources/AuthApiSource';
import { TransporteApiSource } from '../sources/TransporteApiSource';
import { AdminRepositoryImpl } from '../repositories/AdminRepositoryImpl';
import { AlertaRepositoryImpl } from '../repositories/AlertaRepositoryImpl';
import { AuthRepositoryImpl } from '../repositories/AuthRepositoryImpl';
import { CatalogoRepositoryImpl } from '../repositories/CatalogoRepositoryImpl';
import { ServicioRepositoryImpl } from '../repositories/ServicioRepositoryImpl';
import { VehiculoRepositoryImpl } from '../repositories/VehiculoRepositoryImpl';

// ============================================================
//  ARMADO DE LA APLICACION (inyeccion de dependencias)
// ------------------------------------------------------------
//  Aqui, y solo aqui, se decide que implementacion concreta usa
//  cada contrato del dominio. Los ViewModels piden casos de uso;
//  no saben si por debajo hay HTTP, una base local o datos falsos.
//  Para probar sin servidor bastaria con cambiar estas lineas.
// ============================================================

// --- Fuentes de datos ---
const authApi = new AuthApiSource(httpClient);
const transporteApi = new TransporteApiSource(httpClient);
const sessionStorage = new SessionStorage();

// --- Repositorios (implementan los contratos del dominio) ---
const authRepository = new AuthRepositoryImpl(authApi, sessionStorage, httpClient);
const servicioRepository = new ServicioRepositoryImpl(transporteApi);
const vehiculoRepository = new VehiculoRepositoryImpl(transporteApi);
const alertaRepository = new AlertaRepositoryImpl(transporteApi);
const catalogoRepository = new CatalogoRepositoryImpl(transporteApi);
const adminRepository = new AdminRepositoryImpl(transporteApi);

// --- Casos de uso: lo unico que consume la capa de presentacion ---
export const casosDeUso = {
  iniciarSesion: new IniciarSesion(authRepository),
  registrarCuenta: new RegistrarCuenta(authRepository),
  restaurarSesion: new RestaurarSesion(authRepository),
  cerrarSesion: new CerrarSesion(authRepository),
  listarServicios: new ListarServicios(servicioRepository),
  actualizarEstadoServicio: new ActualizarEstadoServicio(servicioRepository),
  obtenerVehiculos: new ObtenerVehiculos(vehiculoRepository),
  reportarEstadoVehiculo: new ReportarEstadoVehiculo(vehiculoRepository),
  listarAlertas: new ListarAlertas(alertaRepository),
  cargarCatalogos: new CargarCatalogos(catalogoRepository),

  // --- Administrador ---
  obtenerResumenAdmin: new ObtenerResumenAdmin(
    adminRepository,
    servicioRepository,
    vehiculoRepository,
    alertaRepository,
    catalogoRepository
  ),
  listarCuentas: new ListarCuentas(adminRepository),
  gestionarCuenta: new GestionarCuenta(adminRepository),
  listarConductores: new ListarConductores(adminRepository),
  crearServicio: new CrearServicio(servicioRepository),
  editarServicio: new EditarServicio(servicioRepository),
  crearAlerta: new CrearAlerta(alertaRepository),
  resolverAlerta: new ResolverAlerta(alertaRepository)
};

/** Se llama al cerrar sesion para que no queden datos del usuario anterior. */
export const limpiarCaches = (): void => catalogoRepository.limpiar();

export type CasosDeUso = typeof casosDeUso;
