// Cobas503Detail.tsx
import React from 'react';
import { ArrowLeft, FileText, Download, CheckSquare, AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../../css/DetalleEquipo.css';

const Cobas503Detail: React.FC = () => {
    const manualUrl = "https://elabdoc-prod.roche.com/eLD/api/downloads/7a22ec26-a36b-f011-3091-005056a772fd?countryIsoCode=es"; // Reutilizada URL de referencia de Química Roche

    const tareasMantenimiento = [
        "Verificar suministro de agua desionizada y flujo hidráulico.",
        "Revisar el estado físico de la aguja ultrasónica de mezclado.",
        "Inspeccionar visualmente las cubetas ópticas de lectura.",
        "Controlar la temperatura estable del bloque de incubación."
    ];

    return (
        <div className="manual-page-container">
            {/* CABECERA */}
            <header className="manual-header">
                <div className="header-left">
                    <Link to="/manuales" className="back-link">
                        <ArrowLeft size={16} /> Volver a Manuales
                    </Link>
                    <h2 className="instrument-title">
                        <FileText size={28} className="icon-primary" /> Cobas c503® — Manual de Referencia
                    </h2>
                    <p className="instrument-subtitle">
                        Analizador Automatizado de Química Clínica Avanzada y Proteínas — Roche
                    </p>
                </div>
                
                <div className="header-actions">
                    <a href={manualUrl} download className="btn-manual btn-download">
                        <Download size={16} /> Descargar PDF
                    </a>
                    <a href={manualUrl} target="_blank" rel="noopener noreferrer" className="btn-manual btn-external">
                        <ExternalLink size={16} /> Abrir en pestaña nueva
                    </a>
                </div>
            </header>

            {/* CONTENIDO PRINCIPAL */}
            <div className="manual-grid-layout">
                
                {/* VISUALIZADOR PDF */}
                <main className="pdf-viewer-card">
                    <iframe 
                        src={`${manualUrl}#toolbar=1`} 
                        title="Manual Cobas c503"
                        className="pdf-iframe"
                    />
                </main>

                {/* CONTROLES LATERALES */}
                <aside className="sidebar-cards">
                    
                    {/* Tareas */}
                    <div className="info-card maintenance-card">
                        <h3 className="card-title">
                            <CheckSquare size={18} className="icon-success" /> Mantenimiento de Rutina
                        </h3>
                        <ul className="checklist-list">
                            {tareasMantenimiento.map((tarea, index) => (
                                <li key={index} className="checklist-item">
                                    <input type="checkbox" id={`task-${index}`} className="task-checkbox" />
                                    <label htmlFor={`task-${index}`}>{tarea}</label>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Especificaciones */}
                    <div className="info-card specs-card">
                        <h3 className="card-title">
                            ⚙️ Atributos del Sistema
                        </h3>
                        <div className="specs-box">
                            <p className="spec-item"><strong>Capacidad máxima:</strong> Hasta 600 determinaciones / hora fotométricas</p>
                            <p className="spec-item"><strong>Principios:</strong> Fotometría de absorbancia y turbidimetría avanzada</p>
                            <p className="spec-item"><strong>Reactivos:</strong> Formato Cobas c pack auto-reconocibles mediante RFID</p>
                            <p className="spec-item"><strong>Alimentación:</strong> 220V standard con estabilizador dedicado</p>
                        </div>
                    </div>

                    {/* Errores */}
                    <div className="info-card support-card">
                        <h3 className="card-title">
                            <AlertTriangle size={18} className="icon-warning" /> Mensajes de Alerta Comunes
                        </h3>
                        <div className="error-help-box">
                            <p className="error-item"><strong>Error de conexión LIS:</strong> Verificar direccionamiento IP interno y cableado de red o middleware.</p>
                            <p className="error-item"><strong>Fallo QC Sistemático:</strong> Comprobar preparación/evaporación del control o calibrar canal específico.</p>
                        </div>
                        <button className="btn-report-issue" onClick={() => alert("Función para abrir ticket técnico en desarrollo")}>
                            Reportar Incidencia en el Equipo
                        </button>
                    </div>

                </aside>
            </div>
        </div>
    );
};

export default Cobas503Detail;