import React, { useState, useMemo } from 'react';
// Importamos los datos del JSON
import procedimientosData from '../data/procedimientosData.json';

// Definiciones de tipos para asegurar la consistencia
interface Analisis {
    nombre: string;
    codigo: string;
    descripcionCorta: string;
    metodologia: string;
    requerimientos: string;
    enlaceDocumento: string;
}

interface Area {
    area: string;
    analisis: Analisis[];
}

const allAnalisis = procedimientosData.flatMap((area: Area) => 
    area.analisis.map(a => ({ ...a, area: area.area }))
);

const AnalisisProcedimientos: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedArea, setSelectedArea] = useState('Todos');

    // Nombres únicos de las áreas para el filtro
    const areas = useMemo(() => ['Todos', ...procedimientosData.map(a => a.area)], []);

    // Lógica de filtrado y búsqueda
    const filteredAnalisis = useMemo(() => {
        let results = allAnalisis;
        
        // 1. Filtrar por Área
        if (selectedArea !== 'Todos') {
            results = results.filter(a => a.area === selectedArea);
        }

        // 2. Filtrar por Término de Búsqueda
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            results = results.filter(a => 
                a.nombre.toLowerCase().includes(lowerCaseSearch) ||
                a.codigo.toLowerCase().includes(lowerCaseSearch) ||
                a.descripcionCorta.toLowerCase().includes(lowerCaseSearch)
            );
        }

        return results;
    }, [searchTerm, selectedArea]);


    return (
        <div className="p-0">
            <h2 className="mb-4 fw-light text-secondary">
                🔍 Manual de Análisis y Procedimientos
            </h2>

            {/* Controles de Filtrado y Búsqueda */}
            <div className="bg-light p-3 mb-4 rounded shadow-sm d-flex gap-3 align-items-center flex-wrap">
                
                {/* Búsqueda */}
                <div className="flex-grow-1">
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Buscar por nombre, código o descripción..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {/* Filtro por Área */}
                <div className="d-flex align-items-center">
                    <label className="me-2 text-muted fw-medium small text-nowrap">Área:</label>
                    <select 
                        className="form-select form-select-sm" 
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                        style={{ minWidth: '150px' }}
                    >
                        {areas.map(area => (
                            <option key={area} value={area}>{area}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Resultado de la Búsqueda / Listado */}
            <h4 className="fw-bold text-success mb-3">
                Resultados ({filteredAnalisis.length})
            </h4>

            {filteredAnalisis.length === 0 ? (
                <div className="alert alert-warning text-center">
                    No se encontraron análisis o procedimientos que coincidan con los criterios de búsqueda.
                </div>
            ) : (
                <div className="row g-4">
                    {filteredAnalisis.map((analisis, index) => (
                        <div className="col-md-6" key={index}>
                            <div className="card h-100 border-start border-4 border-success shadow-sm">
                                <div className="card-body">
                                    <span className="badge bg-success mb-2">{analisis.area}</span>
                                    <h5 className="card-title fw-bold">{analisis.nombre}</h5>
                                    <p className="card-text small text-muted">{analisis.descripcionCorta}</p>
                                    
                                    <ul className="list-unstyled small mt-3">
                                        <li><strong className="text-primary">Código:</strong> {analisis.codigo}</li>
                                        <li><strong>Metodología:</strong> {analisis.metodologia}</li>
                                        <li><strong>Requerimientos:</strong> {analisis.requerimientos}</li>
                                    </ul>
                                </div>
                                <div className="card-footer bg-white border-0 pt-0">
                                    <a 
                                        href={analisis.enlaceDocumento} 
                                        className="btn btn-sm btn-outline-success" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                    >
                                        <i className="bi bi-file-earmark-pdf me-1"></i> Ver POE Completo
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <hr className="my-5" />

            {/* Sugerencia de Diagrama de Flujo (Si se requiere) */}
            <h4 className="fw-bold text-secondary mb-3">
                Flujograma de Procesamiento
            </h4>
            <div className="p-3 bg-light rounded text-center">
                <p className="text-muted">
                    Para visualizar el proceso general de recepción y procesamiento de muestras:
                </p>
                
            </div>


        </div>
    );
};

export default AnalisisProcedimientos;