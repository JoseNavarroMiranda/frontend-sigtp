import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import NavDropdown from "react-bootstrap/NavDropdown";
import Navbar from "react-bootstrap/Navbar";
import { useNavigate } from "react-router-dom";
import logo from '../../assets/nova.png'; // Ruta al logo

export function AppNavbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Al cargar el Navbar, buscamos al usuario en el localStorage (tal como lo guardaste en Login.js)
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario"); 
    if (usuarioGuardado) {
      setUser(JSON.parse(usuarioGuardado));
    }
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/"); // Redirigimos al login
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="px-3 py-2 shadow-sm border-bottom border-primary-subtle">
      <Container fluid>
        {/* Lado izquierdo: Logo */}
        <Navbar.Brand className="fw-bold text-white fs-4">
                <img 
          src={logo} 
          alt="Company Logo" 
          className="rounded" 
        style={{ height: '100px', width: 'auto' }}
        />

        </Navbar.Brand>
        
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end align-items-center">
          
          {/* Lado derecho: Datos del usuario (Solo se muestran si hay alguien logueado) */}
          {user && (
            <div className="d-flex align-items-center text-end me-3">
              <div className="d-flex flex-column me-2">
                <span className="text-white fw-bold lh-1" style={{fontSize: '0.9rem'}}>
                  {user.nombre} {user.apellidos} {/* Ajusta esto según los campos de tu BD */}
                </span>
                <span className="text-white-50" style={{fontSize: '0.7rem'}}>
                  {/* Aquí puedes mapear el rol si solo tienes el ID, o poner el nombre si ya lo trae */}
                  OPERADOR DE PRODUCCIÓN 
                </span>
              </div>
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                style={{ width: '35px', height: '35px', backgroundColor: '#818cf8', color: 'white', fontSize: '0.8rem' }}
              >
                {/* Genera iniciales automáticas, por ejemplo "JP" */}
                {user.nombre ? user.nombre.substring(0, 2).toUpperCase() : "US"}
              </div>
            </div>
          )}

          {/* Menú desplegable */}
          <NavDropdown
            id="nav-dropdown"
            align="end"
            title={<span className="text-white fw-medium">Cuenta</span>}
            menuVariant="light"
          >
            <NavDropdown.Item onClick={() => navigate('/perfil')}>Mi Perfil</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={handleLogout} className="text-danger">
              Cerrar sesión
            </NavDropdown.Item>
          </NavDropdown>

        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}