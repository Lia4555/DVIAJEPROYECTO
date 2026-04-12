import { useEffect, useState } from "react";
import API from "../services/api";

export default function ServiciosPage() {
  const [servicios, setServicios] = useState([]);
  const [form, setForm] = useState({
    id_pasajero: "",
    id_vehiculo: "",
    fecha: ""
  });

  const obtenerServicios = async () => {
    try {
      const res = await API.get("/servicios");
      setServicios(res.data);
    } catch (error) {
      console.error("Error al obtener servicios:", error);
    }
  };

  useEffect(() => {
    obtenerServicios();
  }, []);

  const crearServicio = async () => {
    try {
      await API.post("/servicios", form);
      obtenerServicios();
      setForm({ id_pasajero: "", id_vehiculo: "", fecha: "" });
    } catch (error) {
      alert("Error al crear el servicio. Revisa los IDs.");
    }
  };

  return (
    <div>
      <h2>Gestión de Servicios (Viajes)</h2>
      <input 
        placeholder="ID Pasajero" 
        value={form.id_pasajero}
        onChange={e => setForm({...form, id_pasajero: e.target.value})}
      />
      <input 
        placeholder="ID Vehículo" 
        value={form.id_vehiculo}
        onChange={e => setForm({...form, id_vehiculo: e.target.value})}
      />
      <input 
        type="date"
        value={form.fecha}
        onChange={e => setForm({...form, fecha: e.target.value})}
      />
      <button onClick={crearServicio}>Registrar Viaje</button>

      <ul>
        {servicios.map(s => (
          <li key={s.id_servicio}>
            Viaje #{s.id_servicio}: Pasajero {s.id_pasajero} en Vehículo {s.id_vehiculo} ({s.fecha})
          </li>
        ))}
      </ul>
    </div>
  );
}