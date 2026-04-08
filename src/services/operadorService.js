const API_URL = import.meta.env.VITE_API_URL;

export const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || response.statusText);
  }
  return data;
};

export const obtenerOrdenesTrabajo = async ({ estatus, page = 1, limit = 10 } = {}) => {
  const params = new URLSearchParams();
  if (estatus) params.append('estatus', estatus);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  const response = await fetch(`${API_URL}/api/supervisor/ordenes-trabajo?${params.toString()}`);
  return handleResponse(response);
};

export const crearOrdenTrabajo = async ({ cantidad_planeada, estacion_actual_id, proyecto}) => {
  const response = await fetch(`${API_URL}/api/supervisor/generar-orden-trabajo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cantidad_planeada, estacion_actual_id, proyecto}),
  });
  return handleResponse(response);
};

export const obtenerEstaciones = async () => {
  const response = await fetch(`${API_URL}/api/supervisor/estaciones`);
  return handleResponse(response);
};

export const obtenerEstadisticaOrden = async (numero_orden) => {
  const response = await fetch(`${API_URL}/api/supervisor/orden-trabajo/estadistica/${encodeURIComponent(numero_orden)}`);
  return handleResponse(response);
};
