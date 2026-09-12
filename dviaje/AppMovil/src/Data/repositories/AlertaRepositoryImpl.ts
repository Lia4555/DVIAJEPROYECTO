import { Alerta } from '../../Domain/entities';
import { AlertaRepository } from '../../Domain/repositories';
import { TransporteApiSource } from '../sources/TransporteApiSource';

export class AlertaRepositoryImpl implements AlertaRepository {
  constructor(private readonly api: TransporteApiSource) {}

  listar(): Promise<Alerta[]> {
    return this.api.alertas();
  }
}
