import React, { useState } from 'react';
import './Formularios.css';


function Registro({ alCambiarPantalla }) {
  const [datos, setDatos] = useState({
    email: '',
    usuario: '',
    telefono: '',
    password: '',
    confirmarPassword: ''
  });

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
  };

  const manejarRegistro = (e) => {
    e.preventDefault();
    console.log("Datos de registro:", datos);
  };

  return (
    <div className="contenedor-principal">
      <div className="tarjeta-blanca">
        
        <div className="lado-imagen">
          <img src="/furgonetas.jpg" alt="Transporte" />
        </div>

        <div className="lado-formulario lado-registro">
          <div className="icono-usuario">👤</div>
          <h2>Registrarse</h2>
          
          <form onSubmit={manejarRegistro}>
            <div className="fila-inputs">
              <input type="email" name="email" placeholder="Email:" onChange={manejarCambio} required />
              <input type="text" name="usuario" placeholder="Usuario:" onChange={manejarCambio} required />
            </div>
            <div className="fila-inputs">
              <input type="tel" name="telefono" placeholder="Teléfono:" onChange={manejarCambio} />
              <input type="password" name="password" placeholder="Contraseña:" onChange={manejarCambio} required />
            </div>
            <input type="password" name="confirmarPassword" placeholder="Confirmar contraseña:" onChange={manejarCambio} required />
            
            <button type="submit" className="boton-rojo">Registrarse</button>
          </form>
          
          <div className="enlaces-inferiores">
            <button onClick={() => alCambiarPantalla('login')} className="boton-enlace">
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Registro;