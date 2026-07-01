export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Error de validación de datos',
      detalles: err.errors.map(e => ({ campo: e.path.join('.'), mensaje: e.message }))
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
};