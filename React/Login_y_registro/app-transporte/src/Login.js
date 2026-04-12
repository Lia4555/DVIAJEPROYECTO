import React, { useState } from 'react';
import './Formularios.css'; 

function Login({ alCambiarPantalla }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const manejarLogin = (e) => {
    e.preventDefault();
    console.log("Intentando entrar con:", { email, password });
  };

  return (
    <div className="contenedor-principal">
      <div className="tarjeta-blanca">
        

        <div className="lado-imagen">
          
          <img src="/furgonetas.jpg" alt="Transporte" />
        </div>

       
        <div className="lado-formulario">
          <div className="icono-usuario">👤</div>
          <h2>Iniciar sesión</h2>
          
          <form onSubmit={manejarLogin}>
            <input 
              type="email" 
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
            <input 
              type="password" 
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="boton-rojo">Login</button>
          </form>
          
          <div className="enlaces-inferiores">
            <a href="#olvide">¿Olvidaste tu contraseña?</a>
            <br />
            <button onClick={() => alCambiarPantalla('registro')} className="boton-enlace">
              ¿Aún no tienes cuenta?
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;