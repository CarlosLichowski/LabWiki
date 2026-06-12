//Cobas6000Detail.tsx

import React from 'react';
import { FileDown } from 'lucide-react';

const Cobas6000Detail: React.FC = () => {
    // 🔗 URL provista para el Cobas 6000
    const manualUrl = "https://elabdoc-prod.roche.com/eLD/api/downloads/7a22ec26-a36b-f011-3091-005056a772fd?countryIsoCode=es";

    return (
        <div className="p-4 border rounded shadow-sm bg-white animate__animated animate__fadeIn">
            <header className="mb-4">
                <h2 className="fw-bold text-success mb-1">
                    Cobas 6000 - Plataforma Analítica Modular
                </h2>
                <p className="text-muted lead">
                    Sistema consolidado de alta gama que integra módulos de Química Clínica (c501) e Inmunoensayos (e601).
                </p>
            </header>
            
            <hr />

            {/* 1. Sección de Documentación */}
            <h4 className="mt-4 mb-3 d-flex align-items-center">
                📚 Documentación y POEs
            </h4>
            <div className="row g-3 mb-5">
                {/* Manual de Usuario */}
                <div className="col-md-6">
                    <div className="card bg-light p-3 border-start border-4 border-primary h-100 shadow-sm">
                        <h5 className="fw-bold text-primary">Manual de Referencia del Operador</h5>
                        <p className="small text-muted mb-3">Versión oficial de Roche Diagnostics. Configuración, calibración y flujos consolidados.</p>
                        
                        {/* 🟢 BOTÓN IMPLEMENTADO: Enlace de descarga al Cobas 6000 */}
                        <a 
                            href={manualUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-primary mt-auto d-inline-flex align-items-center justify-content-center gap-2 fw-medium shadow-sm py-2 rounded-3"
                        >
                            <FileDown size={16} />
                            Descargar Manual Oficial (PDF)
                        </a>
                    </div>
                </div>
                {/* POE */}
                <div className="col-md-6">
                    <div className="card bg-light p-3 border-start border-4 border-success h-100 shadow-sm">
                        <h5 className="fw-bold text-success">Procedimiento Operativo Estándar (POE)</h5>
                        <p className="small text-muted mb-3">Instrucciones internas: Mantenimiento de reactivos a bordo y lavado de celdas automático.</p>
                        <button className="btn btn-sm btn-outline-success mt-auto py-2 rounded-3 fw-medium">
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
                        <td className="fw-bold w-50">Configuración Modular</td>
                        <td>Módulos combinables c501 (Química) + e601 (Inmuno)</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Rendimiento Consolidado</td>
                        <td>Depende de los módulos activos (Hasta 2000 pruebas/hora)</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Principios de Medición</td>
                        <td>Absorbancia Fotométrica, Turbidimetría, ECL e ISE (Electrodos)</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Carga de Muestras</td>
                        <td>Bandejas continuas de 5 posiciones (cargador de hasta 150 muestras)</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Gestión de Datos</td>
                        <td>Conectividad bidireccional inteligente con Middleware / LIS</td>
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
                            Error de Alarma en las celdas de incubación (Módulo Química)
                        </button>
                    </h2>
                    <div id="collapseOne" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#faqAccordion">
                        <div className="accordion-body small bg-light">
                            <strong>Pasos de Verificación:</strong> 1. Verificar el nivel del detergente Cell Wash. 2. Correr una rutina extra de lavado de cubetas desde la pantalla de utilidades. 3. Comprobar la integridad de las lámparas fotométricas si el error persiste en longitudes de onda específicas.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cobas6000Detail;