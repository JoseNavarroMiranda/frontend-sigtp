import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useInactividad } from '../../hooks/useInactividad';

function RutaProtegida({ children }) {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  useInactividad();

  useEffect(() => {
    // Este evento se dispara cuando el usuario presiona la flecha atrás
    const bloquearRegreso = () => {
      const tokenActual = localStorage.getItem('token');
      if (!tokenActual) {
        
        navigate('/', { 
          replace: true, 
          state: { mensaje: 'Debes iniciar sesión para continuar.' } 
        });
      } else {
        
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.history.pushState(null, '', window.location.href);

    window.addEventListener('popstate', bloquearRegreso);

    return () => {
      window.removeEventListener('popstate', bloquearRegreso);
    };
  }, [navigate]);

  if (!token) {
    return (
      <Navigate
        to="/"
        replace
        state={{ mensaje: 'Debes iniciar sesión para continuar.' }}
      />
    );
  }

  return children;
}

export default RutaProtegida;