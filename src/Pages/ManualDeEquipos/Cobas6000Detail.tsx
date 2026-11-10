// Cobas6000Detail.tsx
import React from 'react';
import { ArrowLeft, FileText, Download, CheckSquare, AlertTriangle, ExternalLink, Layers } from 'lucide-react'; 
import { Link } from 'react-router-dom';
import '../../css/DetalleEquipo.css';

const Cobas6000Detail: React.FC = () => {
    const manualUrl = "https://elabdoc-prod.roche.com/eLD/api/downloads/7a22ec26-a36b-f011-3091-005056a772fd?countryIsoCode=es";

    const tareasMantenimiento = [
        "Efectuar el lavado de cubetas de reacción (Cell Wash).",
        "Controlar y purgar burbujas en las jeringas de dosificación.",
        "Limpieza de la estación de lavado de agujas.",
        "Verificar niveles de reactivos auxiliares y vaciar residuos."
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
                        <FileText size={28} className="icon-primary" /> Cobas 6000® — Manual de Referencia
                    </h2>
                    <p className="instrument-subtitle">
                        Plataforma Analítica Modular (Química c501 e Inmunoensayos e601) — Roche Diagnostics
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
                        title="Manual Cobas 6000"
                        className="pdf-iframe"
                    />
                </main>

                {/* CONTROLES LATERALES */}
                <aside className="sidebar-cards">
                    
                    {/* Tareas de Mantenimiento */}
                    <div className="info-card maintenance-card">
                        <h3 className="card-title">
                            <CheckSquare size={18} className="icon-success" /> Mantenimiento Diario Requerido
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

                    {/* Especificaciones Técnicas */}
                    <div className="info-card specs-card">
                        <h3 className="card-title">
                            <Layers size={18} className="icon-primary" style={{ color: '#0d47a1' }} /> Especificaciones Clave
                        </h3>
                        <div className="specs-box">
                            <p className="spec-item"><strong>Configuración:</strong> Modular combinable c501 + e601</p>
                            <p className="spec-item"><strong>Rendimiento:</strong> Hasta 2000 pruebas / hora continuas</p>
                            <p className="spec-item"><strong>Principios:</strong> Absorbancia Fotométrica, Turbidimetría, ECL e ISE</p>
                            <p className="spec-item"><strong>Carga:</strong> Bandejas de 5 posiciones con cargador continuo</p>
                        </div>
                    </div>

                    {/* Códigos de Error */}
                    <div className="info-card support-card">
                        <h3 className="card-title">
                            <AlertTriangle size={18} className="icon-warning" /> Alarmas Comunes (FAQ)
                        </h3>
                        <div className="error-help-box">
                            <p className="error-item"><strong>Alarma en Celdas de Incubación:</strong> Verificar detergente Cell Wash y correr rutina extra de lavado.</p>
                            <p className="error-item"><strong>Error del Middleware:</strong> Revisar conexión RS232/Ethernet y reiniciar servicios LIS.</p>
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

export default Cobas6000Detail;