import { Sesion, Usuario } from '../../Domain/entities';
import { AuthRepository } from '../../Domain/repositories';
import { ApiError, HttpClient } from '../api/HttpClient';
import { SessionStorage } from '../local/SessionStorage';
import { AuthApiSource } from '../sources/AuthApiSource';

/**
 * Implementacion del contrato AuthRepository.
 * Combina las dos fuentes (API y almacenamiento del telefono) y mantiene
 * el token cargado en el cliente HTTP.
 */
export class AuthRepositoryImpl implements AuthRepository {
  constructor(
    private readonly api: AuthApiSource,
    private readonly almacen: SessionStorage,
    private readonly http: HttpClient
  ) {}

  async iniciarSesion(correo: string, contrasena: string): Promise<Sesion> {
    const respuesta = await this.api.login(correo, contrasena);

    // El navegador guarda la cookie httpOnly solo; en un telefono no hay
    // cookies, por eso el backend devuelve el token cuando el cliente se
    // identifica como movil (cabecera X-Client).
    if (!respuesta.token) {
      throw new ApiError(
        500,
        'El servidor no devolvio el token de sesion. Revisa que la API tenga el soporte para clientes moviles.'
      );
    }

    const sesion: Sesion = { usuario: respuesta.user, token: respuesta.token };
    this.http.usarToken(sesion.token);
    await this.almacen.guardar(sesion);
    return sesion;
  }

  async sesionGuardada(): Promise<Sesion | null> {
    const sesion = await this.almacen.leer();
    if (sesion) this.http.usarToken(sesion.token);
    return sesion;
  }

  usuarioActual(): Promise<Usuario> {
    return this.api.me();
  }

  async cerrarSesion(): Promise<void> {
    try {
      await this.api.logout();
    } catch {
      // Si el servidor no responde igual hay que salir en el telefono:
      // el token local es lo unico que da acceso a las pantallas.
    }
    this.http.usarToken(null);
    await this.almacen.borrar();
  }
}
