import { Alerta } from '../entities';

export interface AlertaRepository {
  listar(): Promise<Alerta[]>;
}
