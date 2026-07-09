import { useCalidad } from "../../hooks/useCalidad";
import { VistaNormal } from "./VistaNormal";
import { VistaPendienteAlerta } from "./VistaPendienteAlerta";
import { VistaBloqueado } from "./VistaBloqueado";

export function VistaCalidad() {
  const {
    serialBusqueda,
    setSerialBusqueda,
    piezaActual,
    proyecto,
    ordenActiva,
    fallaSeleccionada,
    setFallaSeleccionada,
    mensaje,
    fallasConsecutivas,
    estadoParo,
    cargandoAlerta,
    credenciales,
    setCredenciales,
    errorDesbloqueo,
    catalogoFallas,
    buscarPieza,
    dictaminarPieza,
    alertarTecnicos,
    manejarDesbloqueo,
    limpiarOrdenActiva,
  } = useCalidad();

  if (estadoParo === 'PENDIENTE_ALERTA') {
    return <VistaPendienteAlerta alertarTecnicos={alertarTecnicos} cargandoAlerta={cargandoAlerta} ordenActiva={ordenActiva} />;
  }

  if (estadoParo === 'BLOQUEADO') {
    return <VistaBloqueado errorDesbloqueo={errorDesbloqueo} credenciales={credenciales} setCredenciales={setCredenciales} manejarDesbloqueo={manejarDesbloqueo} />;
  }

  return (
    <VistaNormal
      ordenActiva={ordenActiva}
      fallasConsecutivas={fallasConsecutivas}
      mensaje={mensaje}
      serialBusqueda={serialBusqueda}
      setSerialBusqueda={setSerialBusqueda}
      piezaActual={piezaActual}
      proyecto={proyecto}
      fallaSeleccionada={fallaSeleccionada}
      setFallaSeleccionada={setFallaSeleccionada}
      catalogoFallas={catalogoFallas}
      buscarPieza={buscarPieza}
      dictaminarPieza={dictaminarPieza}
      limpiarOrdenActiva={limpiarOrdenActiva}
    />
  );
}

export default VistaCalidad;