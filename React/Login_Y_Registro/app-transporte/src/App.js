import React, { useState } from 'react';
import Login from './Login';
import Registro from './Registro';
import './Formularios.css'; 
function App() {
  const [pantalla, setPantalla] = useState('login');

  return (
    <div className="App">
      {pantalla === 'login' ? (
        <Login alCambiarPantalla={setPantalla} />
      ) : (
        <Registro alCambiarPantalla={setPantalla} />
      )}
    </div>
  );
}

export default App;