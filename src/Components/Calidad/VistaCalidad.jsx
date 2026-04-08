import React, { useState } from "react";
import { Container, Card, Form, Button, Alert, Row, Col, Badge, Spinner } from "react-bootstrap";

export function VistaCalidad() {
  // =========================================================
  // ESTADOS GENERALES DE INSPECCIÓN
  // =========================================================
  const [serialBusqueda, setSerialBusqueda] = useState("");
  const [piezaActual, setPiezaActual] = useState(null);
  const [proyecto, setProyecto] = useState("");
  const [ordenActiva, setOrdenActiva] = useState(null);
  const [fallaSeleccionada, setFallaSeleccionada] = useState("");
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  // =========================================================
  // ESTADOS DEL FLUJO DE PARO DE LÍNEA
  // =========================================================
  const [fallasConsecutivas, setFallasConsecutivas] = useState(0);
  // estadoParo: 'NINGUNO' (Normal), 'PENDIENTE_ALERTA' (Botón), 'BLOQUEADO' (Pide login)
  const [estadoParo, setEstadoParo] = useState('NINGUNO'); 
  const [cargandoAlerta, setCargandoAlerta] = useState(false);
  
  // =========================================================
  // ESTADOS PARA DESBLOQUEO
  // =========================================================
  const [credenciales, setCredenciales] = useState({ numero_empleado: "", password: "" });
  const [errorDesbloqueo, setErrorDesbloqueo] = useState("");

  const catalogoFallas = [
    "Corto circuito", "Componente faltante", "Soldadura fría / Insuficiente",
    "Daño físico en PCB", "Polaridad invertida", "Desalineación de componente"
  ];

    const API_URL = import.meta.env.VITE_API_URL 


  // ---------------------------------------------------------
  // 1. BUSCAR PIEZA
  // ---------------------------------------------------------
  const buscarPieza = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: "", texto: "" });
    setPiezaActual(null);
    setFallaSeleccionada("");

    try { 
      const response = await fetch(`${API_URL}/api/calidad/pieza-en-calidad/serial/${serialBusqueda}`);                

      const data = await response.json();

      if (data.success) {
        const pieza = data.data;
        const ordenDeLaPieza = pieza.orden?.numero_orden;

        // Validar que la pieza pertenezca a la orden activa
        if (ordenActiva && ordenDeLaPieza !== ordenActiva) {
          setMensaje({ 
            tipo: "danger", 
            texto: `❌ Error: El serial ${pieza.serial} pertenece a la orden ${ordenDeLaPieza || 'N/A'}. Actualmente estás en la orden ${ordenActiva}.` 
          });
          return; 
        }

        if (!ordenActiva && ordenDeLaPieza) {
          setOrdenActiva(ordenDeLaPieza);
        }

        setPiezaActual(pieza);
        
        const serialMayusculas = pieza.serial.toUpperCase();
        if (serialMayusculas.includes("TYT")) {
          setProyecto("TOYOTA");
        } else if (serialMayusculas.includes("KIA")) {
          setProyecto("KIA");
        } else {
          setProyecto("OTROS / " + serialMayusculas.substring(0, 3));
        }

      } else {
        setMensaje({ tipo: "danger", texto: data.message });
      }
    } catch (error) {
      setMensaje({ tipo: "danger", texto: "Error de conexión con el servidor." });
    }
  };

 // ---------------------------------------------------------
  // 2. DICTAMINAR PIEZA
  // ---------------------------------------------------------
  const dictaminarPieza = async (resultado) => {
    setMensaje({ tipo: "", texto: "" });

    if ((resultado === "Retrabajo" || resultado === "Scrap") && !fallaSeleccionada) {
      setMensaje({ tipo: "warning", texto: "Debes seleccionar una falla del catálogo para rechazar la pieza." });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/calidad/actualizar-estado-pieza/${piezaActual.serial}`,{
 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultado: resultado,
          descripcion_falla: resultado === "OK" ? null : fallaSeleccionada
        })
      });

      const data = await response.json();

      if (data.success) {
        // Lógica de detección de 3 fallas para paro de línea
        if (resultado === "Retrabajo" || resultado === "Scrap") {
          const nuevasFallas = fallasConsecutivas + 1;
          setFallasConsecutivas(nuevasFallas);
          
          if (nuevasFallas >= 3) {
            setEstadoParo('PENDIENTE_ALERTA'); 
          }
        } else {
          setFallasConsecutivas(0); 
        }

        // ========================================================
        // NUEVO: EVALUAR SI SE COMPLETÓ LA ORDEN
        // ========================================================
        if (data.ordenCompletada) {
          // Mostramos la alerta de que se terminó
          alert(`🎉 ¡ORDEN ${ordenActiva} COMPLETADA!\n\nTodas las piezas han sido inspeccionadas y el estado de la orden se actualizó en la base de datos.`);
          
          // Limpiamos TODA la pantalla para regresar a la vista principal
          setMensaje({ tipo: "success", texto: `✅ Orden ${ordenActiva} finalizada correctamente. Escanea una pieza de una nueva orden.` });
          setOrdenActiva(null);
          setPiezaActual(null);
          setSerialBusqueda("");
          setFallaSeleccionada("");
          setFallasConsecutivas(0); // Por si acaso
          
        } else {
          // Si no se ha completado, solo mostramos el mensaje de éxito de la pieza
          setMensaje({ tipo: "success", texto: data.message });
          setPiezaActual(null);
          setSerialBusqueda("");
          setFallaSeleccionada("");
        }
        // ========================================================

      } else {
        setMensaje({ tipo: "danger", texto: data.message });
      }
    } catch (error) {
      setMensaje({ tipo: "danger", texto: "Error de conexión con el servidor." });
    }
  };

  // ---------------------------------------------------------
  // 3. ENVIAR ALERTA A TÉCNICOS (Inserta en paros_linea)
  // ---------------------------------------------------------
  const alertarTecnicos = async () => {
    setCargandoAlerta(true);
    try {
      await fetch(`${API_URL}/api/calidad/registrar-paro`, {

 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orden_numero: ordenActiva,
          motivo: `Paro por 3 fallas consecutivas en orden ${ordenActiva}`
        })
      });
      
      // Una vez registrada la alerta, pasamos a pedir credenciales
      setEstadoParo('BLOQUEADO');
    } catch (error) {
      alert("Error al alertar técnicos. Revisa tu conexión.");
    } finally {
      setCargandoAlerta(false);
    }
  };

  // ---------------------------------------------------------
  // 4. DESBLOQUEAR LÍNEA (Cierra el paro en BD)
  // ---------------------------------------------------------
  const manejarDesbloqueo = async (e) => {
    e.preventDefault();
    setErrorDesbloqueo("");

    try {
      // 4.1 Validar credenciales y rol
    const responseAuth = await fetch(`${API_URL}/api/sesiones/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            numero_empleado: credenciales.numero_empleado, // <--- ¡AQUÍ ESTÁ LA MAGIA!
            password: credenciales.password 
        })
    });

      const dataAuth = await responseAuth.json();

            if (dataAuth.success) {
            const usuario = dataAuth.data.usuario;

            const rolID = Number(usuario.rol_id);
            const rolName = usuario.rol;
        
        // Verifica si es Supervisor (3) o Ing Procesos (5)
        if (rolID === 3 || rolID === 5 || rolName === "Supervisor" || rolName === "Ingeniero") {
          
          // 4.2 Cerrar el paro en la base de datos (le pone fecha_fin)
          await fetch(`${API_URL}/api/calidad/cerrar-paro`, {
 

            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orden_numero: ordenActiva })
          });

          // 4.3 Restaurar la vista
          setEstadoParo('NINGUNO');
          setFallasConsecutivas(0);
          setCredenciales({ numero_empleado: "", password: "" });
        } else {
          setErrorDesbloqueo("❌ Acceso denegado. Solo un supervisor o Ing. de Procesos pueden desbloquear."+ error);
        }
      } else {
        setErrorDesbloqueo("❌ Credenciales incorrectas.");
      }
    } catch (error) {
      setErrorDesbloqueo("Error al conectar con el servidor para el desbloqueo.");
    }
  };


  // =========================================================
  // VISTA 1: BOTÓN DE ALERTA (PENDIENTE_ALERTA)
  // =========================================================
  if (estadoParo === 'PENDIENTE_ALERTA') {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center py-5 shadow-lg border-warning" style={{ borderWidth: '4px' }}>
          <h1 className="display-4 fw-bold text-dark">⚠️ LÍMITE DE DEFECTOS ALCANZADO ⚠️</h1>
          <hr />
          <h4 className="text-dark">Se detectaron 3 piezas defectuosas consecutivas en la orden {ordenActiva}.</h4>
          <p className="fs-5 text-dark mt-3 mb-5">
            Debes notificar al equipo técnico para que revisen el proceso antes de poder continuar.
          </p>
          <Button 
            variant="danger" 
            size="lg" 
            className="px-5 py-3 fs-3 fw-bold shadow"
            onClick={alertarTecnicos}
            disabled={cargandoAlerta}
          >
            {cargandoAlerta ? <Spinner animation="border" /> : "🚨 ALERTAR A LOS TÉCNICOS 🚨"}
          </Button>
        </Alert>
      </Container>
    );
  }

  // =========================================================
  // VISTA 2: BLOQUEADO (ESPERANDO DESBLOQUEO DE SMT O ING)
  // =========================================================
  if (estadoParo === 'BLOQUEADO') {
    return (
      <Container className="py-5">
        <Card className="shadow-lg border-danger" style={{ borderWidth: '3px', maxWidth: '600px', margin: '0 auto' }}>
          <Card.Header className="bg-danger text-white text-center py-4">
            <h2 className="mb-0 fw-bold">🚨 PARO DE LÍNEA ACTIVO 🚨</h2>
          </Card.Header>
          <Card.Body className="p-4 bg-light">
            <Alert variant="danger" className="text-center fw-bold">
              Los técnicos han sido notificados. La línea está bloqueada.
            </Alert>
            <p className="text-center mb-4 text-muted">
              Para reanudar la inspección, se requiere la autorización de un <strong>Supervisor</strong> o un <strong>Ingeniero de Procesos</strong>.
            </p>

            {errorDesbloqueo && <Alert variant="danger">{errorDesbloqueo}</Alert>}

            <Form onSubmit={manejarDesbloqueo}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Número de Empleado</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Ej. S001"
                  value={credenciales.numero_empleado}
                  onChange={(e) => setCredenciales({...credenciales, numero_empleado: e.target.value})}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Contraseña</Form.Label>
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

  // =========================================================
  // VISTA 3: NORMAL DE INSPECCIÓN (ESTADO: NINGUNO)
  // =========================================================
  return (
    <Container className="py-5">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-dark text-white py-3">
          <h4 className="mb-0 fw-bold">Inspección de Calidad SMT</h4>
        </Card.Header>

        <Card.Body className="p-4">
          {ordenActiva && (
            <Alert variant="info" className="d-flex justify-content-between align-items-center mb-4">
              <span className="fs-5">
                🔒 <strong>Orden Activa:</strong> {ordenActiva} <br/>
                <small>Solo se aceptan piezas de esta orden.</small>
              </span>
              <Button 
                variant="outline-dark" size="sm" 
                onClick={() => {
                  setOrdenActiva(null); 
                  setPiezaActual(null); 
                  setSerialBusqueda("");
                  setMensaje({tipo: "", texto: ""});
                }}
              >
                Liberar Candado / Cambiar Orden
              </Button>
            </Alert>
          )}

          {fallasConsecutivas > 0 && (
            <Alert variant="warning" className="fw-bold text-center">
              ⚠️ Alerta: Llevas {fallasConsecutivas} pieza(s) defectuosa(s) consecutiva(s). Al llegar a 3 se bloqueará la línea.
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
                <Form.Label className="fw-bold">Catálogo de Fallas (Obligatorio para rechazos)</Form.Label>
                <Form.Select value={fallaSeleccionada} onChange={(e) => setFallaSeleccionada(e.target.value)}>
                  <option value="">-- Selecciona una falla si la pieza está mal --</option>
                  {catalogoFallas.map((falla, idx) => <option key={idx} value={falla}>{falla}</option>)}
                </Form.Select>
              </Form.Group>

              <h5 className="fw-bold mb-3 text-center">Dictaminar Pieza</h5>
              <Row className="g-3">
                <Col md={4}><Button variant="success" size="lg" className="w-100 fw-bold py-3" onClick={() => dictaminarPieza('OK')}>✅ APROBAR (OK)</Button></Col>
                <Col md={4}><Button variant="warning" size="lg" className="w-100 fw-bold py-3 text-dark" onClick={() => dictaminarPieza('Retrabajo')}>⚠️ RETRABAJO</Button></Col>
                <Col md={4}><Button variant="danger" size="lg" className="w-100 fw-bold py-3" onClick={() => dictaminarPieza('Scrap')}>❌ SCRAP</Button></Col>
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}



export default VistaCalidad;