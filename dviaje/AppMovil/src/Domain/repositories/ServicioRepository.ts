import { CambioServicio, Servicio } from '../entities';

export interface ServicioRepository {
  listar(): Promise<Servicio[]>;
  obtener(idServicio: number): Promise<Servicio>;
  actualizar(idServicio: number, cambios: CambioServicio): Promise<Servicio>;
}
