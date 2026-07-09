import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const CATALOGO_FALLAS = [
  "Corto circuito", "Componente faltante", "Soldadura fría / Insuficiente",
  "Daño físico en PCB", "Polaridad invertida", "Desalineación de componente"
];

export function useCalidad() {
  const [serialBusqueda, setSerialBusqueda] = useState("");
  const [piezaActual, setPiezaActual] = useState(null);
  const [proyecto, setProyecto] = useState("");
  const [ordenActiva, setOrdenActiva] = useState(null);
  const [fallaSeleccionada, setFallaSeleccionada] = useState("");
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [fallasConsecutivas, setFallasConsecutivas] = useState(0);
  const [estadoParo, setEstadoParo] = useState('NINGUNO');
  const [cargandoAlerta, setCargandoAlerta] = useState(false);
  const [credenciales, setCredenciales] = useState({ numero_empleado: "", password: "" });
  const [errorDesbloqueo, setErrorDesbloqueo] = useState("");

  const detectarProyecto = useCallback((serial) => {
    const s = serial.toUpperCase();
    if (s.includes("TYT")) return "TOYOTA";
    if (s.includes("KIA")) return "KIA";
    return "OTROS / " + s.substring(0, 3);
  }, []);

  const buscarPieza = useCallback(async (e) => {
    e.preventDefault();
    setMensaje({ tipo: "", texto: "" });
    setPiezaActual(null);
    setFallaSeleccionada("");

    try {
      const response = await fetch(`${API_URL}/api/calidad/pieza-en-calidad/serial/${serialBusqueda}`);
      const data = await response.json();

      if (data.success) {
        const pieza = data.data;
        const ordenDeLaPieza = pieza.orden?.numero_orden;

        if (ordenActiva && ordenDeLaPieza !== ordenActiva) {
          setMensaje({
            tipo: "danger",
            texto: `Error: El serial ${pieza.serial} pertenece a la orden ${ordenDeLaPieza || 'N/A'}. Actualmente estás en la orden ${ordenActiva}.`
          });
          return;
        }

        if (!ordenActiva && ordenDeLaPieza) {
          setOrdenActiva(ordenDeLaPieza);
        }

        setPiezaActual(pieza);
        setProyecto(detectarProyecto(pieza.serial));
      } else {
        setMensaje({ tipo: "danger", texto: data.message });
      }
    } catch {
      setMensaje({ tipo: "danger", texto: "Error de conexión con el servidor." });
    }
  }, [serialBusqueda, ordenActiva, detectarProyecto]);

  const dictaminarPieza = useCallback(async (resultado) => {
    setMensaje({ tipo: "", texto: "" });

    if ((resultado === "Retrabajo" || resultado === "Scrap") && !fallaSeleccionada) {
      setMensaje({ tipo: "warning", texto: "Debes seleccionar una falla del catálogo para rechazar la pieza." });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/calidad/actualizar-estado-pieza/${piezaActual.serial}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultado,
          descripcion_falla: resultado === "OK" ? null : fallaSeleccionada
        })
      });

      const data = await response.json();

      if (data.success) {
        if (resultado === "Retrabajo" || resultado === "Scrap") {
          const nuevasFallas = fallasConsecutivas + 1;
          setFallasConsecutivas(nuevasFallas);
          if (nuevasFallas >= 3) {
            setEstadoParo('PENDIENTE_ALERTA');
          }
        } else {
          setFallasConsecutivas(0);
        }

        if (data.ordenCompletada) {
          alert(`¡ORDEN ${ordenActiva} COMPLETADA!\n\nTodas las piezas han sido inspeccionadas y el estado de la orden se actualizó en la base de datos.`);
          setMensaje({ tipo: "success", texto: `Orden ${ordenActiva} finalizada correctamente. Escanea una pieza de una nueva orden.` });
          setOrdenActiva(null);
          setPiezaActual(null);
          setSerialBusqueda("");
          setFallaSeleccionada("");
          setFallasConsecutivas(0);
        } else {
          setMensaje({ tipo: "success", texto: data.message });
          setPiezaActual(null);
          setSerialBusqueda("");
          setFallaSeleccionada("");
        }
      } else {
        setMensaje({ tipo: "danger", texto: data.message });
      }
    } catch {
      setMensaje({ tipo: "danger", texto: "Error de conexión con el servidor." });
    }
  }, [fallaSeleccionada, piezaActual, fallasConsecutivas, ordenActiva]);

  const alertarTecnicos = useCallback(async () => {
    setCargandoAlerta(true);
    try {
      await fetch(`${API_URL}/api/calidad/registrar-paro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orden_numero: ordenActiva,
          motivo: `Paro por 3 fallas consecutivas en orden ${ordenActiva}`
        })
      });
      setEstadoParo('BLOQUEADO');
    } catch {
      alert("Error al alertar técnicos. Revisa tu conexión.");
    } finally {
      setCargandoAlerta(false);
    }
  }, [ordenActiva]);

  const manejarDesbloqueo = useCallback(async (e) => {
    e.preventDefault();
    setErrorDesbloqueo("");

    try {
      const responseAuth = await fetch(`${API_URL}/api/sesiones/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero_empleado: credenciales.numero_empleado,
          password: credenciales.password
        })
      });

      const dataAuth = await responseAuth.json();

      if (dataAuth.success) {
        const usuario = dataAuth.data.usuario;
        const rolID = Number(usuario.rol_id);
        const rolName = usuario.rol;

        if (rolID === 3 || rolID === 5 || rolName === "Supervisor" || rolName === "Ingeniero") {
          await fetch(`${API_URL}/api/calidad/cerrar-paro`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orden_numero: ordenActiva })
          });

          setEstadoParo('NINGUNO');
          setFallasConsecutivas(0);
          setCredenciales({ numero_empleado: "", password: "" });
        } else {
          setErrorDesbloqueo("Acceso denegado. Solo un supervisor o Ing. de Procesos pueden desbloquear.");
        }
      } else {
        setErrorDesbloqueo("Credenciales incorrectas.");
      }
    } catch {
      setErrorDesbloqueo("Error al conectar con el servidor para el desbloqueo.");
    }
  }, [credenciales, ordenActiva]);

  const limpiarOrdenActiva = useCallback(() => {
    setOrdenActiva(null);
    setPiezaActual(null);
    setSerialBusqueda("");
    setMensaje({ tipo: "", texto: "" });
  }, []);

  return {
    serialBusqueda,
    setSerialBusqueda,
    piezaActual,
    proyecto,
    ordenActiva,
    fallaSeleccionada,
    setFallaSeleccionada,
    mensaje,
    fallasConsecutivas,
    estadoParo,
    cargandoAlerta,
    credenciales,
    setCredenciales,
    errorDesbloqueo,
    catalogoFallas: CATALOGO_FALLAS,
    buscarPieza,
    dictaminarPieza,
    alertarTecnicos,
    manejarDesbloqueo,
    limpiarOrdenActiva,
  };
}