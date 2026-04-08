import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';


const TIEMPO_INACTIVIDAD = 3 * 60 * 1000;

export const useInactividad = () => {
  const navigate = useNavigate();
  const temporizador = useRef(null); // useRef guarda el temporizador sin re-renderizar

  // Función que cierra la sesión
  const cerrarSesion = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/', {
      replace: true,
      state: { mensaje: 'Tu sesión se cerró por inactividad. Inicia sesión nuevamente.' }
    });
  }, [navigate]);

  // Función que reinicia el temporizador cada vez que hay actividad
  const reiniciarTemporizador = useCallback(() => {
    if (temporizador.current) {
      clearTimeout(temporizador.current);
    }
    // Inicia uno nuevo
    temporizador.current = setTimeout(cerrarSesion, TIEMPO_INACTIVIDAD);
  }, [cerrarSesion]);

  useEffect(() => {
    const eventos = [
      'mousemove',  
      'mousedown',
      'keypress',   
      'scroll',    
      'touchstart', 
    ];

    eventos.forEach(evento => {
      window.addEventListener(evento, reiniciarTemporizador);
    });

    reiniciarTemporizador();

    return () => {
      if (temporizador.current) {
        clearTimeout(temporizador.current);
      }
      eventos.forEach(evento => {
        window.removeEventListener(evento, reiniciarTemporizador);
      });
    };
  }, [reiniciarTemporizador]);
};