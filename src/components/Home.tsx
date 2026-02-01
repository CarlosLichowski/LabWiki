// src/components/Home.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { User, HeartPulse, ArrowRight } from 'lucide-react'; // Iconos de Lucide React

const Home: React.FC = () => {
    return (
        <div className="container my-5">
            <header className="text-center mb-5">
                <h1 className="display-4 fw-bold text-primary">
                    Bienvenido a LabWiki
                </h1>
                <p className="lead text-secondary">
                     accede a recursos y gestión interna.
                </p>
            </header>

                            {/* --------------------------- */}
                {/* 1. Card: Área Pacientes */}
                {/* --------------------------- */}

            <div className="row g-4 justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-lg h-100 border-0 home-card-pacientes">
                        <div className="card-body p-4 d-flex flex-column">
                            <HeartPulse className="text-success mb-3" size={48} />
                            
                            <h2 className="card-title fw-bold text-success">Área de Pacientes</h2>
                            <p className="card-text text-muted mb-4 flex-grow-1">
                                Si eres un paciente, utiliza este portal para consultar tus resultados de análisis, historial médico y acceder a información relevante sobre tu salud y los servicios ofrecidos por nuestro laboratorio.
                            </p>
                            
                            <Link 
                                to="/pacientes" 
                                className="btn btn-success btn-lg mt-auto d-flex align-items-center justify-content-between"
                            >
                                Ingresar al Area Pacientes <ArrowRight size={20} className="ms-2" />
                            </Link>
                        </div>
                    </div>
                </div>
                {/* --------------------------- */}
                {/* 2. Card: Área Personal (Empleados) */}
                {/* --------------------------- */}
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-lg h-100 border-0 home-card-personal">
                        <div className="card-body p-4 d-flex flex-column">
                            <User className="text-info mb-3" size={48} />
                            
                            <h2 className="card-title fw-bold text-info">Área Personal</h2>
                            <p className="card-text text-muted mb-4 flex-grow-1">
                                Este es el acceso exclusivo para el personal del laboratorio. Aquí podrás gestionar manuales de equipos, acceder a procedimientos operativos, analizar la documentación de ateneos y revisar tu actividad interna.
                            </p>
                            
                            <Link 
                                to="/personal" 
                                className="btn btn-info btn-lg mt-auto d-flex align-items-center justify-content-between"
                            >
                                Ingresar al Panel Personal <ArrowRight size={20} className="ms-2" />
                            </Link>
                        </div>
                    </div>
                </div>


                
            </div>
        </div>
    );
}

export default Home;