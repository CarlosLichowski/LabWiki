import React, { useState } from 'react';
import appFirebase from '../Credenciales';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; 
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';

const auth = getAuth(appFirebase);

const LoginPresentacional: React.FC = () => {
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        
        if (loading) return; 

        setError(''); 
        setLoading(true);
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/", { replace: true });
        } catch (err: any) {
            console.error("Error de autenticación:", err);
            let errorMessage = "Ocurrió un error. Por favor intenta de nuevo.";
            
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                errorMessage = "Credenciales inválidas. Verifica tu correo y contraseña.";
            } else if (err.code === 'auth/too-many-requests') {
                errorMessage = "Demasiados intentos erróneos. Intenta más tarde.";
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = "El formato del correo electrónico no es válido.";
            }
            
            setError(errorMessage);
            setLoading(false); 
        }
    };

    const loginAsGuest = async () => {
        if (loading) return;
        setError('');
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, "testuser@testuser.com", "password123");
            navigate("/", { replace: true });
        } catch (err: any) {
            setError("El acceso de invitado no está disponible en este momento.");
            setLoading(false);
        }
    };

    return (
        <div className="login-screen">
            <div className="login-card">
                <main className="login-card-content">
                    <h1 className="login-title" style={{ fontSize: '1.8rem', margin: '0 0 0.25rem 0' }}>Lab Ramos Mejía</h1>
                    <p className="login-subtitle">Gestión Interna de Laboratorio</p>

                    {error && <div className="alert-error" role="alert">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {/* Campo: Email */}
                        <div className="form-group">
                            <label htmlFor="login-email" className="form-label">Email</label>
                            <input
                                id="login-email"
                                type="email"
                                className="form-input"
                                placeholder="ejemplo@correo.com"
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        {/* Campo: Contraseña */}
                        <div className="form-group">
                            <label htmlFor="login-password" className="form-label">Contraseña</label>
                            <input
                                id="login-password"
                                type="password"
                                className="form-input"
                                placeholder="Ingrese Contraseña"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Botón de Envío */}
                        <button 
                            type="submit" 
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-inline"></span>
                                    <span>Ingresando...</span>
                                </>
                            ) : (
                                'Ingresar'
                            )}
                        </button>
                    </form>

                    <div className="divider-container">
                        <hr className="divider-line" />
                        <span className="divider-text">o</span>
                    </div>

                    <div className="center-wrapper">
                        <button
                            type="button"
                            className="btn-link-demo"
                            onClick={loginAsGuest}
                            disabled={loading}
                        >
                            Acceso Visitante (Demo)
                        </button>
                    </div>

                    {/* Footer Legal con Tooltips */}
                    <footer className="login-footer">
                        <div className="project-tooltip-container">
                            <button type="button" className="btn-footer-link" disabled={loading}>
                                Términos y condiciones
                            </button>
                            <div className="project-tooltip-text">
                                Esta aplicación es de uso exclusivo interno del Hospital Ramos Mejía. Los datos solicitados son mínimos y se gestionan con absoluta confidencialidad para la identificación de los operadores del laboratorio.
                            </div>
                        </div>

                        <span className="footer-separator">|</span>

                        <div className="project-tooltip-container">
                            <button type="button" className="btn-footer-link" disabled={loading}>
                                Políticas de privacidad
                            </button>
                            <div className="project-tooltip-text">
                                La información recolectada es estrictamente la mínima necesaria (Nombre, Email y Sector) para el correcto funcionamiento del sistema interno hospitalario.
                            </div>
                        </div>
                    </footer>

                </main>
            </div>
        </div>
    );
};

export default LoginPresentacional;