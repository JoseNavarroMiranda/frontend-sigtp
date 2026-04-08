import { Card, Form, Button } from "react-bootstrap";

function OrdenForm({
    estaciones,
    clienteProyecto,
    setClienteProyecto,
    cantidadPlaneada,
    setCantidadPlaneada,
    estacionSeleccionada,
    setEstacionSeleccionada,
    creandoOrden,
    onSubmit,
}) {
    return (
        <Card>
            <Card.Header>Gestión de Órdenes - Creación</Card.Header>
            <Card.Body>
                <Form onSubmit={onSubmit}>
                    {/* <Form.Group className="mb-3">
                        <Form.Label>Cliente / Proyecto</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nombre del cliente o proyecto"
                            value={clienteProyecto}
                            onChange={(e) => setClienteProyecto(e.target.value)}
                        />
                        <Form.Text className="text-muted">
                            Campo utilizado para identificar el proyecto en la tabla.
                        </Form.Text>
                    </Form.Group> */}

                      <Form.Group className="mb-3">
                        <Form.Label>Cliente / Proyecto</Form.Label>
                        <Form.Select
                            value={clienteProyecto}
                            onChange={(e) => setClienteProyecto(e.target.value)}
                        >
                            <option value="">Selecciona un proyecto</option>
                            <option value="KIA">KIA</option>
                            <option value="TOYOTA">TOYOTA</option>
                        </Form.Select>
                    </Form.Group>




                    <Form.Group className="mb-3">
                        <Form.Label>Cantidad planeada (PCBs)</Form.Label>
                        <Form.Control
                            type="number"
                            min={1}
                            value={cantidadPlaneada}
                            onChange={(e) => setCantidadPlaneada(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Estación / Línea inicial</Form.Label>
                        <Form.Select
                            value={estacionSeleccionada}
                            onChange={(e) => setEstacionSeleccionada(e.target.value)}
                        >
                            <option value="">Selecciona una estación (opcional)</option>
                            {estaciones.map((est) => (
                                <option key={est.id} value={est.id}>
                                    {est.nombre}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <div className="d-grid">
                        <Button type="submit" variant="primary" disabled={creandoOrden}>
                            {creandoOrden ? "Creando orden..." : "Crear orden de trabajo"}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
}

export default OrdenForm;
