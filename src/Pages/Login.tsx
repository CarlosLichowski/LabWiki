import React, { useState } from 'react';
import appFirebase from '../Credenciales';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; 
import { useNavigate } from 'react-router-dom';
import { FileText, Beaker } from 'lucide-react';
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
            setError("El acceso sin cuenta no está disponible en este momento.");
            setLoading(false);
        }
    };

    return (
        <div className="login-screen">
            <div className="login-card" style={{ maxWidth: '440px' }}>
                <main className="login-card-content">
                    <h1 className="login-title" style={{ fontSize: '1.8rem', margin: '0 0 0.25rem 0' }}>Lab Ramos</h1>
                    <p className="login-subtitle" style={{ marginBottom: '1.5rem' }}>Gestión de Laboratorio</p>

                    {error && <div className="alert-error" role="alert">{error}</div>}

                    {/* 🚀 ACCESOS RÁPIDOS (SIN AUTENTICACIÓN) */}
                    <div className="quick-access-box" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Consultas Rápidas
                        </span>
                        
                        <button 
                            type="button" 
                            className="btn-quick-access" 
                            onClick={() => navigate('/derivaciones')}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                padding: '10px 16px', background: '#e0f2fe', color: '#0369a1',
                                border: '1px solid #bae6fd', borderRadius: '8px', fontWeight: 600,
                                cursor: 'pointer', fontSize: '0.88rem'
                            }}
                        >
                            <Beaker size={16} /> Ver Derivaciones
                        </button>

                        <button 
                            type="button" 
                            className="btn-quick-access" 
                            onClick={() => navigate('/Insertos')}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                padding: '10px 16px', background: '#f0fdf4', color: '#15803d',
                                border: '1px solid #bbf7d0', borderRadius: '8px', fontWeight: 600,
                                cursor: 'pointer', fontSize: '0.88rem'
                            }}
                        >
                            <FileText size={16} /> Determianciones en Laboratorio
                        </button>
                    </div>

                    <div className="divider-container" style={{ margin: '1rem 0' }}>
                        <hr className="divider-line" />
                        <span className="divider-text">o ingresa al sistema</span>
                        <hr className="divider-line" />
                    </div>

                    {/* 🔐 FORMULARIO DE LOGIN */}
                    <form onSubmit={handleSubmit}>
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

                    <div className="divider-container" style={{ margin: '1.25rem 0 0.75rem 0' }}>
                        <hr className="divider-line" />
                        <span className="divider-text">o</span>
                        <hr className="divider-line" />
                    </div>

                    {/* 👤 BOTÓN DEBAJO DEL LOGIN: ACCEDER SIN CUENTA */}
                    <div className="center-wrapper" style={{ marginTop: '0.5rem' }}>
                        <button
                            type="button"
                            className="btn-link-demo"
                            onClick={loginAsGuest}
                            disabled={loading}
                            style={{ 
                                background: 'transparent', border: 'none', color: '#2563eb', 
                                fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' 
                            }}
                        >
                            Acceder sin cuenta (Modo Demo)
                        </button>
                    </div>

                    {/* Footer Legal */}
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