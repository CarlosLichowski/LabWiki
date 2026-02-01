// src/pages/ManualEquipos/IrisIQ200Detail.tsx

import React from 'react';

const IrisIQ200Detail: React.FC = () => {
    return (
        <div className="p-4 border rounded shadow-sm bg-white">
            <header className="mb-4">
                <h2 className="fw-bold text-success mb-1">
                    IRIS iQ200 Elite - Autoanalizador de Orina
                </h2>
                <p className="text-muted lead">
                    Sistema automatizado que combina citometría de flujo de imágenes (Digital Flow Morphology) para el análisis de sedimento y tira reactiva.
                </p>
                
            </header>
            
            <hr />

            {/* 1. Sección de Documentación */}
            <h4 className="mt-4 mb-3 d-flex align-items-center">
                📚 Documentación y Procedimientos
            </h4>
            <div className="row g-3 mb-5">
                {/* Manual de Referencia */}
                <div className="col-md-6">
                    <div className="card bg-light p-3 border-start border-4 border-primary h-100">
                        <h5 className="fw-bold text-primary">Manual de Referencia del Operador</h5>
                        <p className="small text-muted mb-2">Versión 8.3 (Marzo 2024). Incluye guía de instalación y mantenimiento.</p>
                        <button className="btn btn-sm btn-outline-primary mt-auto">
                            Descargar PDF (20 MB)
                        </button>
                    </div>
                </div>
                {/* POE */}
                <div className="col-md-6">
                    <div className="card bg-light p-3 border-start border-4 border-success h-100">
                        <h5 className="fw-bold text-success">Procedimiento Operativo Estándar (POE)</h5>
                        <p className="small text-muted mb-2">Instrucciones para el control de calidad diario (QC) y carga de muestras.</p>
                        <button className="btn btn-sm btn-outline-success mt-auto">
                            Ver POE en Línea
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Sección de Especificaciones Técnicas */}
            <h4 className="mt-4 mb-3 d-flex align-items-center">
                ⚙️ Especificaciones Técnicas y Rendimiento
            </h4>
            <table className="table table-striped table-bordered small">
                <tbody>
                    <tr>
                        <td className="fw-bold w-50">Tecnología de Sedimento</td>
                        <td>Digital Flow Morphology (Citometría de Flujo de Imágenes)</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Rendimiento (Sedimento)</td>
                        <td>Aproximadamente 101 muestras/hora</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Principio de Tira Reactiva</td>
                        <td>Reflectancia espectral (integrado o modular)</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Volumen Mínimo de Muestra</td>
                        <td>1.5 - 2.0 mL</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Tipos de Partículas Analizadas</td>
                        <td>Eritrocitos, Leucocitos, Células Epiteliales, Cilindros, Cristales, Bacterias, Levaduras.</td>
                    </tr>
                </tbody>
            </table>
            
            {/* 3. Solución de Problemas Rápida */}
            <h4 className="mt-5 mb-3 d-flex align-items-center">
                🛠️ Solución de Problemas Comunes (FAQ)
            </h4>
            <div className="accordion" id="irisFaqAccordion">
                <div className="accordion-item">
                    <h2 className="accordion-header" id="irisHeadingOne">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#irisCollapseOne" aria-expanded="false" aria-controls="irisCollapseOne">
                            Mensaje de error: "Filtro de Celdas Sucio"
                        </button>
                    </h2>
                    <div id="irisCollapseOne" className="accordion-collapse collapse" aria-labelledby="irisHeadingOne" data-bs-parent="#irisFaqAccordion">
                        <div className="accordion-body small bg-light">
                            <strong>Pasos de Acción:</strong> 1. Ejecutar el ciclo de limpieza de "Sistema Mayor" a través del software. 2. Si el error persiste, verificar el nivel del detergente de limpieza. 3. Si el problema continúa, contactar al servicio técnico para una limpieza profunda o reemplazo del filtro.
                        </div>
                    </div>
                </div>
                <div className="accordion-item">
                    <h2 className="accordion-header" id="irisHeadingTwo">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#irisCollapseTwo" aria-expanded="false" aria-controls="irisCollapseTwo">
                            Imágenes de sedimento borrosas o de baja calidad
                        </button>
                    </h2>
                    <div id="irisCollapseTwo" className="accordion-collapse collapse" aria-labelledby="irisHeadingTwo" data-bs-parent="#irisFaqAccordion">
                        <div className="accordion-body small bg-light">
                            <strong>Causas y Solución:</strong> Esto puede deberse a un problema de enfoque óptico. 1. Asegúrese de que el equipo haya completado su secuencia de inicio y verificación de enfoque. 2. Verificar la calidad del diluyente/líquido de sheath. 3. Ejecutar el procedimiento de calibración de imagen si está disponible en el menú de mantenimiento.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IrisIQ200Detail;