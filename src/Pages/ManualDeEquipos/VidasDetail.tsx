// src/pages/ManualEquipos/VidasDetail.tsx

import React from 'react';
import '../../css/DetalleEquipo.css';

const VidasDetail: React.FC = () => {
    return (
        <div className="p-4 border rounded shadow-sm bg-white">
            <header className="mb-4">
                <h2 className="fw-bold text-success mb-1">
                    VIDAS 3 - Sistema de Inmunoensayo Automatizado
                </h2>
                <p className="text-muted lead">
                    Analizador compacto y automatizado que utiliza la técnica ELISA de Fase Sólida (ELFA) para realizar inmunoensayos y pruebas de identificación bacteriana.
                </p>
                
            </header>
            
            <hr />

            {/* 1. Sección de Documentación */}
            <h4 className="mt-4 mb-3 d-flex align-items-center">
                📚 Documentación y POEs
            </h4>
            <div className="row g-3 mb-5">
                {/* Manual de Operación */}
                <div className="col-md-6">
                    <div className="card bg-light p-3 border-start border-4 border-primary h-100">
                        <h5 className="fw-bold text-primary">Manual de Operación</h5>
                        <p className="small text-muted mb-2">Versión 1.2 (Julio 2024). Guía de uso diario y carga de reactivos SPR.</p>
                        <button className="btn btn-sm btn-outline-primary mt-auto">
                            Descargar PDF (9 MB)
                        </button>
                    </div>
                </div>
                {/* POE */}
                <div className="col-md-6">
                    <div className="card bg-light p-3 border-start border-4 border-success h-100">
                        <h5 className="fw-bold text-success">Procedimiento Operativo Estándar (POE)</h5>
                        <p className="small text-muted mb-2">Protocolo de limpieza, desinfección y mantenimiento preventivo semanal.</p>
                        <button className="btn btn-sm btn-outline-success mt-auto">
                            Ver POE en Línea
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Sección de Especificaciones Técnicas */}
            <h4 className="mt-4 mb-3 d-flex align-items-center">
                ⚙️ Especificaciones Técnicas
            </h4>
            <table className="table table-striped table-bordered small">
                <tbody>
                    <tr>
                        <td className="fw-bold w-50">Principio de Medición</td>
                        <td>ELFA (Enzyme-Linked Fluorescent Assay)</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Formato de Reactivo</td>
                        <td>SPR (Solid Phase Receptacle) y Strip de Reacción</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Rendimiento Máximo</td>
                        <td>Hasta 30 tests por hora</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Módulos de Pruebas</td>
                        <td>Hasta 30 posiciones individuales para muestras y reactivos</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Control de Temperatura</td>
                        <td>Módulos de incubación termorregulados</td>
                    </tr>
                </tbody>
            </table>
            
            {/* 3. Solución de Problemas Rápida */}
            <h4 className="mt-5 mb-3 d-flex align-items-center">
                🛠️ Solución de Problemas Comunes (FAQ)
            </h4>
            <div className="accordion" id="vidasFaqAccordion">
                <div className="accordion-item">
                    <h2 className="accordion-header" id="vidasHeadingOne">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#vidasCollapseOne" aria-expanded="false" aria-controls="vidasCollapseOne">
                            Error al cargar o detectar el Strip de Reacción
                        </button>
                    </h2>
                    <div id="vidasCollapseOne" className="accordion-collapse collapse" aria-labelledby="vidasHeadingOne" data-bs-parent="#vidasFaqAccordion">
                        <div className="accordion-body small bg-light">
                            <strong>Pasos de Verificación:</strong> 1. Asegúrese de que el strip esté orientado correctamente y se haya introducido firmemente en su posición. 2. Verifique que no haya humedad o residuos en la ranura de carga. 3. Limpie la zona de lectura óptica según el manual de mantenimiento.
                        </div>
                    </div>
                </div>
                <div className="accordion-item">
                    <h2 className="accordion-header" id="vidasHeadingTwo">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#vidasCollapseTwo" aria-expanded="false" aria-controls="vidasCollapseTwo">
                            Resultados inesperadamente bajos o altos (Out of Range)
                        </button>
                    </h2>
                    <div id="vidasCollapseTwo" className="accordion-collapse collapse" aria-labelledby="vidasHeadingTwo" data-bs-parent="#vidasFaqAccordion">
                        <div className="accordion-body small bg-light">
                            <strong>Acciones:</strong> 1. Revisar la fecha de caducidad y el almacenamiento (refrigeración) de los reactivos SPR. 2. Verificar que el proceso de Calibración/QC fue exitoso antes de la corrida de muestras. 3. Repetir la muestra con un kit nuevo si es posible.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VidasDetail;