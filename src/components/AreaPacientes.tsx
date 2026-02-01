// src/Pages/AreaPacientes.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, BookOpen, Newspaper } from 'lucide-react'; 

// --- Componentes Hijos de las Pestañas (Simulados) ---

const InstructivoMuestras: React.FC = () => (
    <div className="p-4">
        <h3 className="text-primary mb-3"><FlaskConical className="me-2" size={24} /> Instrucciones para Muestras</h3>
        <p className="lead">Aquí encontrará guías detalladas sobre cómo preparar y recolectar diferentes tipos de muestras (orina, heces, saliva, etc.) para asegurar la precisión de su análisis.</p>
        
        <ul className="list-group">
            <li className="list-group-item">Guía de recolección de orina de 24 horas.</li>
            <li className="list-group-item">Preparación para análisis de sangre en ayunas (8 a 12 horas).</li>
            <li className="list-group-item">Protocolo para muestras de heces.</li>
            <li className="list-group-item text-info">Descargue el PDF completo aquí.</li>
        </ul>
    </div>
);

const DescripcionAnalisis: React.FC = () => (
    <div className="p-4">
        <h3 className="text-primary mb-3"><BookOpen className="me-2" size={24} /> Descripción de Análisis</h3>
        <p className="lead">Consulte el glosario de los análisis disponibles en el laboratorio. Entienda qué mide cada prueba y cuáles son los valores de referencia.</p>
        
        {/* Usando el componente Accordion de Bootstrap */}
        <div className="accordion" id="acordeonAnalisis">
            <div className="accordion-item">
                <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseUno" aria-expanded="false" aria-controls="collapseUno">
                        Hemograma Completo
                    </button>
                </h2>
                <div id="collapseUno" className="accordion-collapse collapse" data-bs-parent="#acordeonAnalisis">
                    <div className="accordion-body">
                        Mide la cantidad y calidad de los glóbulos rojos, blancos y plaquetas en la sangre. Utilizado para diagnosticar anemia, infecciones y otros trastornos sanguíneos.
                    </div>
                </div>
            </div>
            {/* Puedes añadir más ítems de acordeón aquí */}
        </div>
    </div>
);

const Novedades: React.FC = () => (
    <div className="p-4">
        <h3 className="text-primary mb-3"><Newspaper className="me-2" size={24} /> Novedades y Anuncios</h3>
        <p className="lead">Manténgase informado sobre cambios de horario, incorporación de nuevos análisis o noticias relevantes sobre el laboratorio.</p>
        
        <ul className="list-group">
            <li className="list-group-item list-group-item-light">
                **01/12/2025:** ¡Nuevo horario de atención los sábados! (08:00 - 12:00 hs).
            </li>
            <li className="list-group-item list-group-item-light">
                **15/11/2025:** Incorporamos el análisis de Vitamina D de alta precisión.
            </li>
        </ul>
    </div>
);

// -----------------------------------------------------
// --- Componente Principal: AreaPacientes ---
// -----------------------------------------------------

const AreaPacientes: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'muestras' | 'analisis' | 'novedades'>('muestras');

    const renderContent = () => {
        switch (activeTab) {
            case 'muestras':
                return <InstructivoMuestras />;
            case 'analisis':
                return <DescripcionAnalisis />;
            case 'novedades':
                return <Novedades />;
            default:
                return <InstructivoMuestras />;
        }
    };

    return (
        <div className="container my-5">
            <header className="mb-4">
                <h1 className="fw-bold text-success">
                    Portal de Pacientes
                </h1>
                <p className="text-secondary">Información relevante para su visita y resultados.</p>
            </header>

            {/* 🟢 Navegación por Pestañas (NAV de Bootstrap) */}
            <nav className="nav nav-tabs mb-4">
                
                {/* Pestaña: Instructivo para Juntar Muestras */}
                <a 
                    className={`nav-link d-flex align-items-center ${activeTab === 'muestras' ? 'active bg-light-subtle' : ''}`}
                    href="#" // Usamos href="#" y prevenimos el default, o simplemente onClick
                    onClick={(e) => { e.preventDefault(); setActiveTab('muestras'); }}
                >
                    <FlaskConical size={18} className="me-2" /> Instructivos de Muestras
                </a>

                {/* Pestaña: Descripción de Análisis */}
                <a 
                    className={`nav-link d-flex align-items-center ${activeTab === 'analisis' ? 'active bg-light-subtle' : ''}`}
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab('analisis'); }}
                >
                    <BookOpen size={18} className="me-2" /> Descripción de Análisis
                </a>

                {/* Pestaña: Novedades */}
                <a 
                    className={`nav-link d-flex align-items-center ${activeTab === 'novedades' ? 'active bg-light-subtle' : ''}`}
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab('novedades'); }}
                >
                    <Newspaper size={18} className="me-2" /> Novedades
                </a>
                
                {/* Enlace para volver al inicio */}
                <Link to="/" className="nav-link text-secondary ms-auto">
                    Volver al Inicio
                </Link>
            </nav>

            {/* 🟢 Contenedor de Contenido (CARD de Bootstrap) */}
            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    {renderContent()}
                </div>
            </div>

            <footer className="text-center mt-5 text-muted">
                Para consultas urgentes, por favor contacte a recepción.
            </footer>
        </div>
    );
};

export default AreaPacientes;