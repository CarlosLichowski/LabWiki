// src/pages/ManualEquipos/ProteinogramaDetail.tsx

import React from 'react';
import '../../css/DetalleEquipo.css';

const ProteinogramaDetail: React.FC = () => {
    // 💡 NOTA: Reemplaza "Nombre del Fabricante y Modelo" una vez que tengas el dato exacto.
    const nombreEquipo = "Analizador de Proteinogramas por Electroforesis";
    
    return (
        <div className="p-4 border rounded shadow-sm bg-white animate__animated animate__fadeIn">
            <header className="mb-4">
                <h2 className="fw-bold text-success mb-1">
                    {nombreEquipo}
                </h2>
                <p className="text-muted lead">
                    Documentación técnica para el equipo de separación e identificación cuantitativa de proteínas séricas o urinarias.
                </p>
            </header>
            
            <hr />

            {/* 1. Sección de Documentación */}
            <h4 className="mt-4 mb-3 d-flex align-items-center">
                📚 Documentación y Recursos
            </h4>
            <div className="row g-3 mb-5">
                {/* Manual de Aplicaciones (Expandido a todo el ancho al remover el POE) */}
                <div className="col-12">
                    <div className="card bg-light p-3 border-start border-4 border-primary h-100 shadow-sm">
                        <h5 className="fw-bold text-primary">Manual de Aplicaciones Específicas</h5>
                        <p className="small text-muted mb-3">Versión XX. Incluye protocolos para proteinograma, inmunofijación y HbA1c.</p>
                        <button 
                            className="btn btn-sm btn-primary mt-auto py-2 rounded-3 fw-medium shadow-sm"
                            style={{ maxWidth: 'fit-content' }}
                        >
                            Descargar PDF
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
                        <td className="fw-bold w-50">Tecnología Base</td>
                        <td>PENDIENTE (Capilaridad / Gel de Agarosa)</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Aplicaciones Comunes</td>
                        <td>Proteinograma (SPEP), Inmunofijación (IFE), Hemoglobina A2.</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Rendimiento Máximo</td>
                        <td>PENDIENTE (Ej: 80 muestras/hora)</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Software de Análisis</td>
                        <td>PENDIENTE (Ej: Phoresis)</td>
                    </tr>
                    <tr>
                        <td className="fw-bold">Volumen de Muestra</td>
                        <td>PENDIENTE (Ej: 10 - 20 &mu;L)</td>
                    </tr>
                </tbody>
            </table>
            
            {/* 3. Solución de Problemas Rápida */}
            <h4 className="mt-5 mb-3 d-flex align-items-center">
                🛠️ Solución de Problemas Comunes
            </h4>
            <div className="accordion" id="proteinogramaFaqAccordion">
                <div className="accordion-item">
                    <h2 className="accordion-header" id="protHeadingOne">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#protCollapseOne" aria-expanded="false" aria-controls="protCollapseOne">
                            Artefactos o bandas irregulares en el patrón de electroforesis
                        </button>
                    </h2>
                    <div id="protCollapseOne" className="accordion-collapse collapse" aria-labelledby="protHeadingOne" data-bs-parent="#proteinogramaFaqAccordion">
                        <div className="accordion-body small bg-light">
                            <strong>Causas Comunes:</strong> 1. Burbujas en el gel/capilar. 2. Buffer de electroforesis contaminado o mal preparado. 3. Problemas con la aplicación de la muestra (sobrecarga o inconsistencia). 4. Muestra hemolizada o lipémica.
                        </div>
                    </div>
                </div>
                <div className="accordion-item">
                    <h2 className="accordion-header" id="protHeadingTwo">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#protCollapseTwo" aria-expanded="false" aria-controls="protCollapseTwo">
                            El sistema no reconoce la cubeta o el cassette de gel
                        </button>
                    </h2>
                    <div id="protCollapseTwo" className="accordion-collapse collapse" aria-labelledby="protHeadingTwo" data-bs-parent="#proteinogramaFaqAccordion">
                        <div className="accordion-body small bg-light">
                            <strong>Acciones:</strong> 1. Verificar la posición del cassette y que esté libre de residuos. 2. Si usa RFID o código de barras, asegurarse de que el lector esté limpio y que la etiqueta no esté dañada. 3. Reiniciar el módulo de aplicación si es necesario.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProteinogramaDetail;