import { Sesion } from '../../entities';
import { AuthRepository } from '../../repositories';

// CASO DE USO: una accion del negocio, con sus reglas, sin nada de UI.
// El ViewModel lo llama; el caso de uso decide si los datos sirven.
export class IniciarSesion {
  constructor(private readonly repositorio: AuthRepository) {}

  async ejecutar(correo: string, contrasena: string): Promise<Sesion> {
    const correoLimpio = correo.trim().toLowerCase();

    if (!correoLimpio || !contrasena) {
      throw new Error('Escribe tu correo y tu contrasena.');
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correoLimpio)) {
      throw new Error('El correo no tiene un formato valido.');
    }
    if (contrasena.length < 6) {
      throw new Error('La contrasena debe tener al menos 6 caracteres.');
    }

    return this.repositorio.iniciarSesion(correoLimpio, contrasena);
  }
}
