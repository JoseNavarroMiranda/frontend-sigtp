import { Card, Row, Col, Button, Badge } from "react-bootstrap";

function ControlPlanta({ resumenDiario, lineasProduccion, onVerDetalleLinea }) {
    return (
        <Row className="mb-4">
            <Col md={4}>
                <Card>
                    <Card.Header>Control de Planta - Resumen Diario</Card.Header>
                    <Card.Body>
                        <p className="mb-1">Proyectos programados para hoy:</p>
                        <h3>{resumenDiario.totalProyectosHoy}</h3>
                        <small className="text-muted">
                            Basado en órdenes con fecha de inicio del día actual.
                        </small>
                    </Card.Body>
                </Card>
            </Col>

            <Col md={8}>
                <Card>
                    <Card.Header>Control de Planta - Líneas de Producción</Card.Header>
                    <Card.Body>
                        <Row>
                            {lineasProduccion.map((linea) => (
                                <Col md={6} key={linea.id} className="mb-3">
                                    <Card border={linea.estado === "Activa" ? "success" : "secondary"}>
                                        <Card.Body>
                                            <Card.Title className="d-flex justify-content-between align-items-center">
                                                <span>{linea.nombre}</span>
                                                <Badge bg={linea.estado === "Activa" ? "success" : "secondary"}>
                                                    {linea.estado}
                                                </Badge>
                                            </Card.Title>
                                            <div className="mt-2">
                                                <div>
                                                    <strong>Proyecto actual:</strong> {linea.proyecto}
                                                </div>
                                                <div>
                                                    <strong>Total PCBs a producir:</strong> {linea.totalPCBs}
                                                </div>
                                            </div>
                                            {linea.orden && (
                                                <div className="mt-3">
                                                    <Button
                                                        size="sm"
                                                        variant="outline-primary"
                                                        onClick={() => onVerDetalleLinea(linea.orden)}
                                                    >
                                                        Ver detalle de producción
                                                    </Button>
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}

export default ControlPlanta;
