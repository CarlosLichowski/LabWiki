// Cobas411Detail.tsx
import React from 'react';
import { ArrowLeft, FileText, Download, CheckSquare, AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../../css/DetalleEquipo.css';

const Cobas411Detail: React.FC = () => {
    const manualUrl = "https://elabdoc-prod.roche.com/eLD/api/downloads/93994c68-df9d-ee11-2291-005056a71a5d?countryIsoCode=es";

    const tareasMantenimiento = [
        "Revisar el estado y volumen de ProCell y CleanCell a bordo.",
        "Vaciar el contenedor de puntas (AssayTips) y copas utilizadas.",
        "Limpieza manual de la aguja de aspiración con alcohol isopropílico.",
        "Realizar calibraciones pendientes y procesar controles de calidad."
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
                        <FileText size={28} className="icon-primary" /> Cobas e411® — Manual del Operador
                    </h2>
                    <p className="instrument-subtitle">
                        Inmunoanalizador Compacto Basado en Tecnología ECL (Electroquimioluminiscencia) — Roche
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
                        title="Manual Cobas e411"
                        className="pdf-iframe"
                    />
                </main>

                {/* CONTROLES LATERALES */}
                <aside className="sidebar-cards">
                    
                    {/* Tareas */}
                    <div className="info-card maintenance-card">
                        <h3 className="card-title">
                            <CheckSquare size={18} className="icon-success" /> Mantenimiento Diario Obligatorio
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
                            ⚙️ Especificaciones Técnicas
                        </h3>
                        <div className="specs-box">
                            <p className="spec-item"><strong>Rendimiento:</strong> Hasta 86 pruebas / hora máximo</p>
                            <p className="spec-item"><strong>Capacidad:</strong> 18 ensayos diferentes a bordo simultáneos</p>
                            <p className="spec-item"><strong>Volumen de muestra:</strong> 10 a 50 &mu;L según técnica</p>
                            <p className="spec-item"><strong>Tiempo de Análisis:</strong> 9 a 27 minutos promedio</p>
                        </div>
                    </div>

                    {/* Errores */}
                    <div className="info-card support-card">
                        <h3 className="card-title">
                            <AlertTriangle size={18} className="icon-warning" /> Solución de Problemas Comunes
                        </h3>
                        <div className="error-help-box">
                            <p className="error-item"><strong>QC fuera de rango:</strong> Verificar caducidad/estabilidad a bordo del reactivo o recalibrar el lote.</p>
                            <p className="error-item"><strong>Bloqueo de pipeta:</strong> Detener análisis, aplicar lavado por software o revisar obstrucciones físicas.</p>
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

export default Cobas411Detail;