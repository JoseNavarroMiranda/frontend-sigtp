import { Container, Alert, Button, Spinner } from "react-bootstrap";

export function VistaPendienteAlerta({ alertarTecnicos, cargandoAlerta, ordenActiva }) {
  return (
    <Container className="py-5">
      <Alert variant="warning" className="text-center py-5 shadow-lg border-warning" style={{ borderWidth: '4px' }}>
        <h1 className="display-4 fw-bold text-dark">L\u00cdMITE DE DEFECTOS ALCANZADO</h1>
        <hr />
        <h4 className="text-dark">Se detectaron 3 piezas defectuosas consecutivas en la orden {ordenActiva}.</h4>
        <p className="fs-5 text-dark mt-3 mb-5">
          Debes notificar al equipo t\u00e9cnico para que revisen el proceso antes de poder continuar.
        </p>
        <Button
          variant="danger"
          size="lg"
          className="px-5 py-3 fs-3 fw-bold shadow"
          onClick={alertarTecnicos}
          disabled={cargandoAlerta}
        >
          {cargandoAlerta ? <Spinner animation="border" /> : "ALERTAR A LOS T\u00c9CNICOS"}
        </Button>
      </Alert>
    </Container>
  );
}