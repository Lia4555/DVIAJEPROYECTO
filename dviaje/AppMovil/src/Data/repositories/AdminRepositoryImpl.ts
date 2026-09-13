import { AccionCuenta, ConductorResumen, CuentaAcceso } from '../../Domain/entities';
import { AdminRepository } from '../../Domain/repositories';
import { TransporteApiSource } from '../sources/TransporteApiSource';

export class AdminRepositoryImpl implements AdminRepository {
  constructor(private readonly api: TransporteApiSource) {}

  cuentas(): Promise<CuentaAcceso[]> {
    return this.api.cuentas();
  }

  gestionarCuenta(idUsuario: string, accion: AccionCuenta): Promise<string> {
    return this.api.gestionarCuenta(idUsuario, accion);
  }

  conductores(): Promise<ConductorResumen[]> {
    return this.api.conductores();
  }
}
