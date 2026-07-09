import { Container, Card, Form, Button, Alert } from "react-bootstrap";

export function VistaBloqueado({
  errorDesbloqueo,
  credenciales,
  setCredenciales,
  manejarDesbloqueo,
}) {
  return (
    <Container className="py-5">
      <Card className="shadow-lg border-danger" style={{ borderWidth: '3px', maxWidth: '600px', margin: '0 auto' }}>
        <Card.Header className="bg-danger text-white text-center py-4">
          <h2 className="mb-0 fw-bold">PARO DE L\u00cdNEA ACTIVO</h2>
        </Card.Header>
        <Card.Body className="p-4 bg-light">
          <Alert variant="danger" className="text-center fw-bold">
            Los t\u00e9cnicos han sido notificados. La l\u00ednea est\u00e1 bloqueada.
          </Alert>
          <p className="text-center mb-4 text-muted">
            Para reanudar la inspecci\u00f3n, se requiere la autorizaci\u00f3n de un <strong>Supervisor</strong> o un <strong>Ingeniero de Procesos</strong>.
          </p>

          {errorDesbloqueo && <Alert variant="danger">{errorDesbloqueo}</Alert>}

          <Form onSubmit={manejarDesbloqueo}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">N\u00famero de Empleado</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej. S001"
                value={credenciales.numero_empleado}
                onChange={(e) => setCredenciales({...credenciales, numero_empleado: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Contrase\u00f1a</Form.Label>
              <Form.Control
                type="password"
                placeholder="********"
                value={credenciales.password}
                onChange={(e) => setCredenciales({...credenciales, password: e.target.value})}
                required
              />
            </Form.Group>
            <Button variant="dark" type="submit" size="lg" className="w-100 fw-bold py-2">
              Autorizar Desbloqueo
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}