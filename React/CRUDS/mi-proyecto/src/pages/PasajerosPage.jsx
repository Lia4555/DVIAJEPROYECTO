import { useEffect, useState } from "react";
import API from "../services/api";

export default function PasajerosPage() {
  const [pasajeros, setPasajeros] = useState([]);
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", telefono: "" });

  const obtenerPasajeros = async () => {
    const res = await API.get("/pasajeros");
    setPasajeros(res.data);
  };

  useEffect(() => { obtenerPasajeros(); }, []);

  const crearPasajero = async () => {
    await API.post("/pasajeros", form);
    obtenerPasajeros();
  };

  const eliminarPasajero = async (id) => {
    // Corregido: usamos comillas invertidas ` ` para que el ${id} funcione
    await API.delete(`/pasajeros/${id}`); 
    obtenerPasajeros();
  };

  return (
    <div>
      <h2>Pasajeros</h2>
      <input placeholder="Nombre" onChange={e => setForm({...form, nombre: e.target.value})}/>
      <input placeholder="Apellido" onChange={e => setForm({...form, apellido: e.target.value})}/>
      <input placeholder="Email" onChange={e => setForm({...form, email: e.target.value})}/>
      <input placeholder="Teléfono" onChange={e => setForm({...form, telefono: e.target.value})}/>
      <button onClick={crearPasajero}>Crear</button>
      <ul>
        {pasajeros.map(p => (
          <li key={p.id_pasajero}>
            {p.nombre} {p.apellido}
            <button onClick={() => eliminarPasajero(p.id_pasajero)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}