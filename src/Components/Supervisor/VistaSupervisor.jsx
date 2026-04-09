import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import { crearOrdenTrabajo, obtenerEstaciones, obtenerOrdenesTrabajo, obtenerEstadisticaOrden } from "../../services/supervisorService";
import OrdenForm from "./OrdenForm";
import OrdenesTabla from "./OrdenesTabla";
import ControlPlanta from "./ControlPlanta";
import DetalleOrden from "./DetalleOrden";

function VistaSupervisor() {
    const [estaciones, setEstaciones] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [loadingInicial, setLoadingInicial] = useState(true);
    const [error, setError] = useState("");

    // Formulario creación de orden
    const [clienteProyecto, setClienteProyecto] = useState("");
    const [cantidadPlaneada, setCantidadPlaneada] = useState("");
    const [estacionSeleccionada, setEstacionSeleccionada] = useState("");
    const [creandoOrden, setCreandoOrden] = useState(false);

    // Detalle de orden seleccionada (producción vs errores)
    const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
    const [detalleOrden, setDetalleOrden] = useState(null);
    const [cargandoDetalle, setCargandoDetalle] = useState(false);

    useEffect(() => {
        const cargarDatosIniciales = async () => {
            try {
                setError("");

                const [respEstaciones, respOrdenes] = await Promise.all([
                    obtenerEstaciones(),
                    obtenerOrdenesTrabajo({ page: 1, limit: 50 }),
                ]);
                     
                // Agrega este console.log para depurar 
                console.log('Respuesta de órdenes:', respOrdenes);
                console.log('Primera orden:', respOrdenes.data?.ordenes?.[0]);


                setEstaciones(respEstaciones.data || []);
                setOrdenes(respOrdenes.data?.ordenes || []);
            } catch (err) {
                setError(err.message || "Error cargando datos iniciales");
            } finally {
                setLoadingInicial(false);
            }
        };

        cargarDatosIniciales();
    }, []);

    const handleCrearOrden = async (e) => {
        e.preventDefault();
        setError("");

        if (!cantidadPlaneada || Number(cantidadPlaneada) <= 0) {
            setError("La cantidad planeada debe ser mayor a 0.");
            return;
        }

        setCreandoOrden(true);
        try {
            const resp = await crearOrdenTrabajo({
                cantidad_planeada: Number(cantidadPlaneada),
                estacion_actual_id: estacionSeleccionada || null,
                proyecto: clienteProyecto
            });

            const nuevaOrden = resp.data?.orden;

            if (nuevaOrden) {
                // Adjuntamos el nombre de cliente/proyecto solo a nivel UI si existe
                const ordenConNombre = {
                    ...nuevaOrden,
                    clienteProyecto: nuevaOrden.clienteProyecto || nuevaOrden.nombre || nuevaOrden.cliente || nuevaOrden.proyecto
                };
                setOrdenes((prev) => [ordenConNombre, ...prev]);
            }

            setClienteProyecto("");
            setCantidadPlaneada("");
            setEstacionSeleccionada("");
            alert("Orden de trabajo generada exitosamente")
            window.location.reload();
        } catch (err) {
            setError(err.message || "Error al crear la orden de trabajo");
        } finally {
            setCreandoOrden(false);
        }
    };

    // const obtenerNombreClienteProyecto = (orden) => {
    //     console.log(orden.proyecto)
    //     if (!orden) return "no hay orden";
    //     return (
    //         orden.clienteProyecto ||
    //         orden.nombre ||
    //         orden.cliente ||
    //         orden.proyecto 
    //     );


    // };

    const obtenerNombreClienteProyecto = (orden) => {
    if (!orden) return "Sin proyecto";
    
    // Intentar obtener de los campos existentes primero
    const proyectoDirecto = orden.clienteProyecto || orden.nombre || orden.cliente || orden.proyecto;
    if (proyectoDirecto) return proyectoDirecto;
    
    // Si no hay campo directo, extraer del número de orden
    if (orden.numero_orden) {
        // Ejemplo: ORD-KIA-001 -> KIA, ORD-TOYOTA-001 -> TOYOTA
        const partes = orden.numero_orden.split('-');
        if (partes.length >= 2) {
            const proyecto = partes[1]; // Toma la segunda parte (KIA o TOYOTA)
            return proyecto;
        }
    }
    
    return "Proyecto no especificado";
};

    const esHoy = (fechaStr) => {
        if (!fechaStr) return false;
        const fecha = new Date(fechaStr);
        const hoy = new Date();
        return (
            fecha.getFullYear() === hoy.getFullYear() &&
            fecha.getMonth() === hoy.getMonth() &&
            fecha.getDate() === hoy.getDate()
        );
    };

    const resumenDiario = useMemo(() => {
        const ordenesHoy = ordenes.filter((o) => esHoy(o.fecha_inicio));
        return {
            totalProyectosHoy: ordenesHoy.length,
            ordenesHoy,
        };
    }, [ordenes]);

    const lineasProduccion = useMemo(() => {
        const ordenesHoy = resumenDiario.ordenesHoy;
        const lineasBase = [
            { id: 1, nombre: "Línea 1" },
            { id: 2, nombre: "Línea 2" },
            
        ];

        return lineasBase.map((linea, index) => {
            const orden = ordenesHoy[index] || null;

            if (!orden) {
                return {
                    ...linea,
                    estado: "Paro",
                    proyecto: "Sin proyecto asignado",
                    totalPCBs: 0,
                };
            }
            
            const proyecto = obtenerNombreClienteProyecto(orden);
            const totalPCBs = orden.cantidad_planeada || 0;
            const estado = orden.estatus === "Pausada" || orden.estatus === "Finalizada" ? "Paro" : "Activa";

            return {
                ...linea,
                estado,
                proyecto,
                totalPCBs,
                orden,
            };
        });
    }, [resumenDiario]);

    const handleVerDetalleOrden = async (orden) => {
        if (!orden) return;
        setOrdenSeleccionada(orden);
        setDetalleOrden(null);
        setCargandoDetalle(true);
        setError("");

        try {
            const resp = await obtenerEstadisticaOrden(orden.numero_orden);
            setDetalleOrden(resp.data || null);
        } catch (err) {
            setError(err.message || "Error al obtener el detalle de la orden");
        } finally {
            setCargandoDetalle(false);
        }
    };

    if (loadingInicial) {
        return (
            <Container className="mt-4 text-center">
                <Spinner animation="border" role="status" />
                <div className="mt-2">Cargando vista de Supervisor...</div>
            </Container>
        );
    }

    return (
        <Container fluid className="mt-3">
            <Row className="mb-3">
                <Col>
                    <h2>Vista del Ingeniero de Línea (Supervisor)</h2>
                </Col>
            </Row>

            {error && (
                <Row className="mb-3">
                    <Col>
                        <Alert variant="danger" onClose={() => setError("")} dismissible>
                            {error}
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Gestión de Órdenes */}
            <Row className="mb-4">
                <Col md={4}>
                    <OrdenForm
                        estaciones={estaciones}
                        clienteProyecto={clienteProyecto}
                        setClienteProyecto={setClienteProyecto}
                        cantidadPlaneada={cantidadPlaneada}
                        setCantidadPlaneada={setCantidadPlaneada}
                        estacionSeleccionada={estacionSeleccionada}
                        setEstacionSeleccionada={setEstacionSeleccionada}
                        creandoOrden={creandoOrden}
                        onSubmit={handleCrearOrden}
                    />
                </Col>

                <Col md={8}>
                    <OrdenesTabla
                        ordenes={ordenes}
                        onVerDetalle={handleVerDetalleOrden}
                        obtenerNombreClienteProyecto={obtenerNombreClienteProyecto}
                    />
                </Col>
            </Row>

            {/* Control de Planta */}
            <ControlPlanta
                resumenDiario={resumenDiario}
                lineasProduccion={lineasProduccion}
                onVerDetalleLinea={handleVerDetalleOrden}
            />

            {/* Detalle de producción vs errores */}
            <Row>
                <Col>
                    <DetalleOrden
                        ordenSeleccionada={ordenSeleccionada}
                        detalleOrden={detalleOrden}
                        cargandoDetalle={cargandoDetalle}
                        obtenerNombreClienteProyecto={obtenerNombreClienteProyecto}
                    />
                </Col>
            </Row>
        </Container>
    );
}

export default VistaSupervisor;