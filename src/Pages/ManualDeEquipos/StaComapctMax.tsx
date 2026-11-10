// StaCompactMax.tsx
import { ArrowLeft, FileText, Download, CheckSquare, AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../../css/DetalleEquipo.css'; // Asegúrate de que apunte a tu ruta correcta

function StaCompactMax() {
    const pdfUrl = "https://irp.cdn-website.com/59ea1277/files/uploaded/STAMAX.pdf";

    const tareasMantenimiento = [
        "Verificar niveles de líquidos (Limpieza, Desechos y Destilada).",
        "Controlar la aguja de muestreo y el estado del teflón.",
        "Limpieza del pozo de lavado y de las estaciones de lectura.",
        "Pasar controles de calidad internos (Coag Control N + A)."
    ];

    return (
        <div className="manual-page-container">
            {/* CABECERA DE LA PÁGINA */}
            <header className="manual-header">
                <div className="header-left">
                    <Link to="/manuales" className="back-link">
                        <ArrowLeft size={16} /> Volver a Manuales
                    </Link>
                    <h2 className="instrument-title">
                        <FileText size={28} className="icon-primary" /> 
                        <span>STA Compact Max® — Manual de Usuario</span>
                    </h2>
                    <p className="instrument-subtitle">
                        Analizador Automático de Hemostasia / Coagulación (Stago)
                    </p>
                </div>
                
                <div className="header-actions">
                    <a href={pdfUrl} download className="btn-manual btn-download">
                        <Download size={16} /> Descargar PDF
                    </a>
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="btn-manual btn-external">
                        <ExternalLink size={16} /> Abrir pestaña
                    </a>
                </div>
            </header>

            {/* CUERPO PRINCIPAL DEL PANEL */}
            <div className="manual-grid-layout">
                
                {/* COLUMNA IZQUIERDA: VISUALIZADOR DEL MANUAL */}
                <main className="pdf-viewer-card">
                    <iframe 
                        src={`${pdfUrl}#toolbar=1`} 
                        title="Manual STA Compact Max"
                        className="pdf-iframe"
                    />
                </main>

                {/* COLUMNA DERECHA: PANALES DE CONTROL RÁPIDO */}
                <aside className="sidebar-cards">
                    
                    {/* Tarjeta de Checklist Diario */}
                    <div className="info-card maintenance-card">
                        <h3 className="card-title">
                            <CheckSquare size={18} className="icon-success" /> Mantenimiento Obligatorio
                        </h3>
                        <ul className="checklist-list">
                            {tareasMantenimiento.map((tarea, index) => (
                                <li key={index}>
                                    <label htmlFor={`task-${index}`} className="checklist-item">
                                        <input 
                                            type="checkbox" 
                                            id={`task-${index}`} 
                                            className="task-checkbox" 
                                        />
                                        <span>{tarea}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Tarjeta de Soporte y Alarmas Frecuentes */}
                    <div className="info-card support-card">
                        <h3 className="card-title">
                            <AlertTriangle size={18} className="icon-warning" /> Errores Comunes
                        </h3>
                        <div className="error-help-box">
                            <p className="error-item"><strong>Error: Temp. Out of Range</strong> — Verificar la temperatura de la cámara de reactivos (debe estar a 15°C).</p>
                            <p className="error-item"><strong>Error: Barcode Read Error</strong> — Limpiar la ventana del lector óptico con un paño seco.</p>
                        </div>
                        <button className="btn-report-issue" onClick={() => alert("Función para abrir ticket técnico en desarrollo")}>
                            Reportar Incidencia en el Equipo
                        </button>
                    </div>

                </aside>
            </div>
        </div>
    );
}

export default StaCompactMax;