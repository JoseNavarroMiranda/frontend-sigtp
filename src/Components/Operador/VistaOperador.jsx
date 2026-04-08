import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert } from "react-bootstrap";



function VistaOperador() {
    const [ordenesActivas, setOrdenesActivas] = useState([]);
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState(""); 
    const [ordenSeleccionadaId, setOrdenSeleccionadaId] = useState("");
    const [scannedCode, setScannedCode] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [mostrarHistorial, setMostrarHistorial] = useState(false);
    const [historial, setHistorial] = useState({});

    const [piezasOrden, setPiezasOrden] = useState([]);
    const [loadingPiezas, setLoadingPiezas] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL 
   


    useEffect(() => {
        const cargarOrdenes = async () => {
            try {
                const response = await fetch(`${API_URL}/api/operador/ordenes-activas`);                
     
                if (response.ok) {
                    const result = await response.json();
                    setOrdenesActivas(result.data || result); 
                    console.log("RESULT:", result);
                } else {
                    console.error("Error al obtener las órdenes del servidor");
                }
            } catch (error) {
                console.error("Error de conexión con el backend al cargar órdenes:", error);
            }
        };

        cargarOrdenes();
    }, [API_URL]); 

    const ordenesFiltradas = ordenesActivas.filter(orden => orden.prefijo === proyectoSeleccionado);
    const ordenActiva = ordenesActivas.find(orden => String(orden.id) === String(ordenSeleccionadaId)) || null;
    
    const historialActual = ordenSeleccionadaId && historial[ordenSeleccionadaId] 
        ? historial[ordenSeleccionadaId] 
        : [];
        
    // Cálculo del progreso combinando BD + Sesión actual
    const avanceBaseDatos = ordenActiva ? (ordenActiva.procesadas || 0) : 0;
    const registradas = avanceBaseDatos + historialActual.length;
    const progreso = ordenActiva && ordenActiva.meta > 0 ? Math.round((registradas / ordenActiva.meta) * 100) : 0;
    const ultimoEscaneo = historialActual.length > 0 ? historialActual[0] : null;

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        
        const serial = scannedCode.trim().toUpperCase();

        if (!proyectoSeleccionado) {
            setErrorMsg("⚠️ Primero selecciona un proyecto.");
            return;
        }
        if (!ordenSeleccionadaId) {
            setErrorMsg("⚠️ Ahora selecciona una orden de trabajo.");
            return;
        }
        if (!serial) return;

        try {
            const response = await fetch(`${API_URL}/api/operador/enviar-a-calidad`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orden_id: ordenSeleccionadaId,
                    serial: serial
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const nuevoRegistro = {
                    serial: serial,
                    hora: new Date().toLocaleTimeString()
                };

                const nuevoHistorialActual = [nuevoRegistro, ...historialActual];
                const totalRegistradas = avanceBaseDatos + nuevoHistorialActual.length;

                setHistorial(prev => ({
                    ...prev,
                    [ordenSeleccionadaId]: nuevoHistorialActual
                }));

                setScannedCode("");

                // Evaluamos si ya se completó la meta sumando lo de la BD + lo recién escaneado
                if (totalRegistradas >= ordenActiva.meta) {
                    setTimeout(() => {
                        alert(`✅ ¡Orden ${ordenActiva.id} completada con éxito!`);
                        
                        // Limpiar historial
                        setHistorial(prev => ({
                            ...prev,
                            [ordenSeleccionadaId]: []
                        }));

                        // Remover la orden de la vista del operador
                        setOrdenesActivas(prevOrdenes => 
                            prevOrdenes.filter(orden => String(orden.id) !== String(ordenSeleccionadaId))
                        );

                        setOrdenSeleccionadaId("");
                    }, 300);
                }
            } else {
                setErrorMsg(`❌ ${result.message || "El serial no es válido para esta orden"}`);
                setScannedCode("");
            }

        } catch (error) {
            setErrorMsg("⚠️ Error de red: No se pudo conectar con el servidor.");
        }
    };
 
    
    const mostrarPiezasOrdenes = async (numero_orden) => {
        try {
            setLoadingPiezas(true);

            const response = await fetch(
                `${API_URL}/api/operador/orden-trabajo/estadistica/${encodeURIComponent(numero_orden)}`
            );

            if (response.ok) {
                const result = await response.json();
                
                // IMPORTANTE: Guardamos en piezasOrden (NO ordenesActivas)
                setPiezasOrden(result.data || result);
                
                console.log("PIEZAS ORDEN:", result);
            } else {
                console.error("Error al obtener piezas");
            }

        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoadingPiezas(false);
        }

    };

    return (
        <div style={styles.appContainer}>
            <nav style={styles.navbar}>
                <div style={styles.navLeft}>
                    <span style={styles.stationTag}>🏭 Estación: Línea 1 SMT</span>
                </div>
            </nav>

            <div style={styles.content}>
                <header style={styles.pageHeader}>
                    <div>
                        <h1 style={styles.title}>Panel de Producción</h1>
                        <p style={styles.subtitle}>Registra y monitorea el avance de las tarjetas en tu estación.</p>
                    </div>
                    {/* <button style={styles.btnConfig}>⚙️ Configurar Máquina</button> */}
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
                                    onChange={(e) => {
                                        setProyectoSeleccionado(e.target.value);
                                        setOrdenSeleccionadaId(""); 
                                        setErrorMsg("");
                                        setMostrarHistorial(false);
                                     }}
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
                                    
                                    //onchange antes de listar seriales de orden
                                    // onChange={(e) => {
                                    //     setOrdenSeleccionadaId(e.target.value);
                                    //     setErrorMsg("");
                                    //     setMostrarHistorial(false);
                                    // }}

                                    // el nuevo
                                    // onChange={(e) => {
                                    //     const numeroOrden = e.target.value;

                                    //     setOrdenSeleccionadaId(numeroOrden);
                                    //     setErrorMsg("");
                                    //     setMostrarHistorial(false);

                                    //     if (numeroOrden) {
                                    //         mostrarPiezasOrdenes(numeroOrden);
                                    //     }
                                    // }}

                                    onChange={(e) => {
                                        const ordenId = e.target.value;

                                        setOrdenSeleccionadaId(ordenId);
                                        setErrorMsg("");
                                        setMostrarHistorial(false);

                                        // Buscar la orden seleccionada
                                        const ordenSeleccionada = ordenesActivas.find(
                                            orden => String(orden.id) === String(ordenId)
                                        );

                                        if (ordenSeleccionada?.numero_orden) {
                                            mostrarPiezasOrdenes(ordenSeleccionada.numero_orden);
                                        }
                                    }}


                                    disabled={!proyectoSeleccionado}

                                     

                                >
                                    <option value="">-- Selecciona la Orden --</option>
                                   {ordenesFiltradas.map((orden) => (

                                            // VALUE DE LA ORDEN SELECCIONADA //ASI ESTABA ANTES
                                        <option key={orden.id} value={orden.id}>
                                            {orden.nombre} ({orden.cliente})
                                        </option>

                                                // EL NUEVO 
                                        // <option key={orden.id} value={orden.numero_orden}>
                                        //     {orden.numero_orden} ({orden.cliente})
                                        // </option>


                                    ))}
                                </select>
                            </div>
                        </div>


                        <div style={{...styles.card, opacity: ordenActiva ? 1 : 0.5}}>
                            <div style={styles.cardHeader}>
                                <div style={styles.orderTitle}>
                                    <span style={styles.iconChip}>📟</span>
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

                            {/* MOstrar los SERIALES DELAS OREDENS */}

                            <div style={styles.card}>
                                <div style={styles.cardHeaderSmall}>
                                    <span>📦 Seriales de la Orden</span>
                                </div>
                                {loadingPiezas ? (
                                    <div style={{textAlign:'center', padding:'20px'}}>
                                        <Spinner animation="border" />
                                    </div>
                                ) : piezasOrden?.detalle_piezas?.length > 0 ? (
                                    <div style={styles.serialList}>
                                        {piezasOrden.detalle_piezas.map((pieza, index) => (
                                            <div key={index} style={styles.serialItem}>
                                                <span style={styles.serialCode}>
                                                    {pieza.serial}
                                                </span>

                                                <span style={styles.serialStatus}>
                                                    {pieza.estatus}
                                                </span>
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
                                <span>🕒 Último Escaneo Exitoso</span>
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
                                                            <span style={{color: '#10b981', marginRight: '8px'}}>✓</span>
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

const styles = {
    appContainer: { backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' },
    navbar: { backgroundColor: '#4f46e5', color: 'white', padding: '10px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    navLeft: { display: 'flex', alignItems: 'center', gap: '20px' },
    logo: { fontWeight: 'bold', fontSize: '1.2rem' },
    stationTag: { fontSize: '0.85rem', opacity: 0.9 },
    navRight: { display: 'flex', alignItems: 'center', gap: '15px' },
    userInfo: { textAlign: 'right' },
    userName: { display: 'block', fontWeight: 'bold', fontSize: '0.9rem' },
    userRole: { fontSize: '0.7rem', opacity: 0.8 },
    avatar: { width: '35px', height: '35px', backgroundColor: '#818cf8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' },
    content: { padding: '30px 60px' },
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' },
    title: { margin: 0, fontSize: '1.8rem', color: '#1e293b' },
    subtitle: { margin: '5px 0 0 0', color: '#64748b' },
    btnConfig: { backgroundColor: '#e2e8f0', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', color: '#475569' },
    mainGrid: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px' },
    leftCol: { display: 'flex', flexDirection: 'column' },
    rightCol: { display: 'flex', flexDirection: 'column' },
    card: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px', position: 'relative' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
    orderTitle: { display: 'flex', gap: '12px', alignItems: 'center' },
    iconChip: { fontSize: '1.5rem', backgroundColor: '#f1f5f9', padding: '8px', borderRadius: '8px' },
    statusBadge: { backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', height: 'fit-content' },
    progressSection: { marginTop: '10px' },
    progressLabels: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' },
    progressBarBg: { backgroundColor: '#f1f5f9', height: '10px', borderRadius: '10px', overflow: 'hidden' },
    progressBarFill: { backgroundColor: '#4f46e5', height: '100%', transition: 'width 0.3s' },
    projectTag: { position: 'absolute', bottom: '10px', right: '10px', color: 'white', padding: '3px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' },
    scanCard: { textAlign: 'center', padding: '40px' },
    barcodeIcon: { fontSize: '3rem', color: '#cbd5e1', marginBottom: '10px' },
    scanForm: { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' },
    input: { width: '70%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' },
    btnRegister: { backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '0 20px', borderRadius: '8px', cursor: 'pointer' },
    kpiRow: { display: 'flex', gap: '15px', marginBottom: '20px' },
    kpiCard: { backgroundColor: 'white', flex: 1, padding: '15px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    kpiValue: { fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginTop: '5px' },
    cardHeaderSmall: { fontWeight: 'bold', marginBottom: '15px', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' },
    lastScanDetails: { backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' },
    detailRow: { padding: '10px 0', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' },
    inspectBadge: { backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', width: 'fit-content' },
    btnHistory: { width: '100%', marginTop: '15px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer', color: '#64748b', fontWeight: 'bold' },
    inputLabel: { display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b' },
    selectInput: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc' },
    errorMessage: { color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', marginTop: '15px', fontSize: '0.9rem', fontWeight: 'bold' },
    historyList: { marginTop: '15px', maxHeight: '250px', overflowY: 'auto', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '10px' },
    historyItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 5px', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' },
    historyEmpty: { textAlign: 'center', color: '#94a3b8', padding: '15px 0', fontSize: '0.9rem' },

    serialList: {
        maxHeight: '300px',
        overflowY: 'auto',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
    },

    serialItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 15px',
        borderBottom: '1px solid #e2e8f0',
        fontSize: '0.9rem'
    },

    serialCode: {
        fontWeight: 'bold',
        color: '#1e293b'
    },

    serialStatus: {
        backgroundColor: '#dcfce7',
        color: '#166534',
        padding: '3px 8px',
        borderRadius: '5px',
        fontSize: '0.7rem'
    }


};

export default VistaOperador;