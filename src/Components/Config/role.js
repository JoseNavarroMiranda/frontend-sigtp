// src/Config/roles.js
export const roleConfigs = {
  calidad: {
    title: 'Calidad',
    menuItems: [
      { label: 'Dashboard', path: '/calidad' },
      { label: 'Reportes', path: '/calidad/reportes' },
    ],
  },
  gerencia: {
    title: 'Gerencia',
    menuItems: [
      { label: 'Resumen', path: '/gerencia' },
      { label: 'Indicadores', path: '/gerencia/indicadores' },
    ],
  },
  operador: {
    title: 'Operador',
    menuItems: [
      { label: 'Tareas', path: '/operador' },
      { label: 'Historial', path: '/operador/historial' },
    ],
  },
  supervisor: {
    title: 'Supervisor',
    menuItems: [
      { label: 'Panel', path: '/supervisor' },
      { label: 'Equipo', path: '/supervisor/equipo' },
    ],
  },
};