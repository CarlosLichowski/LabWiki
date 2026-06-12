// src/pages/ManualEquipos/LauraXLDetail.tsx

import React from 'react';
import { FileDown } from 'lucide-react';

const LauraXLDetail: React.FC = () => {
    // 🔗 URL provista para el LauraXL (Manual de Usuario en Google Drive)
    const manualUrl = "https://drive.google.com/file/d/1FX7wi9Zw7EDLEKprHP59riEq3_-sT7Yv/view";

    return (
        <div className="p-3 animate__animated animate__fadeIn">
            <header className="mb-4">
                <h2 className="fw-bold text-success mb-1">
                    LauraXL - Autoanalizador de Orina
                </h2>
                <p className="text-muted lead fs-6">
                    Sistema automatizado completo que combina citometría de flujo de imágenes (Digital Flow Morphology) para la identificación del sedimento urinario y lectura fotométrica de la tira reactiva.
                </p>
            </header>
            
            <hr />

            {/* 1. Sección de Documentación */}
            <h4 className="mt-4 mb-3 d-flex align-items-center fs-5 fw-bold text-dark">
                📚 Documentación y Procedimientos
            </h4>
            <div className="row g-3 mb-5">
                {/* Manual de Referencia */}
                <div className="col-md-6">
                    <div className="card bg-light p-3 border-start border-4 border-primary h-100 shadow-sm">
                        <h5 className="fw-bold text-primary mb-2">Manual de Referencia del Operador</h5>
                        <p className="small text-muted mb-3">Versión oficial. Incluye guías completas de configuración, interfaz de usuario, mantenimiento y calibración óptica.</p>
                        
                        {/* 🟢 BOTÓN ENLACE A GOOGLE DRIVE */}
                        <a 
                            href={manualUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-primary mt-auto d-inline-flex align-items-center justify-content-center gap-2 fw-medium shadow-sm py-2 rounded-3"
                        >
                            <FileDown size={16} />
                            Ver / Descargar Manual (Drive)
                        </a>
                    </div>
                </div>
                {/* POE */}
                <div className="col-md-6">
                    <div className="card bg-light p-3 border-start border-4 border-success h-100 shadow-sm">
                        <h5 className="fw-bold text-success mb-2">Procedimiento Operativo Estándar (POE)</h5>
                        <p className="small text-muted mb-3">Instrucciones internas del laboratorio: Criterios de validación, procesamiento del control de calidad diario (QC) y preparación de reactivos.</p>
                        <button className="btn btn-sm btn-outline-success mt-auto py-2 rounded-3 fw-medium">
                            Ver POE en Línea
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Sección de Especificaciones Técnicas */}
            <h4 className="mt-4 mb-3 d-flex align-items-center fs-5 fw-bold text-dark">
                ⚙️ Especificaciones Técnicas y Rendimiento
            </h4>
            <div className="table-responsive">
                <table className="table table-striped table-bordered small">
                    <tbody>
                        <tr>
                            <td className="fw-bold w-50 bg-light text-secondary">Tecnología de Sedimento</td>
                            <td>Digital Flow Morphology (Citometría de Flujo mediante Imágenes Digitales)</td>
                        </tr>
                        <tr>
                            <td className="fw-bold bg-light text-secondary">Rendimiento (Sedimento)</td>
                            <td>Aproximadamente 101 muestras / hora</td>
                        </tr>
                        <tr>
                            <td className="fw-bold bg-light text-secondary">Principio de Tira Reactiva</td>
                            <td>Fotometría de reflectancia espectral (módulo de química integrado)</td>
                        </tr>
                        <tr>
                            <td className="fw-bold bg-light text-secondary">Volumen Mínimo de Muestra</td>
                            <td>1.5 - 2.0 mL de muestra de orina homogeneizada</td>
                        </tr>
                        <tr>
                            <td className="fw-bold bg-light text-secondary">Tipos de Partículas Analizadas</td>
                            <td>Eritrocitos, Leucocitos, Células Epiteliales, Cilindros, Cristales, Bacterias y Levaduras.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            {/* 3. Solución de Problemas Rápida */}
            <h4 className="mt-5 mb-3 d-flex align-items-center fs-5 fw-bold text-dark">
                🛠️ Solución de Problemas Comunes
            </h4>
            <div className="accordion shadow-sm rounded-3 overflow-hidden" id="lauraFaqAccordion">
                <div className="accordion-item border-0 mb-2 rounded-3 overflow-hidden">
                    <h2 className="accordion-header" id="lauraHeadingOne">
                        <button className="accordion-button collapsed fw-medium bg-light text-dark" type="button" data-bs-toggle="collapse" data-bs-target="#lauraCollapseOne" aria-expanded="false" aria-controls="lauraCollapseOne">
                            Mensaje de error: "Filtro de Celdas Sucio" o Pérdida de Presión
                        </button>
                    </h2>
                    <div id="lauraCollapseOne" className="accordion-collapse collapse" aria-labelledby="lauraHeadingOne" data-bs-parent="#lauraFaqAccordion">
                        <div className="accordion-body small bg-white text-muted">
                            <strong>Pasos de Acción:</strong><br />
                            1. Ejecutar el ciclo automático de limpieza de "Sistema Mayor" desde el panel de utilidades del software.<br />
                            2. Verificar que los niveles del detergente líquido de lavado sean los óptimos y no contengan burbujas de aire.<br />
                            3. Si el problema continúa, contactar al servicio técnico para realizar una purga del sistema hidráulico o reemplazo del filtro interno.
                        </div>
                    </div>
                </div>
                <div className="accordion-item border-0 mb-2 rounded-3 overflow-hidden">
                    <h2 className="accordion-header" id="lauraHeadingTwo">
                        <button className="accordion-button collapsed fw-medium bg-light text-dark" type="button" data-bs-toggle="collapse" data-bs-target="#lauraCollapseTwo" aria-expanded="false" aria-controls="lauraCollapseTwo">
                            Imágenes de sedimento borrosas o artefactos en la lectura óptica
                        </button>
                    </h2>
                    <div id="lauraCollapseTwo" className="accordion-collapse collapse" aria-labelledby="lauraHeadingTwo" data-bs-parent="#lauraFaqAccordion">
                        <div className="accordion-body small bg-white text-muted">
                            <strong>Causas y Solución:</strong><br />
                            Este síntoma suele deberse a un desajuste en el enfoque óptico o fluidos sucios.<br />
                            1. Confirmar que el equipo haya finalizado correctamente la secuencia automática de inicio y autoverificación del enfoque.<br />
                            2. Revisar la fecha de caducidad y calidad del diluyente / líquido de cobertura (*sheath fluid*).<br />
                            3. Ejecutar el procedimiento guiado de alineación y calibración de cámara digital desde el menú avanzado de mantenimiento de usuario.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LauraXLDetail;