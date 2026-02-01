// src/pages/ManualEquipos/Cobas503Detail.tsx

import React from 'react';

const Cobas503Detail: React.FC = () => {
    return (
        <div className="p-4 border rounded shadow-sm bg-white">
            <header className="mb-4">
                <h2 className="fw-bold text-success mb-1">
                    Cobas c503 - Analizador de Química Clínica
                </h2>
                <p className="text-muted lead">
                    Módulo analítico integrado de alto rendimiento para química clínica y proteínas específicas.
                </p>
            </header>
            
            <hr />

            {/* 1. Sección de Documentación */}
            <h4 className="mt-4 mb-3 d-flex align-items-center">
                📚 Documentación y POEs
            </h4>
            <div className="row g-3 mb-5">
                <div className="col-md-6">
                    <div className="card bg-light p-3 border-start border-4 border-primary h-100">
                        <h5 className="fw-bold text-primary">Manual de Referencia</h5>
                        <p className="small text-muted mb-2">Versión 2.0.1 (Abril 2025). Incluye instalación y mantenimiento.</p>
                        <button className="btn btn-sm btn-outline-primary mt-auto">
                            Descargar PDF (25 MB)
                        </button>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card bg-light p-3 border-start border-4 border-success h-100">
                        <h5 className="fw-bold text-success">Procedimiento Operativo Estándar (POE)</h5>
                        <p className="small text-muted mb-2">Instrucciones diarias: Encendido, Calibración, Control de Calidad (QC).</p>
                        <button className="btn btn-sm btn-outline-success mt-auto">
                            Ver POE en Línea
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Sección de Especificaciones Técnicas */}
            <h4 className="mt-4 mb-3 d-flex align-items-center">
                ⚙️ Especificaciones Clave
            </h4>
            <table className="table table-striped table-bordered small">
                <tbody>
                    <tr>
                        <td className="fw-bold w-50">Tipo de Análisis</td>
                        <td>Química Clínica, Iones y Proteínas Específicas</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Rendimiento Máximo</td>
                        <td>Hasta 600 pruebas/hora (fotométricas)</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Principio de Medición</td>
                        <td>Fotometría (Absorbancia) y Turbidimetría</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Manejo de Reactivos</td>
                        <td>Módulos de reactivos Cobas c pack (RFID)</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Requisitos Eléctricos</td>
                        <td>220-240V, 50/60 Hz</td>
                    </tr>
                </tbody>
            </table>
            
            {/* 3. Solución de Problemas Rápida */}
            <h4 className="mt-5 mb-3 d-flex align-items-center">
                🛠️ Solución de Problemas Comunes
            </h4>
            <div className="accordion" id="faqAccordion">
                <div className="accordion-item">
                    <h2 className="accordion-header" id="headingOne">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                            Error de Comunicación con el LIS
                        </button>
                    </h2>
                    <div id="collapseOne" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#faqAccordion">
                        <div className="accordion-body small bg-light">
                            <strong>Pasos de Verificación:</strong> 1. Revisar la conexión del cable RS232/Ethernet. 2. Verificar la configuración IP en el software del instrumento. 3. Reiniciar el servicio del middleware del LIS.
                        </div>
                    </div>
                </div>
                <div className="accordion-item">
                    <h2 className="accordion-header" id="headingTwo">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                            Fallo en el Control de Calidad (QC)
                        </button>
                    </h2>
                    <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#faqAccordion">
                        <div className="accordion-body small bg-light">
                            <strong>Acciones:</strong> 1. Verificar fecha de caducidad del material de QC. 2. Repetir el QC utilizando un vial recién preparado. 3. Si persiste, verificar la estabilidad del reactivo y considerar la calibración.
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default Cobas503Detail;