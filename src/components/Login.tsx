// src/Components/LoginPresentacional.tsx
import React, { useState } from 'react';
import appFirebase from '../Credenciales';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; 
import { useNavigate } from 'react-router-dom';

const auth = getAuth(appFirebase);

const LoginPresentacional: React.FC = () => {
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // FUNCIÓN PARA LOGIN MANUAL
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        setError(''); 
        setLoading(true);
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/personal", { replace: true });
        } catch (err: any) {
            console.error("Error de autenticación:", err);
            let errorMessage = "Error al iniciar sesión. Verifica tus credenciales.";
            
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                errorMessage = "Credenciales inválidas. Solo cuentas autorizadas pueden acceder.";
            } else if (err.code === 'auth/too-many-requests') {
                errorMessage = "Demasiados intentos. Intenta más tarde.";
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // FUNCIÓN PARA ACCESO COMO INVITADO (DEMO)
    const loginAsGuest = async () => {
        setError('');
        setLoading(true);
        try {
            // Asegurate de crear este usuario en Firebase Auth con esta contraseña
            await signInWithEmailAndPassword(auth, "testuser@testuser.com", "password123");
            navigate("/personal", { replace: true });
        } catch (err: any) {
            setError("El acceso de invitado no está disponible en este momento.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{ 
                minHeight: '100vh', 
                backgroundColor: '#f8f9fa',
                backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' 
            }}
        >
            <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%', borderRadius: '15px' }}>
                <div className="p-2">
                    <h3 className="text-center text-primary fw-bold mb-2">
                        Lab Ramos Mejía
                    </h3>
                    <p className="text-center text-muted small mb-4">Gestión Interna de Laboratorio</p>

                    {error && (
                        <div className="alert alert-danger py-2 text-center small" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-bold small">Email Institucional</label>
                            <input
                                type="email"
                                className="form-control shadow-sm"
                                placeholder='ejemplo@correo.com'
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label fw-bold small">Contraseña</label>
                            <input
                                type="password"
                                className="form-control shadow-sm"
                                placeholder='••••••••'
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                required
                                disabled={loading}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary w-100 fw-bold mb-3 shadow-sm"
                            disabled={loading}
                        >
                            {loading ? 'Cargando...' : 'Ingresar'}
                        </button>
                    </form>

                    <div className="position-relative my-4">
                        <hr />
                        <span className="position-absolute top-50 start-50 translate-middle px-2 bg-white text-muted small">
                            o
                        </span>
                    </div>

                    <button 
                        type="button" 
                        className="btn btn-outline-secondary w-100 fw-bold mb-4 shadow-sm"
                        onClick={loginAsGuest}
                        disabled={loading}
                    >
                        Acceso Visitante (Demo)
                    </button>

                    <div className="text-center border-top pt-3">
                        <p className="text-danger fw-bold small mb-0">
                            <i className="bi bi-exclamation-triangle-fill me-1"></i>
                            Uso exclusivo personal del hospital.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPresentacional;