import PasajerosPage from "./pages/PasajerosPage";
import VehiculosPage from "./pages/VehiculosPage";
import ServiciosPage from "./pages/ServiciosPage";

function App() {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Sistema de transporte especial D'Viaje</h1>
      
      <section style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "20px" }}>
        <PasajerosPage />
      </section>

      <section style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "20px" }}>
        <VehiculosPage />
      </section>

      <section style={{ border: "1px solid #ccc", padding: "10px" }}>
        <ServiciosPage />
      </section>
    </div>
  );
}

export default App;