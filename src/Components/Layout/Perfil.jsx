import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export function Perfil() {

    const API_URL = import.meta.env.VITE_API_URL 


  const navigate = useNavigate();
  const [user, setUser] = useState({});
  
  // 1. DICCIONARIO DE ROLES (Igual al de tu Navbar para consistencia)
  const roleMapping = {
    1: "TECNICO",
    2: "INGENIERO DE PROCESOS",
    3: "GERENTE",
    4: "OPERADOR SMT",
    5: "SUPERVISOR",
    6: "CALIDAD"
  };

  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  useEffect(() => {
    const usuarioGuardado = sessionStorage.getItem("usuario");
    if (usuarioGuardado) {
      setUser(JSON.parse(usuarioGuardado));
    }
  }, []);

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: "", texto: "" });

    if (passwordNueva !== confirmarPassword) {
      setMensaje({ tipo: "danger", texto: "Las contraseñas nuevas no coinciden." });
      return;
    }

    try {
      const token = sessionStorage.getItem('token'); 
     
      const response = await fetch(`${API_URL}/api/sesiones/cambiar-password`, {                


        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          passwordActual: passwordActual,
          passwordNueva: passwordNueva
        })
      });

      const data = await response.json();

      if (data.success) {
        setMensaje({ tipo: "success", texto: data.message });
        setPasswordActual("");
        setPasswordNueva("");
        setConfirmarPassword("");
      } else {
        setMensaje({ tipo: "danger", texto: data.message || "Error al cambiar la contraseña." });
      }
    } catch (error) {
      setMensaje({ tipo: "danger", texto: "Error de conexión con el servidor." });
    }
  };

  // Función para iniciales (Nombre + Apellido)
  const getInitials = () => {
    if (!user.nombre) return "US";
    const n = user.nombre.charAt(0);
    const a = user.apellidos ? user.apellidos.charAt(0) : "";
    return (n + a).toUpperCase();
  };

  return (
    <Container className="py-5 d-flex justify-content-center">
      <Card className="shadow-lg border-0" style={{ width: "100%", maxWidth: "500px" }}>
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center py-3">
          <h5 className="mb-0 fw-bold">Mi Perfil</h5>
          <Button variant="light" size="sm" onClick={() => navigate(-1)} className="fw-bold text-primary shadow-sm">
            Volver
          </Button>
        </Card.Header>
        
        <Card.Body className="p-4">
          <div className="mb-4 text-center">
            {/* CÍRCULO DE PERFIL CON INICIALES REALES */}
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white mx-auto mb-3 shadow"
              style={{ width: '90px', height: '90px', backgroundColor: '#6366f1', fontSize: '2.2rem', border: '4px solid #e2e8f0' }}
            >
              {getInitials()}
            </div>

            <h3 className="fw-bold mb-1">{user.nombre} {user.apellidos}</h3>
            
            {/* 2. ROL MAPEADO DINÁMICAMENTE */}
            <p className="text-primary fw-bold mb-1" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>
              {user.rol || roleMapping[user.rol_id] || "USUARIO DEL SISTEMA"}
            </p>
            
            <p className="text-muted small">
              Número de Empleado: <span className="fw-bold">{user.numero_empleado || user.id}</span>
            </p>
          </div>

          <hr className="my-4" />

          <h5 className="fw-bold mb-3 text-secondary">Seguridad de la Cuenta</h5>
          
          {mensaje.texto && (
            <Alert variant={mensaje.tipo} className="py-2 small shadow-sm">
              {mensaje.texto}
            </Alert>
          )}

          <Form onSubmit={handleCambiarPassword}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Contraseña Actual</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="••••••••"
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Nueva Contraseña</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Mínimo 8 caracteres"
                value={passwordNueva}
                onChange={(e) => setPasswordNueva(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold">Confirmar Nueva Contraseña</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Repite la nueva contraseña"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                required
              />
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit" className="fw-bold py-2 shadow-sm">
                Guardar Nueva Contraseña
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}