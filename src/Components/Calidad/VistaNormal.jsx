import { Container, Card, Form, Button, Alert, Row, Col, Badge } from "react-bootstrap";

export function VistaNormal({
  ordenActiva,
  fallasConsecutivas,
  mensaje,
  serialBusqueda,
  setSerialBusqueda,
  piezaActual,
  proyecto,
  fallaSeleccionada,
  setFallaSeleccionada,
  catalogoFallas,
  buscarPieza,
  dictaminarPieza,
  limpiarOrdenActiva,
}) {
  return (
    <Container className="py-5">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-dark text-white py-3">
          <h4 className="mb-0 fw-bold">Inspecci\u00f3n de Calidad SMT</h4>
        </Card.Header>
        <Card.Body className="p-4">
          {ordenActiva && (
            <Alert variant="info" className="d-flex justify-content-between align-items-center mb-4">
              <span className="fs-5">
                <strong>Orden Activa:</strong> {ordenActiva} <br />
                <small>Solo se aceptan piezas de esta orden.</small>
              </span>
              <Button variant="outline-dark" size="sm" onClick={limpiarOrdenActiva}>
                Liberar Candado / Cambiar Orden
              </Button>
            </Alert>
          )}

          {fallasConsecutivas > 0 && (
            <Alert variant="warning" className="fw-bold text-center">
              Alerta: Llevas {fallasConsecutivas} pieza(s) defectuosa(s) consecutiva(s). Al llegar a 3 se bloquear\u00e1 la l\u00ednea.
            </Alert>
          )}

          {mensaje.texto && <Alert variant={mensaje.tipo}>{mensaje.texto}</Alert>}

          <Form onSubmit={buscarPieza} className="mb-4">
            <Form.Group>
              <Form.Label className="fw-bold">Escanear Serial de PCB</Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Ej. TYT-001, KIA-050..."
                  value={serialBusqueda}
                  onChange={(e) => setSerialBusqueda(e.target.value)}
                  autoFocus required
                />
                <Button variant="primary" type="submit" style={{ minWidth: '120px' }}>
                  Buscar
                </Button>
              </div>
            </Form.Group>
          </Form>

          {piezaActual && (
            <div className="p-4 border rounded bg-light">
              <Row className="mb-4 align-items-center">
                <Col md={8}>
                  <h3 className="fw-bold text-primary mb-1">Serial: {piezaActual.serial}</h3>
                  <p className="text-muted mb-0">Orden: {piezaActual.orden?.numero_orden || 'N/A'}</p>
                </Col>
                <Col md={4} className="text-md-end text-start mt-3 mt-md-0">
                  <Badge bg={proyecto === 'TOYOTA' ? 'danger' : proyecto === 'KIA' ? 'dark' : 'secondary'} className="fs-5 px-3 py-2">
                    Proyecto: {proyecto}
                  </Badge>
                </Col>
              </Row>
              <hr />

              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Cat\u00e1logo de Fallas (Obligatorio para rechazos)</Form.Label>
                <Form.Select value={fallaSeleccionada} onChange={(e) => setFallaSeleccionada(e.target.value)}>
                  <option value="">-- Selecciona una falla si la pieza est\u00e1 mal --</option>
                  {catalogoFallas.map((falla, idx) => <option key={idx} value={falla}>{falla}</option>)}
                </Form.Select>
              </Form.Group>

              <h5 className="fw-bold mb-3 text-center">Dictaminar Pieza</h5>
              <Row className="g-3">
                <Col md={4}>
                  <Button variant="success" size="lg" className="w-100 fw-bold py-3" onClick={() => dictaminarPieza('OK')}>
                    APROBAR (OK)
                  </Button>
                </Col>
                <Col md={4}>
                  <Button variant="warning" size="lg" className="w-100 fw-bold py-3 text-dark" onClick={() => dictaminarPieza('Retrabajo')}>
                    RETRABAJO
                  </Button>
                </Col>
                <Col md={4}>
                  <Button variant="danger" size="lg" className="w-100 fw-bold py-3" onClick={() => dictaminarPieza('Scrap')}>
                    SCRAP
                  </Button>
                </Col>
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}