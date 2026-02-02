// src/Pages/AreaPacientes.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, BookOpen, Newspaper, ClipboardList } from 'lucide-react'; 

// --- Tipos para la Orden Médica ---
interface Estudio {
    id: string;
    nombre: string;
    ayuno: number;
    indicacionEspecial?: string;
}

const LISTA_ESTUDIOS: Estudio[] = [
    { id: 'hepato', nombre: 'Hepatograma', ayuno: 8 },
    { id: 'iono', nombre: 'Ionograma', ayuno: 8 },
    { id: 'gluc', nombre: 'Glucemia', ayuno: 12 },
    { id: 'perfil', nombre: 'Perfil Lipídico', ayuno: 12 },
    { id: 'ori24', nombre: 'Orina 24 hs', ayuno: 0, indicacionEspecial: 'Retirar frasco con conservante en el laboratorio antes de empezar.' },
    { id: 'oriComp', nombre: 'Orina Completa', ayuno: 0, indicacionEspecial: 'Traer la primera orina de la mañana en frasco estéril.' },
];

// --- Componentes Hijos ---

const MiOrdenMedica: React.FC = () => {
    const [seleccionados, setSeleccionados] = useState<string[]>([]);
    const [resultado, setResultado] = useState({ ayuno: 0, notas: [] as string[] });

    useEffect(() => {
        const elegidos = LISTA_ESTUDIOS.filter(e => seleccionados.includes(e.id));
        const ayunoMax = elegidos.length > 0 ? Math.max(...elegidos.map(e => e.ayuno)) : 0;
        const notasEsp = elegidos.filter(e => e.indicacionEspecial).map(e => e.indicacionEspecial!);
        setResultado({ ayuno: ayunoMax, notas: notasEsp });
    }, [seleccionados]);

    const toggleEstudio = (id: string) => {
        setSeleccionados(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    return (
        <div className="p-4">
            <h3 className="text-primary mb-3"><ClipboardList className="me-2" size={24} /> Mi Orden Médica</h3>
            <p className="text-muted">Seleccione los análisis que figuran en su orden para conocer su preparación:</p>
            
            <div className="row g-3 mb-4">
                {LISTA_ESTUDIOS.map(estudio => (
                    <div key={estudio.id} className="col-md-6 col-lg-4">
                        <div 
                            onClick={() => toggleEstudio(estudio.id)}
                            style={{ cursor: 'pointer' }}
                            className={`p-3 border rounded shadow-sm transition-all ${seleccionados.includes(estudio.id) ? 'border-primary bg-primary bg-opacity-10' : 'bg-white'}`}
                        >
                            <div className="form-check m-0">
                                <input className="form-check-input" type="checkbox" checked={seleccionados.includes(estudio.id)} readOnly />
                                <label className="form-check-label fw-bold">{estudio.nombre}</label>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {seleccionados.length > 0 && (
                <div className="alert alert-primary shadow-sm border-0">
                    <h5 className="alert-heading fw-bold">🚩 Instrucciones de Preparación:</h5>
                    <hr />
                    <p className="mb-2"><strong>Ayuno requerido:</strong> {resultado.ayuno} horas.</p>
                    {resultado.notas.length > 0 && (
                        <div className="mt-2">
                            <strong>Notas adicionales:</strong>
                            <ul className="mb-0">
                                {resultado.notas.map((nota, i) => <li key={i}>{nota}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ... (InstructivoMuestras, DescripcionAnalisis y Novedades se mantienen igual que en tu código)
const InstructivoMuestras: React.FC = () => (
    <div className="p-4">
        <h3 className="text-primary mb-3"><FlaskConical className="me-2" size={24} /> Instrucciones para Muestras</h3>
        <p className="lead">Guías detalladas sobre cómo preparar y recolectar diferentes tipos de muestras.</p>
        <ul className="list-group list-group-flush">
            <li className="list-group-item">Guía de recolección de orina de 24 horas.</li>
            <li className="list-group-item">Protocolo para muestras de heces.</li>
        </ul>
    </div>
);

const DescripcionAnalisis: React.FC = () => (
    <div className="p-4">
        <h3 className="text-primary mb-3"><BookOpen className="me-2" size={24} /> Descripción de Análisis</h3>
        <p className="lead">Consulte el glosario de los análisis disponibles en el laboratorio.</p>
        <div className="accordion" id="acordeonAnalisis">
            <div className="accordion-item">
                <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseUno">
                        Hemograma Completo
                    </button>
                </h2>
                <div id="collapseUno" className="accordion-collapse collapse" data-bs-parent="#acordeonAnalisis">
                    <div className="accordion-body">Mide glóbulos rojos, blancos y plaquetas.</div>
                </div>
            </div>
        </div>
    </div>
);

const Novedades: React.FC = () => (
    <div className="p-4">
        <h3 className="text-primary mb-3"><Newspaper className="me-2" size={24} /> Novedades y Anuncios</h3>
        <ul className="list-group list-group-flush">
            <li className="list-group-item">Nuevo equipamiento tecnológico incorporado.</li>
        </ul>
    </div>
);

// --- Componente Principal ---

const AreaPacientes: React.FC = () => {
    // Agregamos 'orden' como opción de pestaña activa
    const [activeTab, setActiveTab] = useState<'muestras' | 'analisis' | 'novedades' | 'orden'>('orden');

    const renderContent = () => {
        switch (activeTab) {
            case 'orden': return <MiOrdenMedica />;
            case 'muestras': return <InstructivoMuestras />;
            case 'analisis': return <DescripcionAnalisis />;
            case 'novedades': return <Novedades />;
            default: return <MiOrdenMedica />;
        }
    };

    return (
        <div className="container my-5">
            <header className="mb-4">
                <h1 className="fw-bold text-success">Portal de Pacientes</h1>
                <p className="text-secondary">Información relevante para su visita y resultados.</p>
            </header>

            <nav className="nav nav-tabs mb-4">
                <a 
                    className={`nav-link d-flex align-items-center ${activeTab === 'orden' ? 'active bg-light-subtle fw-bold' : ''}`}
                    href="#" 
                    onClick={(e) => { e.preventDefault(); setActiveTab('orden'); }}
                >
                    <ClipboardList size={18} className="me-2" /> Mi Orden Médica
                </a>

                <a 
                    className={`nav-link d-flex align-items-center ${activeTab === 'muestras' ? 'active bg-light-subtle' : ''}`}
                    href="#" 
                    onClick={(e) => { e.preventDefault(); setActiveTab('muestras'); }}
                >
                    <FlaskConical size={18} className="me-2" /> Instructivos
                </a>

                <a 
                    className={`nav-link d-flex align-items-center ${activeTab === 'analisis' ? 'active bg-light-subtle' : ''}`}
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab('analisis'); }}
                >
                    <BookOpen size={18} className="me-2" /> Glosario
                </a>

                <a 
                    className={`nav-link d-flex align-items-center ${activeTab === 'novedades' ? 'active bg-light-subtle' : ''}`}
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab('novedades'); }}
                >
                    <Newspaper size={18} className="me-2" /> Novedades
                </a>
                
                <Link to="/" className="nav-link text-secondary ms-auto">Volver</Link>
            </nav>

            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="card-body p-0">
                    {renderContent()}
                </div>
            </div>

            <footer className="text-center mt-5 text-muted small">
                Este portal es informativo. Ante la duda, respete las indicaciones dadas por su médico.
            </footer>
        </div>
    );
};

export default AreaPacientes;