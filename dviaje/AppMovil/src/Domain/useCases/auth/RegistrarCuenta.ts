import { ErrorValidacion, ErroresCampos, SolicitudCuenta } from '../../entities';
import { AuthRepository } from '../../repositories';

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// CASO DE USO: pedir una cuenta de conductor.
// Son las mismas reglas del backend (controllers/cuentasController.js):
// se comprueban aqui para avisar al instante y alli otra vez, porque es
// el servidor el que decide. La cuenta queda pendiente de aprobacion.
export class RegistrarCuenta {
  constructor(private readonly repositorio: AuthRepository) {}

  validar(solicitud: SolicitudCuenta, confirmar: string): ErroresCampos {
    const e: ErroresCampos = {};
    if (solicitud.nombre.trim().length < 2) e.nombre = 'Escribe tu nombre.';
    if (solicitud.apellido.trim().length < 2) e.apellido = 'Escribe tu apellido.';
    if (!/^[A-Za-z0-9]{5,20}$/.test(solicitud.numero_documento.trim())) {
      e.numero_documento = 'Entre 5 y 20 letras o números, sin puntos ni espacios.';
    }
    if (!/^\+?[0-9 ]{7,20}$/.test(solicitud.telefono.trim())) {
      e.telefono = 'Escribe un teléfono válido.';
    }
    if (!solicitud.correo.trim()) e.correo = 'Escribe tu correo.';
    else if (!RE_EMAIL.test(solicitud.correo.trim())) e.correo = 'El correo no tiene un formato válido.';
    if (solicitud.contrasena.length < 8) e.contrasena = 'Mínimo 8 caracteres.';
    else if (solicitud.contrasena.length > 72) e.contrasena = 'Máximo 72 caracteres.';
    if (confirmar !== solicitud.contrasena) e.confirmar = 'Las contraseñas no coinciden.';
    return e;
  }

  async ejecutar(solicitud: SolicitudCuenta, confirmar: string): Promise<string> {
    const errores = this.validar(solicitud, confirmar);
    if (Object.keys(errores).length > 0) throw new ErrorValidacion(errores);

    return this.repositorio.registrarCuenta({
      ...solicitud,
      nombre: solicitud.nombre.trim(),
      apellido: solicitud.apellido.trim(),
      numero_documento: solicitud.numero_documento.trim(),
      telefono: solicitud.telefono.trim(),
      correo: solicitud.correo.trim()
    });
  }
}
