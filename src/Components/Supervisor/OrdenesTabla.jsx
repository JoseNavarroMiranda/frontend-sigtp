import { Card, Table, Button, Badge } from "react-bootstrap";

function OrdenesTabla({ ordenes, onVerDetalle, obtenerNombreClienteProyecto }) {
// function OrdenesTabla({ ordenes, onVerDetalle }) {
    return (
        <Card>
            <Card.Header>Gestión de Órdenes - Listado</Card.Header>
            <Card.Body style={{ maxHeight: "420px", overflowY: "auto" }}>
                {ordenes.length === 0 ? (
                    <div className="text-muted">No hay órdenes registradas.</div>
                ) : (
                    <Table bordered hover size="sm" responsive>
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Número de Orden</th>
                                <th>Cliente / Proyecto</th>
                                <th>Cant. Planeada</th>
                                <th>Estatus</th>
                                <th>Fecha Inicio</th>
                                <th>Fecha Fin</th>
                                <th>Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ordenes.map((orden, index) => (
                                <tr key={orden.id || orden.numero_orden}>
                                    <td>{index + 1}</td>
                                    <td>{orden.numero_orden}</td>
                                    <td>{obtenerNombreClienteProyecto(orden)}</td> 
                                    <td>{orden.cantidad_planeada}</td>
                                    <td>
                                        <Badge
                                            bg={
                                                orden.estatus === "Planeada"
                                                    ? "secondary"
                                                    : orden.estatus === "En Proceso"
                                                    ? "success"
                                                    : orden.estatus === "Pausada"
                                                    ? "warning"
                                                    : "dark"
                                            }
                                        >
                                            {orden.estatus}
                                        </Badge>
                                    </td>
                                    <td>{orden.fecha_inicio ? new Date(orden.fecha_inicio).toLocaleString() : "-"}</td>
                                    <td>{orden.fecha_fin ? new Date(orden.fecha_fin).toLocaleString() : "-"}</td>
                                    <td>
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            onClick={() => onVerDetalle(orden)}
                                        >
                                            Ver
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card.Body>
        </Card>
    );
}

export default OrdenesTabla;
