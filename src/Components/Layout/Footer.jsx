import Container from "react-bootstrap/Container";


export function Footer() {
  return (
    <footer className="bg-dark text-light py-3 mt-auto shadow-sm">
      <Container className="d-flex justify-content-between align-items-center">
        <span className="small text-white-50">© {new Date().getFullYear()}Electro Nova</span>
        <span className="small">
          <a  className="text-light text-decoration-none me-3">
            Privacidad
          </a>
          <a  className="text-light text-decoration-none">
            Términos
          </a>
        </span>
      </Container>
    </footer>
  );
}
