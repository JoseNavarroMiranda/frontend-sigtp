const API_URL = import.meta.env.VITE_API_URL;

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || response.statusText);
  }
  return data;
};

export const registrarUsuario = async ({ nombre, password, rol_id }) => {
  const response = await fetch(`${API_URL}/api/gerente/registro-usuario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, password, rol_id }),
  });
  return handleResponse(response);
};

export const obtenerKpisProduccionHoy = async () => {
  const response = await fetch(`${API_URL}/api/gerente/kpis-produccion-hoy`);
  return handleResponse(response);
};

export const obtenerEstadisticaOrdenGerente = async (numero_orden) => {
  const response = await fetch(`${API_URL}/api/gerente/orden-trabajo/estadistica/${encodeURIComponent(numero_orden)}`);
  return handleResponse(response);
};

export const generarParoLinea = async ({ numero_orden, motivo }) => {
  const response = await fetch(`${API_URL}/api/gerente/generar-paro-linea`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ numero_orden, motivo }),
  });
  return handleResponse(response);
};

export const levantarParoLinea = async (numero_orden, { nuevo_estatus }) => {
  const response = await fetch(`${API_URL}/api/gerente/levantar-paro-linea/${encodeURIComponent(numero_orden)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nuevo_estatus }),
  });
  return handleResponse(response);
};
