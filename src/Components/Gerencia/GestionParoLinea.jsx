import { useState } from "react";
import { Card, Form, Button, Alert, Row, Col, Table, Spinner } from "react-bootstrap";
import { obtenerEstadisticaOrdenGerente, generarParoLinea, levantarParoLinea } from "../../services/gerenteService";

function GestionParoLinea() {
  const [numeroOrdenConsulta, setNumeroOrdenConsulta] = useState("");
  const [infoOrden, setInfoOrden] = useState(null);
  const [cargandoOrden, setCargandoOrden] = useState(false);

  const [numeroOrdenParo, setNumeroOrdenParo] = useState("");
  const [motivoParo, setMotivoParo] = useState("");

  const [numeroOrdenLevantar, setNumeroOrdenLevantar] = useState("");
  const [nuevoEstatus, setNuevoEstatus] = useState("En Proceso");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargandoAccion, setCargandoAccion] = useState(false);

  const handleConsultarOrden = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setInfoOrden(null);

    if (!numeroOrdenConsulta.trim()) {
      setError("Ingresa un número de orden para consultar.");
      return;
    }

    setCargandoOrden(true);
    try {
      const resp = await obtenerEstadisticaOrdenGerente(numeroOrdenConsulta.trim());
      setInfoOrden(resp.data);
    } catch (err) {
      setError(err.message || "Error al consultar estadísticas de la orden");
    } finally {
      setCargandoOrden(false);
    }
  };

  const handleGenerarParo = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (!numeroOrdenParo.trim() || !motivoParo.trim()) {
      setError("Número de orden y motivo son obligatorios para generar paro.");
      return;
    }

    setCargandoAccion(true);
    try {
      const resp = await generarParoLinea({
        numero_orden: numeroOrdenParo.trim(),
        motivo: motivoParo.trim(),
      });
      setMensaje(resp.message || "Paro de línea generado correctamente.");
    } catch (err) {
      setError(err.message || "Error al generar paro de línea");
    } finally {
      setCargandoAccion(false);
    }
  };

  const handleLevantarParo = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (!numeroOrdenLevantar.trim()) {
      setError("Número de orden es obligatorio para levantar paro.");
      return;
    }

    setCargandoAccion(true);
    try {
      const resp = await levantarParoLinea(numeroOrdenLevantar.trim(), {
        nuevo_estatus: nuevoEstatus,
      });
      setMensaje(resp.message || "Paro de línea levantado correctamente.");
    } catch (err) {
      setError(err.message || "Error al levantar paro de línea");
    } finally {
      setCargandoAccion(false);
    }
  };

  const estadisticas = infoOrden?.estadisticas || {};
  const piezas = infoOrden?.detalle_piezas || [];

  return (
    <Card className="mb-3">
      <Card.Header>Gestión de Órdenes y Paros de Línea</Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}
        {mensaje && (
          <Alert variant="success" onClose={() => setMensaje("")} dismissible>
            {mensaje}
          </Alert>
        )}

        <Row className="mb-4">
          <Col md={6} className="mb-3">
            <Card>
              <Card.Header>Consultar performance por Orden</Card.Header>
              <Card.Body>
                <Form onSubmit={handleConsultarOrden}>
                  <Form.Group className="mb-3">
                    <Form.Label>Número de orden</Form.Label>
                    <Form.Control
                      type="text"
                      value={numeroOrdenConsulta}
                      onChange={(e) => setNumeroOrdenConsulta(e.target.value)}
                    />
                  </Form.Group>
                  <div className="d-grid">
                    <Button type="submit" variant="primary" disabled={cargandoOrden}>
                      {cargandoOrden ? "Consultando..." : "Consultar"}
                    </Button>
                  </div>
                </Form>

                {cargandoOrden && (
                  <div className="mt-2">
                    <Spinner animation="border" size="sm" /> Cargando información...
                  </div>
                )}

                {infoOrden && !cargandoOrden && (
                  <>
                    <hr />
                    <p className="mb-1">
                      <strong>Orden:</strong> {infoOrden.orden?.numero_orden} ({infoOrden.orden?.proyecto})
                    </p>
                    <Row className="mt-2">
                      <Col md={4} className="mb-2">
                        <Card bg="light">
                          <Card.Body>
                            <div className="text-muted">Total piezas</div>
                            <div className="fs-5">{estadisticas.total ?? 0}</div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4} className="mb-2">
                        <Card bg="light">
                          <Card.Body>
                            <div className="text-muted">OK</div>
                            <div className="fs-5">{estadisticas.ok ?? 0}</div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4} className="mb-2">
                        <Card bg="light">
                          <Card.Body>
                            <div className="text-muted">Avance</div>
                            <div className="fs-5">{estadisticas.avance ?? "0%"}</div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    {piezas.length > 0 && (
                      <div className="mt-3" style={{ maxHeight: 220, overflowY: "auto" }}>
                        <Table size="sm" bordered hover>
                          <thead className="table-light">
                            <tr>
                              <th>Serial</th>
                              <th>Estatus</th>
                            </tr>
                          </thead>
                          <tbody>
                            {piezas.map((p) => (
                              <tr key={p.serial}>
                                <td>{p.serial}</td>
                                <td>{p.estatus}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-3">
            <Card className="mb-3">
              <Card.Header>Autorizar Paro de Línea</Card.Header>
              <Card.Body>
                <Form onSubmit={handleGenerarParo}>
                  <Form.Group className="mb-3">
                    <Form.Label>Número de orden</Form.Label>
                    <Form.Control
                      type="text"
                      value={numeroOrdenParo}
                      onChange={(e) => setNumeroOrdenParo(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Motivo del paro</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={motivoParo}
                      onChange={(e) => setMotivoParo(e.target.value)}
                    />
                  </Form.Group>
                  <div className="d-grid">
                    <Button type="submit" variant="danger" disabled={cargandoAccion}>
                      {cargandoAccion ? "Procesando..." : "Generar paro"}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>Levantar Paro de Línea</Card.Header>
              <Card.Body>
                <Form onSubmit={handleLevantarParo}>
                  <Form.Group className="mb-3">
                    <Form.Label>Número de orden</Form.Label>
                    <Form.Control
                      type="text"
                      value={numeroOrdenLevantar}
                      onChange={(e) => setNumeroOrdenLevantar(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Nuevo estatus</Form.Label>
                    <Form.Select
                      value={nuevoEstatus}
                      onChange={(e) => setNuevoEstatus(e.target.value)}
                    >
                      <option value="En Proceso">En Proceso</option>
                      <option value="Finalizada">Finalizada</option>
                    </Form.Select>
                  </Form.Group>
                  <div className="d-grid">
                    <Button type="submit" variant="success" disabled={cargandoAccion}>
                      {cargandoAccion ? "Procesando..." : "Levantar paro"}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default GestionParoLinea;
