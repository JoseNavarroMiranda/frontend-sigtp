import { useEffect, useState } from "react";
import { Card, Row, Col, Spinner, Alert } from "react-bootstrap";
import { obtenerKpisProduccionHoy } from "../../services/gerenteService";

function KpisProduccionHoy() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarKpis = async () => {
      try {
        setError("");
        const resp = await obtenerKpisProduccionHoy();
        setKpis(resp.data);
      } catch (err) {
        setError(err.message || "Error al cargar KPIs de producción");
      } finally {
        setLoading(false);
      }
    };

    cargarKpis();
  }, []);

  if (loading) {
    return (
      <Card className="mb-3">
        <Card.Header>Indicadores de Producción - Hoy</Card.Header>
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" /> Cargando KPIs...
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-3">
        <Card.Header>Indicadores de Producción - Hoy</Card.Header>
        <Card.Body>
          <Alert variant="danger" className="mb-0">{error}</Alert>
        </Card.Body>
      </Card>
    );
  }

  if (!kpis) {
    return null;
  }

  const produccion = kpis.produccion_piezas || {};
  const detalle = produccion.detalle || {};
  const indicadores = kpis.indicadores_calidad || {};

  return (
    <Card className="mb-3">
      <Card.Header>Indicadores de Producción - Hoy</Card.Header>
      <Card.Body>
        <Row className="mb-3">
          <Col md={3} className="mb-2">
            <Card bg="light">
              <Card.Body>
                <div className="text-muted">Órdenes creadas hoy</div>
                <div className="fs-4">{kpis.resumen_ordenes?.ordenes_creadas_hoy ?? 0}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-2">
            <Card bg="light">
              <Card.Body>
                <div className="text-muted">Total piezas producidas</div>
                <div className="fs-4">{produccion.total_producido ?? 0}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-2">
            <Card bg="light">
              <Card.Body>
                <div className="text-muted">FPY</div>
                <div className="fs-4">{indicadores.fpy_porcentaje ?? "0%"}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-2">
            <Card bg="light">
              <Card.Body>
                <div className="text-muted">Scrap rate</div>
                <div className="fs-4">{indicadores.scrap_rate ?? "0%"}</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={2} className="mb-2">
            <Card bg="light">
              <Card.Body>
                <div className="text-muted">OK</div>
                <div className="fs-5">{detalle.bueno_ok ?? 0}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2} className="mb-2">
            <Card bg="light">
              <Card.Body>
                <div className="text-muted">Retrabajo</div>
                <div className="fs-5">{detalle.retrabajo ?? 0}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2} className="mb-2">
            <Card bg="light">
              <Card.Body>
                <div className="text-muted">Scrap</div>
                <div className="fs-5">{detalle.desecho_scrap ?? 0}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-2">
            <Card bg="light">
              <Card.Body>
                <div className="text-muted">En línea SMT</div>
                <div className="fs-5">{detalle.en_linea_smt ?? 0}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-2">
            <Card bg="light">
              <Card.Body>
                <div className="text-muted">Esperando calidad</div>
                <div className="fs-5">{detalle.esperando_calidad ?? 0}</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default KpisProduccionHoy;
