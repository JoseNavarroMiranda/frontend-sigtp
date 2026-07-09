import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Button, Card, Container, Alert, Spinner } from "react-bootstrap";
import { loginService } from "../../services/authService";

const RUTAS_POR_ROL = {
  1: "/operador",
  2: "/calidad",
  3: "/supervisor",
  6: "/gerencia",
};

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const mensajeExterno = location.state?.mensaje;

  //Permite controlar la navegacion de usuario al intentar regresar de pagina dashboard a login
  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (token && usuario) {
      const ruta = RUTAS_POR_ROL[usuario.rol_id] || '/';
      navigate(ruta, { replace: true }); 
    }
  }, []); // unicamente se carga una vez cuando el componente se carga

  const [noEmpleado, setnoEmpleado] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!noEmpleado.trim() || !password.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setCargando(true);
    try {
      const respuesta = await loginService(noEmpleado, password);
      const { token, usuario } = respuesta.data;

      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      console.log("PASO 4: Datos extraídos. Token:", token, "Usuario:", usuario);

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("usuario", JSON.stringify(usuario));


      const ruta = RUTAS_POR_ROL[usuario.rol_id] || "/";
      navigate(ruta, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center">
      <Card
        style={{ width: "100%", maxWidth: "420px", minHeight: "520px" }}
        className="shadow-lg p-4 border-0"
      >
        <Card.Body className="d-flex flex-column">
          <Card.Title className="text-center mb-5 fs-2 fw-bold">
            Iniciar Sesión
          </Card.Title>

          {/* mensaje de error de RutaProtegida*/} 
          {mensajeExterno && (
            <Alert variant="warning" className="py-2">{mensajeExterno}</Alert>
          )}


          {/*mensaje de error en formulario*/}
          {error && (
            <Alert variant="danger" className="py-2">
              {error}
            </Alert>
          )}

          <Form
            className="d-flex flex-column flex-grow-1 justify-content-between"
            onSubmit={handleSubmit}
          >
            <div>
              <Form.Group className="mb-4" controlId="formBasicNombre">
                <Form.Label className="fw-semibold">Usuario</Form.Label>
                <Form.Control
                  size="lg"
                  type="text"
                  placeholder="Numero de empleado"
                  className="bg-light"
                  value={noEmpleado}
                  onChange={(e) => setnoEmpleado(e.target.value)}
                  disabled={cargando}
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="formBasicPassword">
                <Form.Label className="fw-semibold">Contraseña</Form.Label>
                <Form.Control
                  size="lg"
                  type="password"
                  placeholder="Tu contraseña"
                  className="bg-light"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={cargando}
                />
              </Form.Group>
            </div>

            <div className="d-grid gap-2">
              <Button
                variant="outline-primary"
                type="submit"
                size="lg"
                className="py-3 shadow-sm"
                disabled={cargando}
              >
                {cargando ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Verificando...
                  </>
                ) : (
                  "Ingresar al sistema"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;
