import { Platform } from 'react-native';

// ============================================================
//  UNICO SITIO DONDE SE CONFIGURA LA DIRECCION DEL BACKEND
// ------------------------------------------------------------
//  El servidor es el de este mismo proyecto (server.js, puerto 3000).
//
//  · Emulador de Android Studio: 10.0.2.2 es como el emulador llama al
//    "localhost" del computador. NO sirve 127.0.0.1: eso seria el
//    propio telefono virtual.
//  · Telefono fisico por USB o wifi: pon aqui la IP del computador en
//    la red local (ipconfig -> "Direccion IPv4", algo como
//    192.168.1.15) y asegurate de que ambos esten en la misma wifi.
// ============================================================

/** Cambia esto si pruebas en un telefono real. */
const IP_EN_RED_LOCAL = '192.168.1.10';

const PUERTO = 3000;

const HOST_POR_PLATAFORMA = Platform.select({
  android: `10.0.2.2:${PUERTO}`, // emulador de Android Studio
  ios: `localhost:${PUERTO}`,
  default: `localhost:${PUERTO}`
});

export const ApiConfig = {
  baseUrl: `http://${HOST_POR_PLATAFORMA}/api`,

  /** Direccion para telefono fisico. Usala si el emulador no aplica. */
  baseUrlDispositivoFisico: `http://${IP_EN_RED_LOCAL}:${PUERTO}/api`,

  /** Si el servidor no contesta en este tiempo, se corta la peticion. */
  timeoutMs: 15000,

  /** El backend devuelve el token en el JSON solo si el cliente es movil. */
  cabeceraCliente: { 'X-Client': 'mobile' }
};
