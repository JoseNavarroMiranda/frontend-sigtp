const API_URL = import.meta.env.VITE_API_URL;

export const loginService = async (numero_empleado, password) => {
    const response = await fetch(`${API_URL}/api/sesiones/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero_empleado, password })
    });

    const data = await response.json();

    if (!response.ok) {
        console.log(response.Error)
        throw new Error(data.message || response.statusText);
    }
    // return data;
    return { data: data.data ? data.data : data };


    };