import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sesion } from '../../Domain/entities';

// Almacenamiento local del telefono. Guarda la sesion para que el
// usuario no tenga que escribir la contrasena cada vez que abre la app.
const CLAVE = '@transporte/sesion';

export class SessionStorage {
  async guardar(sesion: Sesion): Promise<void> {
    await AsyncStorage.setItem(CLAVE, JSON.stringify(sesion));
  }

  async leer(): Promise<Sesion | null> {
    const guardado = await AsyncStorage.getItem(CLAVE);
    if (!guardado) return null;
    try {
      return JSON.parse(guardado) as Sesion;
    } catch {
      // Dato corrupto: se descarta en vez de romper el arranque.
      await this.borrar();
      return null;
    }
  }

  async borrar(): Promise<void> {
    await AsyncStorage.removeItem(CLAVE);
  }
}
