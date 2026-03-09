// src/components/Header.tsx

import React, { useState } from 'react'; // 👈 Importamos useState
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext"; 

const Header: React.FC = () => {
    const { user, logout } = useAuth(); 
    
    // 🟢 ESTADO PARA MANEJAR LA VISIBILIDAD DEL MENÚ DESPLEGABLE
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const displayName = user?.displayName || user?.email?.split('@')[0] || "Usuario";
    
    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    // 🟢 Función para alternar el menú
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // 🟢 Opción de Menú Hamburguesa (Icono)
    const MenuIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
            <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
        </svg>
    );


    return (
        <header className="bg-primary text-white p-3 shadow-sm mb-4">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center">
                    
                    {/* 🟢 Título Principal (Link a Home) */}
                    <Link to="/" className="text-white text-decoration-none">
                        <h2 className="fw-bold mb-0">LabRamos</h2>
                    </Link>

                    <div className="d-flex align-items-center">
                        
                        {user ? (
                            // 🟢 IMPLEMENTACIÓN DEL DROPDOWN PERSONAL 
                            <div className="dropdown">
                                {/* 1. Botón (El ícono del perfil) */}
                                <button 
                                    className="btn btn-primary text-white dropdown-toggle d-flex align-items-center"
                                    type="button" 
                                    onClick={toggleMenu}
                                    aria-expanded={isMenuOpen}
                                >
                                    <span className="me-2 d-none d-sm-inline">Hola, {displayName}</span>
                                    {MenuIcon} 
                                </button>
                                
                                {/* 2. Menú Desplegable (Las Opciones Personales) */}
                                <ul 
                                    className={`dropdown-menu dropdown-menu-end ${isMenuOpen ? 'show' : ''}`}
                                    style={{ position: 'absolute' }} // Necesario para la posición
                                >
                                    <li className="dropdown-header">Hola, {displayName}</li>
                                    <li><hr className="dropdown-divider" /></li>

                                    {/* OPCIÓN: Favoritos Guardados (NUEVA) */}
                                    <li>
                                        <Link 
                                            to="/personal/favoritos" 
                                            className="dropdown-item" 
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            ⭐ Favoritos Guardados
                                        </Link>
                                    </li>

                                    {/* OPCIÓN: Área Personal (Mantenemos tu link original) */}
                                    <li>
                                        <Link 
                                            to="/personal" 
                                            className="dropdown-item"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            📋 Mi Área Personal
                                        </Link>
                                    </li>

                                    {/* OPCIÓN: Historial (NUEVA) */}
                                    <li>
                                        <Link 
                                            to="/personal/historial" 
                                            className="dropdown-item"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            🕒 Historial y Actividad
                                        </Link>
                                    </li>
                                    
                                    <li><hr className="dropdown-divider" /></li>

                                    {/* OPCIÓN: Configuración (NUEVA) */}
                                    <li>
                                        <Link 
                                            to="/personal/configuracion" 
                                            className="dropdown-item"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            ⚙️ Configuración de Cuenta
                                        </Link>
                                    </li>

                                    {/* OPCIÓN: Cerrar Sesión (Mantenemos tu función) */}
                                    <li>
                                        <button 
                                            onClick={handleLogout} 
                                            className="dropdown-item text-danger"
                                        >
                                            🔓 Cerrar Sesión
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            // 🟢 Si NO hay un usuario logueado
                            <Link
                                to="/login"
                                className="btn btn-light fw-bold px-3"
                            >
                                Acceder
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;