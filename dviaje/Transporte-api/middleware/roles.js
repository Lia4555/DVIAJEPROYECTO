export const requireNivel = (nivelMinimo) => (req, res, next) => {
  const nivel = req.user?.nivel_permiso ?? 0;
  if (nivel < nivelMinimo) {
    return res.status(403).json({ error: 'No tienes permiso suficiente para esta acción' });
  }
  next();
};

// Exige que el usuario tenga uno de los id_rol indicados.
// Ejemplo: requireRol(1, 2)  -> solo roles 1 o 2
export const requireRol = (...rolesPermitidos) => (req, res, next) => {
  if (!req.user || !rolesPermitidos.includes(req.user.id_rol)) {
    return res.status(403).json({ error: 'No tienes permiso para esta acción' });
  }
  next();
};