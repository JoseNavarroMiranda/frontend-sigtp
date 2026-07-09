# Frontend SIGTP

Sistema de Gestión de Trazabilidad de Producción - Módulo frontend para la gestión y seguimiento de producción en línea SMT.

## Tecnologías

- **React 19 + Vite**
- **React Router DOM** - Navegación y rutas protegidas
- **React Bootstrap** - UI components
- **Bootstrap Icons**

## Vistas del sistema

| Ruta | Vista | Rol |
|------|-------|-----|
| `/` | Login | Todos |
| `/operador` | Panel de producción | Operador |
| `/calidad` | Inspección de calidad SMT | Calidad |
| `/supervisor` | Control de planta | Supervisor |
| `/gerencia` | Dashboard de gerencia | Gerencia |
| `/perfil` | Perfil de usuario | Todos |

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Convenciones

- Variables de entorno en archivo `.env` con prefijo `VITE_`
- Lógica de negocio extraída en custom hooks dentro de `src/hooks/`
- Estilos en línea o archivos separados (`*Styles.js`)
- Componentes de UI en `src/Components/`

## Notas

- No importar `bootstrap/dist/js/bootstrap.bundle.min.js` para evitar conflictos con React Bootstrap
- Las rutas están protegidas por `RutaProtegida` que valida el token en localStorage