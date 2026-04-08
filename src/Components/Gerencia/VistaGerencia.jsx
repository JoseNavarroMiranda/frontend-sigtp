import { Container, Row, Col } from "react-bootstrap";
import KpisProduccionHoy from "./KpisProduccionHoy";
import RegistroUsuario from "./RegistroUsuario";
import GestionParoLinea from "./GestionParoLinea";

function VistaGerencia() {
    return (
        <Container fluid className="mt-3">
            <Row className="mb-3">
                <Col>
                    <h2>Panel de Gerencia</h2>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={8}>
                    <KpisProduccionHoy />
                </Col>
                <Col md={4}>
                    <RegistroUsuario />
                </Col>
            </Row>

            <Row>
                <Col>
                    <GestionParoLinea />
                </Col>
            </Row>
        </Container>
    );
}

export default VistaGerencia;