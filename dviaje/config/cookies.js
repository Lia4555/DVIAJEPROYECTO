// Fuente unica de verdad para la cookie de sesion.
//
// Regla del navegador: para BORRAR una cookie, el Set-Cookie de borrado debe
// llevar EXACTAMENTE los mismos atributos (name, path, domain, sameSite, secure)
// con los que se creo. Si login y logout usan opciones distintas, el logout
// "responde OK" pero la cookie sigue viva. Por eso todo sale de aqui.

export const COOKIE_NAME = 'token';

// 8 horas: debe coincidir con el expiresIn del JWT para que la cookie y el
// token caduquen a la vez (si no, queda una cookie que el server ya rechaza).
export const COOKIE_MAX_AGE_MS = 8 * 60 * 60 * 1000;

// ¿Frontend y backend viven en dominios distintos? Entonces la cookie es
// "cross-site" y el navegador solo la manda con SameSite=None + Secure (HTTPS).
// En local (localhost:5173 -> localhost:3000) es same-site: basta con 'lax'.
const crossSite = process.env.CROSS_SITE_COOKIES === 'true';

// Atributos base compartidos por el set y por el clear.
const baseOptions = {
  httpOnly: true,                                        // JS del navegador no puede leerla -> protege contra XSS
  secure: crossSite || process.env.NODE_ENV === 'production', // solo por HTTPS
  sameSite: crossSite ? 'none' : 'lax',                  // 'lax' protege contra CSRF en same-site
  path: '/'                                              // valida en toda la API, y necesario para borrarla
};

// Opciones para CREAR la cookie (incluyen la caducidad).
export const cookieOptions = {
  ...baseOptions,
  maxAge: COOKIE_MAX_AGE_MS
};

// Opciones para BORRAR la cookie: las mismas, pero SIN maxAge.
export const clearCookieOptions = { ...baseOptions };
