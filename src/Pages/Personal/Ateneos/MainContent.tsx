// src/Pages/MainContent/MainContent.tsx (VERSION FINAL CORREGIDA)

import React, { useEffect,  useRef } from 'react'; // Importar useRef
import { logActivity } from '../../../components/ActivityLog.tsx'; // Importar la función de log

interface MainContentProps {
    userId: string;
}

const MainContent: React.FC<MainContentProps> = ({ userId }) => {
    // 🟢 CORRECCIÓN: Usamos useRef para guardar el flag de ejecución
    const hasLoggedInRef = useRef(false);

    useEffect(() => {
        // Ejecutar el log de actividad solo una vez por sesión, cuando el userId es válido.
        // Verificamos si el userId es válido Y si el flag en el ref es falso
        if (userId && userId !== 'Invitado' && !hasLoggedInRef.current) {
            
            logActivity(userId, 'LOGIN', 'Usuario accedió a la página principal de LabWiki.');
            
            // Marcamos el flag como true. Esto NO dispara un re-render.
            hasLoggedInRef.current = true;
        }
    // El array de dependencias ahora solo necesita userId.
    }, [userId]); 

    return (
        <div className="container mt-4">
            <header className="bg-primary text-white p-5 rounded-lg shadow-xl mb-5">
                <h1 className="display-4 fw-bold">Bienvenido a LabWiki</h1>
                <p className="lead">
                    El sistema centralizado para el personal del laboratorio. Aquí gestionamos la comunicación, documentación y los resultados de los pacientes.
                </p>
                {userId === 'Invitado' ? (
                    <div className="alert alert-warning mt-4 p-3 fw-bold text-dark">
                        Estás navegando como invitado. Inicia sesión para usar el Chat y ver tu Historial Personal.
                    </div>
                ) : (
                    <p className="text-white mt-4 fw-bold">
                        Tu sesión ({userId}) ha sido registrada en el Log de Actividades.
                    </p>
                )}
            </header>

            <div className="row g-4">

                {/* Tarjeta de Acceso Rápido: Área Personal */}
                <div className="col-md-6">
                    <div className="card h-100 shadow-md border-top border-4 border-success">
                        <div className="card-body">
                            <h5 className="card-title fw-bold text-success">
                                💬 Comunicación y Log
                            </h5>
                            <p className="card-text">
                                Accede al chat grupal para comunicarte con el equipo y revisa tu historial de actividades personales.
                            </p>
                            <a href="/personal" className="btn btn-outline-success fw-bold">
                                Ir al Área Personal ➡️
                            </a>
                        </div>
                    </div>
                </div>

                {/* Tarjeta de Acceso Rápido: Área Pacientes */}
                <div className="col-md-6">
                    <div className="card h-100 shadow-md border-top border-4 border-info">
                        <div className="card-body">
                            <h5 className="card-title fw-bold text-info">
                                🩺 Gestión de Pacientes
                            </h5>
                            <p className="card-text">
                                Administra los perfiles de pacientes, carga de resultados y protocolos de pruebas médicas.
                            </p>
                            <a href="/pacientes" className="btn btn-outline-info fw-bold">
                                Ir al Área Pacientes ➡️
                            </a>
                        </div>
                    </div>
                </div>

                {/* Tarjeta de Documentación */}
                <div className="col-md-6">
                    <div className="card h-100 shadow-md border-top border-4 border-secondary">
                        <div className="card-body">
                            <h5 className="card-title fw-bold text-secondary">
                                📚 Manuales y Protocolos
                            </h5>
                            <p className="card-text">
                                Consulta la documentación oficial del laboratorio y las guías de procedimientos estandarizados.
                            </p>
                            <button className="btn btn-outline-secondary fw-bold" disabled>
                                Ver Documentación (Próximamente)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tarjeta de Resultados */}
                <div className="col-md-6">
                    <div className="card h-100 shadow-md border-top border-4 border-warning">
                        <div className="card-body">
                            <h5 className="card-title fw-bold text-warning">
                                📊 Portal de Resultados
                            </h5>
                            <p className="card-text">
                                Genera y consulta los informes finales para los médicos y los pacientes.
                            </p>
                            <a href="/portal-resultados" className="btn btn-outline-warning fw-bold">
                                Acceder al Portal ➡️
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="mt-5 text-center text-muted border-top pt-3">
                <small>&copy; {new Date().getFullYear()} LabWiki. Desarrollado con React y Firebase.</small>
            </footer>
        </div>
    );
};

export default MainContent;