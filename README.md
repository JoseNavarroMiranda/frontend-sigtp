# Frontend SIGTP

Aplicación web del **Sistema de Gestión de Trazabilidad de Producción (SIGTP)**.  
Este frontend permite autenticar usuarios y mostrar paneles operativos por rol para el seguimiento de producción SMT.

## ¿Qué hace este proyecto?

- Inicia sesión contra la API del sistema (`/api/sesiones/login`).
- Redirige automáticamente a la vista correspondiente según el rol del usuario.
- Protege rutas privadas con validación de token.
- Cierra sesión por inactividad para reforzar seguridad.

## Stack tecnológico

- **React 19**
- **Vite 8**
- **React Router DOM**
- **React Bootstrap + Bootstrap 5**
- **Bootstrap Icons**

## Rutas principales

| Ruta | Módulo/Vista | Acceso |
|------|---------------|--------|
| `/` | Login | Público |
| `/operador` | Panel de operador | Protegido |
| `/calidad` | Panel de calidad | Protegido |
| `/supervisor` | Panel de supervisor | Protegido |
| `/gerencia` | Panel de gerencia | Protegido |
| `/perfil` | Perfil de usuario | Protegido |

## Estructura general

```txt
src/
├─ Components/
│  ├─ Auth/               # Protección de rutas
│  ├─ LoginComponente/    # Pantalla y flujo de login
│  ├─ Layout/             # Layout por rol y perfil
│  ├─ Operador|Calidad|Supervisor|Gerencia/
│  └─ Config/             # Configuración de menú/títulos por rol
├─ hooks/                 # Hooks de lógica (ej. inactividad)
├─ services/              # Comunicación con API (authService)
└─ main.jsx               # Definición de rutas de la app
```

## Configuración de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL="http://31.97.150.91"
```

> Todas las variables de entorno del frontend deben comenzar con `VITE_`.

## Instalación y ejecución

```bash
npm install
npm run dev
```

La app queda disponible en la URL local que muestre Vite (por defecto `http://localhost:5173`).

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Vista previa del build
npm run lint     # Linter
```