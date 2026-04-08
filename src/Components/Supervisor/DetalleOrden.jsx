import { Card, Row, Col, Spinner } from "react-bootstrap";

function DetalleOrden({ ordenSeleccionada, detalleOrden, cargandoDetalle, obtenerNombreClienteProyecto }) {
    return (
        <Card>
            <Card.Header>Detalle de Orden Seleccionada</Card.Header>
            <Card.Body>
                {!ordenSeleccionada && (
                    <div className="text-muted">Selecciona una orden para ver su detalle.</div>
                )}
                {ordenSeleccionada && (
                    <>
                        <p className="mb-1">
                            <strong>Orden:</strong> {ordenSeleccionada.numero_orden} ({" "}
                            {obtenerNombreClienteProyecto(ordenSeleccionada)})
                        </p>
                        {cargandoDetalle && (
                            <div className="mt-2">
                                <Spinner animation="border" size="sm" /> Cargando detalle...
                            </div>
                        )}
                        {!cargandoDetalle && detalleOrden && (
                            <Row className="mt-3">
                                <Col md={3} className="mb-2">
                                    <Card bg="light">
                                        <Card.Body>
                                            <div className="text-muted">Total piezas</div>
                                            <div className="fs-4">{detalleOrden.estadisticas?.total ?? 0}</div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={3} className="mb-2">
                                    <Card bg="light">
                                        <Card.Body>
                                            <div className="text-muted">OK</div>
                                            <div className="fs-4">{detalleOrden.estadisticas?.ok ?? 0}</div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={3} className="mb-2">
                                    <Card bg="light">
                                        <Card.Body>
                                            <div className="text-muted">Retrabajo</div>
                                            <div className="fs-4">{detalleOrden.estadisticas?.retrabajo ?? 0}</div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={3} className="mb-2">
                                    <Card bg="light">
                                        <Card.Body>
                                            <div className="text-muted">Scrap / errores</div>
                                            <div className="fs-4">{detalleOrden.estadisticas?.scrap ?? 0}</div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        )}
                        {!cargandoDetalle && !detalleOrden && (
                            <div className="mt-2 text-muted">
                                No hay información de detalle disponible para esta orden.
                            </div>
                        )}
                    </>
                )}
            </Card.Body>
        </Card>
    );
}

export default DetalleOrden;
