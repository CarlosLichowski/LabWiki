// src/pages/ManualEquipos/Cobas411Detail.tsx

import React from 'react';

const Cobas411Detail: React.FC = () => {
    return (
        <div className="p-4 border rounded shadow-sm bg-white">
            <header className="mb-4">
                <h2 className="fw-bold text-success mb-1">
                    Cobas e411 - Inmunoanalizador
                </h2>
                <p className="text-muted lead">
                    Plataforma compacta y totalmente automatizada para inmunoensayos basados en la tecnología ECL (Electroquimioluminiscencia).
                </p>
                
            </header>
            
            <hr />

            {/* 1. Sección de Documentación */}
            <h4 className="mt-4 mb-3 d-flex align-items-center">
                📚 Documentación y Recursos
            </h4>
            <div className="row g-3 mb-5">
                {/* Manual de Usuario */}
                <div className="col-md-6">
                    <div className="card bg-light p-3 border-start border-4 border-primary h-100">
                        <h5 className="fw-bold text-primary">Manual de Usuario</h5>
                        <p className="small text-muted mb-2">Versión 5.1 (Octubre 2024). Guía completa de operación y seguridad.</p>
                        <button className="btn btn-sm btn-outline-primary mt-auto">
                            Descargar PDF (12 MB)
                        </button>
                    </div>
                </div>
                {/* POE */}
                <div className="col-md-6">
                    <div className="card bg-light p-3 border-start border-4 border-success h-100">
                        <h5 className="fw-bold text-success">Procedimiento Operativo Estándar (POE)</h5>
                        <p className="small text-muted mb-2">Instrucciones rápidas para el encendido, preparación de muestras y mantenimiento diario.</p>
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
                        <td>Electroquimioluminiscencia (ECL)</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Rendimiento Máximo</td>
                        <td>Hasta 86 pruebas/hora</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Métodos de Ensayo</td>
                        <td>Hasta 18 ensayos diferentes a bordo</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Tiempo de Análisis</td>
                        <td>9 a 27 minutos (la mayoría menos de 18 min)</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Tamaño de la Muestra</td>
                        <td>10 - 50 $\mu L$</td>
                    </tr>
                </tbody>
            </table>
            
            {/* 3. Solución de Problemas Rápida */}
            <h4 className="mt-5 mb-3 d-flex align-items-center">
                🛠️ Solución de Problemas Comunes (FAQ)
            </h4>
            <div className="accordion" id="e411FaqAccordion">
                <div className="accordion-item">
                    <h2 className="accordion-header" id="e411HeadingOne">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#e411CollapseOne" aria-expanded="false" aria-controls="e411CollapseOne">
                            Error de Control de Calidad (QC) fuera de rango
                        </button>
                    </h2>
                    <div id="e411CollapseOne" className="accordion-collapse collapse" aria-labelledby="e411HeadingOne" data-bs-parent="#e411FaqAccordion">
                        <div className="accordion-body small bg-light">
                            <strong>Pasos de Verificación:</strong> 1. Revisar la fecha de caducidad y el tiempo de estabilidad a bordo del reactivo. 2. Verificar la preparación y el almacenamiento del material de QC. 3. Realizar una recalibración del ensayo afectado.
                        </div>
                    </div>
                </div>
                <div className="accordion-item">
                    <h2 className="accordion-header" id="e411HeadingTwo">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#e411CollapseTwo" aria-expanded="false" aria-controls="e411CollapseTwo">
                            Bloqueo de Pipeta (Aspiración de Muestra)
                        </button>
                    </h2>
                    <div id="e411CollapseTwo" className="accordion-collapse collapse" aria-labelledby="e411HeadingTwo" data-bs-parent="#e411FaqAccordion">
                        <div className="accordion-body small bg-light">
                            <strong>Acciones:</strong> 1. Detener el análisis. 2. Realizar el procedimiento de limpieza de pipetas a través del software. 3. Si el problema persiste, inspeccionar la punta en busca de coágulos o residuos. 4. Contactar al servicio técnico si el error persiste.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cobas411Detail;