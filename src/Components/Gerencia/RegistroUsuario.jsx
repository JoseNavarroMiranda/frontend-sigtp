import { useMemo, useState } from "react";
import { Card, Form, Button, Alert, Modal } from "react-bootstrap";
import { registrarUsuario } from "../../services/gerenteService";

const ROLES_SEED = [
  {
    id: 1,
    nombre: "Operador",
    descripcion:
      "Acceso producción. Responsable del registro inicial de cada tarjeta y su ingreso al proceso automatizado. Su interacción es operativa y en tiempo real",
  },
  {
    id: 2,
    nombre: "Calidad",
    descripcion:
      "Control defectos. Se encarga de la inspección final y clasificación de piezas. Tiene autoridad para registrar fallas y generar eventos de paro de línea",
  },
  {
    id: 3,
    nombre: "Supervisor",
    descripcion:
      "Control órdenes. Gestiona órdenes de producción y monitorea indicadores operativos. No autoriza paros, pero puede consultarlos y analizarlos",
  },
  {
    id: 4,
    nombre: "Técnico",
    descripcion:
      "Registro fallas y documenta evidencia visual desde la aplicación móvil",
  },
  {
    id: 5,
    nombre: "Ingeniero",
    descripcion:
      "Análisis proceso, datos históricos y valida decisiones técnicas complejas",
  },
  {
    id: 6,
    nombre: "Gerente",
    descripcion:
      "Vista ejecutiva y visualiza información estratégica para la toma de decisiones ejecutivas",
  },
];

function RegistroUsuario() {
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [rolId, setRolId] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);

  const rolSeleccionado = useMemo(
    () => ROLES_SEED.find((r) => String(r.id) === String(rolId)) || null,
    [rolId],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (!nombre.trim() || !password.trim() || !rolId) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setCargando(true);
    try {
      const resp = await registrarUsuario({
        nombre,
        password,
        rol_id: Number(rolId),
      });

      setExito(`Usuario ${resp.data?.nombre ?? nombre} registrado con número ${resp.data?.numero_empleado}.`);
      setNombre("");
      setPassword("");
      setRolId("");
      setMostrarModal(false);
    } catch (err) {
      setError(err.message || "Error al registrar usuario");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Card className="mb-3">
      <Card.Header>Registro de Usuarios</Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}
        {exito && (
          <Alert variant="success" onClose={() => setExito("")} dismissible>
            {exito}
          </Alert>
        )}

        <div className="d-grid">
          <Button variant="primary" onClick={() => setMostrarModal(true)}>
            Nuevo usuario
          </Button>
        </div>

        <div className="mt-3">
          <strong>Roles disponibles:</strong>
          <ul className="mb-0 small">
            {ROLES_SEED.map((rol) => (
              <li key={rol.id}>
                <strong>{rol.id} - {rol.nombre}:</strong> {rol.descripcion}
              </li>
            ))}
          </ul>
        </div>

        <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Registrar nuevo usuario</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre de usuario</Form.Label>
                <Form.Control
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Form.Text className="text-muted">
                  Mínimo 6 caracteres.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Rol</Form.Label>
                <Form.Select
                  value={rolId}
                  onChange={(e) => setRolId(e.target.value)}
                >
                  <option value="">Selecciona un rol</option>
                  {ROLES_SEED.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.id} - {rol.nombre}
                    </option>
                  ))}
                </Form.Select>
                {rolSeleccionado && (
                  <Form.Text className="text-muted">
                    {rolSeleccionado.descripcion}
                  </Form.Text>
                )}
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={cargando}>
                  {cargando ? "Registrando..." : "Registrar"}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Card.Body>
    </Card>
  );
}

export default RegistroUsuario;
