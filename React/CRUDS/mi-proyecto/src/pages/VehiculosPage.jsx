import { useEffect, useState } from "react";
import API from "../services/api";

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState([]);
  const [form, setForm] = useState({
    placa: "",
    marca: "",
    modelo: "",
    capacidad_pasajeros: ""
  });

  // Función para traer la lista de vehículos desde la base de datos
  const obtenerVehiculos = async () => {
    try {
      const res = await API.get("/vehiculos");
      setVehiculos(res.data);
    } catch (error) {
      console.error("Error al obtener vehículos:", error);
    }
  };

  // Se ejecuta una sola vez cuando se abre la página
  useEffect(() => {
    obtenerVehiculos();
  }, []);

  // Función para guardar un nuevo vehículo
  const crearVehiculo = async () => {
    try {
      await API.post("/vehiculos", form);
      obtenerVehiculos(); // Recarga la lista para ver el nuevo
      // Limpia el formulario después de crear
      setForm({ placa: "", marca: "", modelo: "", capacidad_pasajeros: "" });
    } catch (error) {
      console.error("Error al crear vehículo:", error);
    }
  };

  return (
    <div>
      <h2>Gestión de Vehículos</h2>

      <div style={{ marginBottom: "20px" }}>
        <input 
          placeholder="Placa" 
          value={form.placa}
          onChange={e => setForm({...form, placa: e.target.value})}
        />
        <input 
          placeholder="Marca" 
          value={form.marca}
          onChange={e => setForm({...form, marca: e.target.value})}
        />
        <input 
          placeholder="Modelo" 
          value={form.modelo}
          onChange={e => setForm({...form, modelo: e.target.value})}
        />
        <input 
          placeholder="Capacidad" 
          value={form.capacidad_pasajeros}
          onChange={e => setForm({...form, capacidad_pasajeros: e.target.value})}
        />

        <button onClick={crearVehiculo}>Crear Vehículo</button>
      </div>

      <ul>
        {vehiculos.map(v => (
          <li key={v.id_vehiculo}>
            <strong>{v.placa}</strong> - {v.marca} {v.modelo} (Capacidad: {v.capacidad_pasajeros})
          </li>
        ))}
      </ul>
    </div>
  );
}