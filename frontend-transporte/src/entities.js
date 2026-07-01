
export const entities = [
  // ---------- CATÁLOGOS ----------
  {
    key: 'roles',
    label: 'Roles',
    endpoint: 'roles',
    pk: 'id_rol',
    group: 'Catálogos',
    fields: [
      { name: 'nombre_rol', label: 'Nombre del rol', type: 'text', required: true },
      { name: 'descripcion', label: 'Descripción', type: 'textarea' },
      { name: 'nivel_permiso', label: 'Nivel de permiso', type: 'number' }
    ]
  },
  {
    key: 'tipos-documentos',
    label: 'Tipos de documento',
    endpoint: 'tipos-documentos',
    pk: 'id_tipo_documento',
    group: 'Catálogos',
    fields: [
      { name: 'nombre_tipo', label: 'Nombre del tipo', type: 'text', required: true },
      { name: 'vigencia_meses', label: 'Vigencia (meses)', type: 'number' }
    ]
  },
  {
    key: 'estados-servicio',
    label: 'Estados de servicio',
    endpoint: 'estados-servicio',
    pk: 'id_estado',
    group: 'Catálogos',
    fields: [
      { name: 'nombre_estado', label: 'Nombre del estado', type: 'text', required: true },
      { name: 'descripcion', label: 'Descripción', type: 'textarea' }
    ]
  },
  {
    key: 'tipos-alerta',
    label: 'Tipos de alerta',
    endpoint: 'tipos-alerta',
    pk: 'id_tipo_alerta',
    group: 'Catálogos',
    fields: [
      { name: 'nombre_tipo', label: 'Nombre del tipo', type: 'text', required: true },
      { name: 'nivel_prioridad', label: 'Nivel de prioridad', type: 'number' },
      { name: 'descripcion', label: 'Descripción', type: 'textarea' }
    ]
  },
  {
    key: 'destinos',
    label: 'Destinos',
    endpoint: 'destinos',
    pk: 'id_destino',
    group: 'Catálogos',
    fields: [
      { name: 'nombre_destino', label: 'Nombre del destino', type: 'text', required: true },
      { name: 'ciudad', label: 'Ciudad', type: 'text', required: true },
      { name: 'departamento', label: 'Departamento', type: 'text' },
      { name: 'tiempo_estimado_viaje_horas', label: 'Tiempo estimado (horas)', type: 'number' },
      { name: 'activo', label: 'Activo', type: 'checkbox', default: true }
    ]
  },
  {
    key: 'clases-viaje',
    label: 'Clases de viaje',
    endpoint: 'clases-viaje',
    pk: 'id_clase',
    group: 'Catálogos',
    fields: [
      { name: 'nombre_clase', label: 'Nombre de la clase', type: 'text', required: true },
      { name: 'descripcion', label: 'Descripción', type: 'textarea' },
      { name: 'multiplicador_precio', label: 'Multiplicador de precio', type: 'number' },
      { name: 'beneficios', label: 'Beneficios', type: 'textarea' }
    ]
  },
  {
    key: 'tipos-vehiculo',
    label: 'Tipos de vehículo',
    endpoint: 'tipos-vehiculo',
    pk: 'id_tipo_vehiculo',
    group: 'Catálogos',
    fields: [
      { name: 'nombre_tipo', label: 'Nombre del tipo', type: 'text', required: true },
      { name: 'descripcion', label: 'Descripción', type: 'textarea' }
    ]
  },

  // ---------- PERSONAS ----------
  {
    key: 'conductor',
    label: 'Conductores',
    endpoint: 'conductor',
    pk: 'id_conductor',
    group: 'Personas',
    fields: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'apellido', label: 'Apellido', type: 'text', required: true },
      { name: 'tipo_documento', label: 'Tipo de documento', type: 'text', required: true },
      { name: 'numero_documento', label: 'Número de documento', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'telefono', label: 'Teléfono', type: 'text', required: true },
      { name: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date' },
      { name: 'direccion', label: 'Dirección', type: 'text' },
      { name: 'licencia_conduccion', label: 'Licencia de conducción', type: 'text' },
      { name: 'categoria_licencia', label: 'Categoría de licencia', type: 'text' },
      { name: 'fecha_expedicion_licencia', label: 'Expedición licencia', type: 'date' },
      { name: 'fecha_vencimiento_licencia', label: 'Vencimiento licencia', type: 'date' },
      { name: 'id_rol', label: 'ID Rol', type: 'number', required: true }
    ]
  },
  {
    key: 'clientes',
    label: 'Clientes',
    endpoint: 'clientes',
    pk: 'id_cliente',
    group: 'Personas',
    fields: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'apellido', label: 'Apellido', type: 'text', required: true },
      { name: 'tipo_documento', label: 'Tipo de documento', type: 'text', required: true },
      { name: 'numero_documento', label: 'Número de documento', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'telefono', label: 'Teléfono', type: 'text' },
      { name: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date' },
      { name: 'direccion', label: 'Dirección', type: 'text' }
    ]
  },

  // ---------- FLOTA ----------
  {
    key: 'vehiculos',
    label: 'Vehículos',
    endpoint: 'vehiculos',
    pk: 'id_vehiculo',
    group: 'Flota',
    fields: [
      { name: 'placa', label: 'Placa', type: 'text', required: true },
      { name: 'numero_interno', label: 'Número interno', type: 'text' },
      { name: 'marca', label: 'Marca', type: 'text', required: true },
      { name: 'linea', label: 'Línea', type: 'text', required: true },
      { name: 'modelo', label: 'Modelo', type: 'text', required: true },
      { name: 'color', label: 'Color', type: 'text' },
      { name: 'capacidad_pasajeros', label: 'Capacidad de pasajeros', type: 'number', required: true },
      { name: 'estado_operativo', label: 'Operativo', type: 'checkbox', default: true },
      { name: 'fecha_ultimo_mantenimiento', label: 'Último mantenimiento', type: 'date' },
      { name: 'fecha_proximo_mantenimiento', label: 'Próximo mantenimiento', type: 'date' },
      { name: 'id_tipo_vehiculo', label: 'ID Tipo de vehículo', type: 'number', required: true },
      { name: 'id_conductor_asignado', label: 'ID Conductor asignado (UUID)', type: 'text' }
    ]
  },
  {
    key: 'documentos-vehiculo',
    label: 'Documentos de vehículo',
    endpoint: 'documentos-vehiculo',
    pk: 'id_documento',
    group: 'Flota',
    fields: [
      { name: 'numero_documento', label: 'Número de documento', type: 'text', required: true },
      { name: 'tipo_documento_legal', label: 'Tipo documento legal', type: 'text', required: true },
      { name: 'fecha_expedicion', label: 'Fecha de expedición', type: 'date', required: true },
      { name: 'fecha_vencimiento', label: 'Fecha de vencimiento', type: 'date', required: true },
      { name: 'aseguradora', label: 'Aseguradora', type: 'text' },
      { name: 'valor_asegurado', label: 'Valor asegurado', type: 'number' },
      { name: 'archivo_url', label: 'URL del archivo', type: 'text' },
      { name: 'estado_vigente', label: 'Vigente', type: 'checkbox', default: true },
      { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
      { name: 'id_vehiculo', label: 'ID Vehículo', type: 'number', required: true },
      { name: 'id_tipo_documento', label: 'ID Tipo de documento', type: 'number', required: true }
    ]
  },
  {
    key: 'historial-conductores',
    label: 'Historial de conductores',
    endpoint: 'historial-conductores',
    pk: 'id_historial',
    group: 'Flota',
    fields: [
      { name: 'id_vehiculo', label: 'ID Vehículo', type: 'number', required: true },
      { name: 'id_conductor', label: 'ID Conductor (UUID)', type: 'text', required: true },
      { name: 'fecha_asignacion', label: 'Fecha de asignación', type: 'date', required: true },
      { name: 'fecha_desasignacion', label: 'Fecha de desasignación', type: 'date' },
      { name: 'observaciones', label: 'Observaciones', type: 'textarea' }
    ]
  },
  {
    key: 'mantenimientos',
    label: 'Mantenimientos',
    endpoint: 'mantenimientos',
    pk: 'id_mantenimiento',
    group: 'Flota',
    fields: [
      { name: 'fecha_mantenimiento', label: 'Fecha de mantenimiento', type: 'date', required: true },
      { name: 'tipo_mantenimiento', label: 'Tipo de mantenimiento', type: 'text', required: true },
      { name: 'descripcion', label: 'Descripción', type: 'textarea' },
      { name: 'costo', label: 'Costo', type: 'number', required: true },
      { name: 'taller_responsable', label: 'Taller responsable', type: 'text' },
      { name: 'kilometraje_actual', label: 'Kilometraje actual', type: 'number' },
      { name: 'proximo_mantenimiento', label: 'Próximo mantenimiento', type: 'date' },
      { name: 'kilometraje_proximo_mantenimiento', label: 'Km próximo mantenimiento', type: 'number' },
      { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
      { name: 'id_vehiculo', label: 'ID Vehículo', type: 'number', required: true }
    ]
  },

  // ---------- OPERACIÓN ----------
  {
    key: 'servicios',
    label: 'Servicios',
    endpoint: 'servicios',
    pk: 'id_servicio',
    group: 'Operación',
    fields: [
      { name: 'codigo_servicio', label: 'Código de servicio', type: 'text', required: true },
      { name: 'tipo_servicio', label: 'Tipo de servicio', type: 'text' },
      { name: 'fecha_salida', label: 'Fecha de salida', type: 'datetime', required: true },
      { name: 'fecha_llegada_estimada', label: 'Llegada estimada', type: 'datetime', required: true },
      { name: 'fecha_llegada_real', label: 'Llegada real', type: 'datetime' },
      { name: 'numero_pasajeros', label: 'Número de pasajeros', type: 'number', required: true },
      { name: 'precio_total', label: 'Precio total', type: 'number', required: true },
      { name: 'distancia_estimada_km', label: 'Distancia estimada (km)', type: 'number' },
      { name: 'peajes_estimados', label: 'Peajes estimados', type: 'number' },
      { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
      { name: 'id_conductor', label: 'ID Conductor (UUID)', type: 'text', required: true },
      { name: 'id_vehiculo', label: 'ID Vehículo', type: 'number', required: true },
      { name: 'id_origen', label: 'ID Origen', type: 'number', required: true },
      { name: 'id_destino', label: 'ID Destino', type: 'number', required: true },
      { name: 'id_estado', label: 'ID Estado', type: 'number', required: true }
    ]
  },
  {
    key: 'reservas',
    label: 'Reservas',
    endpoint: 'reservas',
    pk: 'id_reserva',
    group: 'Operación',
    fields: [
      { name: 'numero_reserva', label: 'Número de reserva', type: 'text', required: true },
      { name: 'asiento_asignado', label: 'Asiento asignado', type: 'text' },
      { name: 'clase_viaje', label: 'ID Clase de viaje', type: 'number', required: true },
      { name: 'precio_pagado', label: 'Precio pagado', type: 'number', required: true },
      { name: 'estado_reserva', label: 'Estado de reserva', type: 'text' },
      { name: 'fecha_check_in', label: 'Fecha de check-in', type: 'datetime' },
      { name: 'id_servicio', label: 'ID Servicio', type: 'number', required: true },
      { name: 'id_cliente', label: 'ID Cliente (UUID)', type: 'text', required: true }
    ]
  },
  {
    key: 'alertas',
    label: 'Alertas',
    endpoint: 'alertas',
    pk: 'id_alerta',
    group: 'Operación',
    fields: [
      { name: 'descripcion', label: 'Descripción', type: 'textarea' },
      { name: 'id_tipo_alerta', label: 'ID Tipo de alerta', type: 'number' },
      { name: 'id_vehiculo', label: 'ID Vehículo', type: 'number' }
    ]
  }
]

// Lista ordenada de los grupos para el menú lateral
export const groups = ['Catálogos', 'Personas', 'Flota', 'Operación']
