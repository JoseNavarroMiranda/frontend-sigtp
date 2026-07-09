import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export function useOperador() {
  const [ordenesActivas, setOrdenesActivas] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState("");
  const [ordenSeleccionadaId, setOrdenSeleccionadaId] = useState("");
  const [scannedCode, setScannedCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [historial, setHistorial] = useState({});
  const [piezasOrden, setPiezasOrden] = useState([]);
  const [loadingPiezas, setLoadingPiezas] = useState(false);

  useEffect(() => {
    const cargarOrdenes = async () => {
      try {
        const response = await fetch(`${API_URL}/api/operador/ordenes-activas`);
        if (response.ok) {
          const result = await response.json();
          setOrdenesActivas(result.data || result);
        }
      } catch (error) {
        console.error("Error al cargar órdenes:", error);
      }
    };
    cargarOrdenes();
  }, []);

  const ordenesFiltradas = ordenesActivas.filter(orden => orden.prefijo === proyectoSeleccionado);
  const ordenActiva = ordenesActivas.find(orden => String(orden.id) === String(ordenSeleccionadaId)) || null;

  const historialActual = ordenSeleccionadaId && historial[ordenSeleccionadaId]
    ? historial[ordenSeleccionadaId]
    : [];

  const avanceBaseDatos = ordenActiva ? (ordenActiva.procesadas || 0) : 0;
  const registradas = avanceBaseDatos + historialActual.length;
  const progreso = ordenActiva && ordenActiva.meta > 0 ? Math.round((registradas / ordenActiva.meta) * 100) : 0;
  const ultimoEscaneo = historialActual.length > 0 ? historialActual[0] : null;

  const handleRegister = useCallback(async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const serial = scannedCode.trim().toUpperCase();

    if (!proyectoSeleccionado) {
      setErrorMsg("Primero selecciona un proyecto.");
      return;
    }
    if (!ordenSeleccionadaId) {
      setErrorMsg("Ahora selecciona una orden de trabajo.");
      return;
    }
    if (!serial) return;

    try {
      const response = await fetch(`${API_URL}/api/operador/enviar-a-calidad`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orden_id: ordenSeleccionadaId, serial })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const nuevoRegistro = { serial, hora: new Date().toLocaleTimeString() };
        const nuevoHistorialActual = [nuevoRegistro, ...historialActual];
        const totalRegistradas = avanceBaseDatos + nuevoHistorialActual.length;

        setHistorial(prev => ({
          ...prev,
          [ordenSeleccionadaId]: nuevoHistorialActual
        }));

        setScannedCode("");

        if (totalRegistradas >= ordenActiva.meta) {
          setTimeout(() => {
            alert(`¡Orden ${ordenActiva.id} completada con éxito!`);
            setHistorial(prev => ({ ...prev, [ordenSeleccionadaId]: [] }));
            setOrdenesActivas(prev => prev.filter(o => String(o.id) !== String(ordenSeleccionadaId)));
            setOrdenSeleccionadaId("");
          }, 300);
        }
      } else {
        setErrorMsg(result.message || "El serial no es válido para esta orden");
        setScannedCode("");
      }
    } catch {
      setErrorMsg("Error de red: No se pudo conectar con el servidor.");
    }
  }, [scannedCode, proyectoSeleccionado, ordenSeleccionadaId, ordenActiva, historialActual, avanceBaseDatos]);

  const mostrarPiezasOrdenes = useCallback(async (numero_orden) => {
    setLoadingPiezas(true);
    try {
      const response = await fetch(`${API_URL}/api/operador/orden-trabajo/estadistica/${encodeURIComponent(numero_orden)}`);
      if (response.ok) {
        const result = await response.json();
        setPiezasOrden(result.data || result);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingPiezas(false);
    }
  }, []);

  const handleProyectoChange = useCallback((value) => {
    setProyectoSeleccionado(value);
    setOrdenSeleccionadaId("");
    setErrorMsg("");
    setMostrarHistorial(false);
  }, []);

  const handleOrdenChange = useCallback((ordenId) => {
    setOrdenSeleccionadaId(ordenId);
    setErrorMsg("");
    setMostrarHistorial(false);

    const ordenSeleccionada = ordenesActivas.find(o => String(o.id) === String(ordenId));
    if (ordenSeleccionada?.numero_orden) {
      mostrarPiezasOrdenes(ordenSeleccionada.numero_orden);
    }
  }, [ordenesActivas, mostrarPiezasOrdenes]);

  return {
    ordenesFiltradas,
    ordenActiva,
    historialActual,
    registradas,
    progreso,
    ultimoEscaneo,
    avanceBaseDatos,
    proyectoSeleccionado,
    ordenSeleccionadaId,
    scannedCode,
    errorMsg,
    mostrarHistorial,
    piezasOrden,
    loadingPiezas,
    setScannedCode,
    setErrorMsg,
    setMostrarHistorial,
    handleRegister,
    handleProyectoChange,
    handleOrdenChange,
  };
}