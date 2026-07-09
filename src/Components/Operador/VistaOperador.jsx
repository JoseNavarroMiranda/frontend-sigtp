import { Card, Row, Col, Spinner } from "react-bootstrap";
import { useOperador } from "../../hooks/useOperador";
import { styles } from "./operadorStyles";

function VistaOperador() {
  const {
    ordenesFiltradas,
    ordenActiva,
    ordenSeleccionadaId,
    historialActual,
    registradas,
    progreso,
    ultimoEscaneo,
    avanceBaseDatos,
    proyectoSeleccionado,
    scannedCode,
    errorMsg,
    mostrarHistorial,
    piezasOrden,
    loadingPiezas,
    setScannedCode,
    setMostrarHistorial,
    handleRegister,
    handleProyectoChange,
    handleOrdenChange,
  } = useOperador();

  return (
    <div style={styles.appContainer}>
      <nav style={styles.navbar}>
        <div style={styles.navLeft}>
          <span style={styles.stationTag}>Estación: Línea 1 SMT</span>
        </div>
      </nav>

      <div style={styles.content}>
        <header style={styles.pageHeader}>
          <div>
            <h1 style={styles.title}>Panel de Producción</h1>
            <p style={styles.subtitle}>Registra y monitorea el avance de las tarjetas en tu estación.</p>
          </div>
        </header>

        <div style={styles.mainGrid}>
          <div style={styles.leftCol}>
            <div style={{...styles.card, paddingBottom: '20px'}}>
              <h4 style={{margin: '0 0 15px 0', fontSize: '1rem', color: '#334155'}}>1. Configurar Estación</h4>

              <div style={{ marginBottom: '15px' }}>
                <label style={styles.inputLabel}>Proyecto</label>
                <select
                  style={styles.selectInput}
                  value={proyectoSeleccionado}
                  onChange={(e) => handleProyectoChange(e.target.value)}
                >
                  <option value="">-- Selecciona el Proyecto --</option>
                  <option value="TYT">Toyota (TYT)</option>
                  <option value="KIA">Kia (KIA)</option>
                </select>
              </div>

              <div>
                <label style={styles.inputLabel}>Orden de Trabajo</label>
                <select
                  style={{
                    ...styles.selectInput,
                    backgroundColor: !proyectoSeleccionado ? '#e2e8f0' : '#f8fafc',
                    cursor: !proyectoSeleccionado ? 'not-allowed' : 'pointer'
                  }}
                  value={ordenSeleccionadaId}
                  onChange={(e) => handleOrdenChange(e.target.value)}
                  disabled={!proyectoSeleccionado}
                >
                  <option value="">-- Selecciona la Orden --</option>
                  {ordenesFiltradas.map((orden) => (
                    <option key={orden.id} value={orden.id}>
                      {orden.nombre} ({orden.cliente})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{...styles.card, opacity: ordenActiva ? 1 : 0.5}}>
              <div style={styles.cardHeader}>
                <div style={styles.orderTitle}>
                  <span style={styles.iconChip}></span>
                  <div>
                    <small style={{color: '#666'}}>ORDEN ACTIVA</small>
                    <div style={{fontWeight: 'bold'}}>
                      {ordenActiva ? `${ordenActiva.id} - ${ordenActiva.nombre}` : "Esperando configuración..."}
                    </div>
                  </div>
                </div>
                {ordenActiva && <span style={styles.statusBadge}>EN CURSO</span>}
              </div>

              <div style={styles.progressSection}>
                <div style={styles.progressLabels}>
                  <span>Avance de la orden</span>
                  <span>{registradas}/{ordenActiva ? ordenActiva.meta : 0} Piezas ({progreso}%)</span>
                </div>
                <div style={styles.progressBarBg}>
                  <div style={{...styles.progressBarFill, width: `${progreso}%`}}></div>
                </div>
              </div>

              {ordenActiva && (
                <div style={{...styles.projectTag, backgroundColor: ordenActiva.color || '#4f46e5'}}>
                  Proyecto: {ordenActiva.cliente}
                </div>
              )}

              <div style={styles.card}>
                <div style={styles.cardHeaderSmall}>
                  <span>Seriales de la Orden</span>
                </div>
                {loadingPiezas ? (
                  <div style={{textAlign:'center', padding:'20px'}}>
                    <Spinner animation="border" />
                  </div>
                ) : piezasOrden?.detalle_piezas?.length > 0 ? (
                  <div style={styles.serialList}>
                    {piezasOrden.detalle_piezas.map((pieza, index) => (
                      <div key={index} style={styles.serialItem}>
                        <span style={styles.serialCode}>{pieza.serial}</span>
                        <span style={styles.serialStatus}>{pieza.estatus}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{textAlign:'center', padding:'20px', color:'#94a3b8'}}>
                    Selecciona una orden para ver los seriales
                  </div>
                )}
              </div>
            </div>

            <div style={{...styles.card, ...styles.scanCard}}>
              <div style={styles.barcodeIcon}>║▌║█║▌│║▌║▌█</div>
              <h3>Escanear nueva tarjeta</h3>

              {errorMsg && <div style={styles.errorMessage}>{errorMsg}</div>}

              <form onSubmit={handleRegister} style={styles.scanForm}>
                <input
                  style={{...styles.input, borderColor: errorMsg ? 'red' : '#ddd'}}
                  placeholder={ordenActiva ? `Escanea serial del proyecto ${ordenActiva.prefijo}...` : "Configura proyecto y orden arriba"}
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  disabled={!ordenActiva}
                  autoFocus
                />
                <button type="submit" style={styles.btnRegister} disabled={!ordenActiva}>Registrar</button>
              </form>
            </div>
          </div>

          <div style={styles.rightCol}>
            <div style={styles.kpiRow}>
              <div style={{...styles.kpiCard, borderBottom: '4px solid #10b981'}}>
                <small>REGISTRADAS</small>
                <div style={styles.kpiValue}>{registradas}</div>
              </div>
              <div style={{...styles.kpiCard, borderBottom: '4px solid #f59e0b'}}>
                <small>META ORDEN</small>
                <div style={styles.kpiValue}>{ordenActiva ? ordenActiva.meta : 0}</div>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeaderSmall}>
                <span>Último Escaneo Exitoso</span>
              </div>

              <div style={styles.lastScanDetails}>
                {ultimoEscaneo ? (
                  <>
                    <div style={styles.detailRow}>
                      <small>NÚMERO DE SERIAL</small>
                      <div style={{fontWeight: 'bold', color: '#1e293b'}}>{ultimoEscaneo.serial}</div>
                    </div>
                    <div style={styles.detailRow}>
                      <small>HORA</small>
                      <div>{ultimoEscaneo.hora}</div>
                    </div>
                    <div style={{...styles.detailRow, borderBottom: 'none'}}>
                      <small>ESTATUS ACTUAL</small>
                      <span style={styles.inspectBadge}>PENDIENTE INSP.</span>
                    </div>
                  </>
                ) : (
                  <div style={{textAlign: 'center', padding: '20px', color: '#94a3b8'}}>
                    {avanceBaseDatos > 0
                      ? `Hay ${avanceBaseDatos} pieza(s) registradas anteriormente en esta orden.`
                      : "Aún no hay escaneos para esta orden."}
                  </div>
                )}
              </div>

              {ordenSeleccionadaId && (
                <>
                  <button
                    style={styles.btnHistory}
                    onClick={() => setMostrarHistorial(!mostrarHistorial)}
                  >
                    {mostrarHistorial ? 'Ocultar historial' : 'Ver historial de la sesión'}
                  </button>

                  {mostrarHistorial && (
                    <div style={styles.historyList}>
                      {historialActual.length === 0 ? (
                        <div style={styles.historyEmpty}>Sin registros nuevos en esta sesión</div>
                      ) : (
                        historialActual.map((item, index) => (
                          <div key={index} style={styles.historyItem}>
                            <span style={{fontWeight: 'bold', color: '#334155'}}>
                              {item.serial}
                            </span>
                            <span style={{color: '#64748b', fontSize: '0.8rem'}}>{item.hora}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VistaOperador;