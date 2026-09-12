import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ProveedorSesion } from './src/Presentation/hooks';
import { PrincipalView } from './src/Presentation/views';

// ============================================================
//  PUNTO DE ENTRADA
// ------------------------------------------------------------
//  Arquitectura MVVM en tres capas (src/):
//    Domain       -> MODELO: entidades, contratos y casos de uso
//    Data         -> implementa esos contratos (API, almacenamiento)
//    Presentation -> VISTA (views/components) + VIEWMODEL (hooks)
//
//  Regla: una vista nunca llama a la API. Llama a su ViewModel,
//  el ViewModel llama a un caso de uso, y el caso de uso trabaja
//  contra un contrato del dominio.
// ============================================================

export default function App() {
  return (
    <ProveedorSesion>
      <StatusBar style="light" />
      <PrincipalView />
    </ProveedorSesion>
  );
}
