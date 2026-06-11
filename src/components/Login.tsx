// src/components/LoginPresentacional.tsx
import React, { useState } from 'react';
import appFirebase from '../Credenciales';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'; 
import { getFirestore, doc, setDoc } from 'firebase/firestore'; 
import { useNavigate } from 'react-router-dom';

const auth = getAuth(appFirebase);
const db = getFirestore(appFirebase); 

const LoginPresentacional: React.FC = () => {
    const navigate = useNavigate();
    
    const [isRegistering, setIsRegistering] = useState(false); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState(''); 
    const [servicio, setServicio] = useState(''); 
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const SERVICIOS_LAB = [
        "Anatomía Patológica", "Cardio", "Cirugía", "Clínica Medica", "Dermatología",
        "Endocrinología", "Farmacia", "Gastroenterología", "Ginecología / Obstetricia",
        "Hematología", "Hemoterapia", "Infectología", "Inmunología", "Kinesiología",
        "Laboratorio Central", "Medicina Nuclear", "Nefrología", "Neurología",
        "Oftalmología", "Otorrinolaringología", "Parasitología", "Pediatría",
        "Plástica", "Reumatología", "Salud Mental", "Traumatología", "UCO", "Urología", "UTI"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        setError(''); 
        setLoading(true);
        
        if (isRegistering) {
            if (!nombre.trim()) {
                setError("Por favor, ingresa tu nombre y apellido.");
                setLoading(false);
                return;
            }
            if (!servicio) {
                setError("Por favor, selecciona el servicio al que perteneces.");
                setLoading(false);
                return;
            }
        }
        
        try {
            if (isRegistering) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await updateProfile(user, {
                    displayName: nombre.trim()
                });

                await setDoc(doc(db, 'usuarios', user.uid), {
                    nombre: nombre.trim(),
                    email: user.email,
                    servicio: servicio,
                    role: "operador",
                    createdAt: new Date()
                });

                navigate("/", { replace: true });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                navigate("/", { replace: true });
            }
        } catch (err: any) {
            console.error("Error de autenticación:", err);
            let errorMessage = "Ocurrió un error. Por favor intenta de nuevo.";
            
            if (isRegistering) {
                if (err.code === 'auth/email-already-in-use') {
                    errorMessage = "Este correo electrónico ya está registrado.";
                } else if (err.code === 'auth/weak-password') {
                    errorMessage = "La contraseña es muy débil (mínimo 6 caracteres).";
                } else if (err.code === 'auth/invalid-email') {
                    errorMessage = "El formato del correo electrónico no es válido.";
                }
            } else {
                if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                    errorMessage = "Credenciales inválidas. Verifica tu correo y contraseña.";
                } else if (err.code === 'auth/too-many-requests') {
                    errorMessage = "Demasiados intentos. Intenta más tarde.";
                }
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const loginAsGuest = async () => {
        setError('');
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, "testuser@testuser.com", "password123");
            navigate("/", { replace: true });
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
                    <h3 className="text-center text-primary fw-bold mb-2">Lab Ramos Mejía</h3>
                    <p className="text-center text-muted small mb-4">
                        {isRegistering ? 'Crear Nueva Cuenta Personal' : 'Gestión Interna de Laboratorio'}
                    </p>

                    {error && <div className="alert alert-danger py-2 text-center small">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {isRegistering && (
                            <div className="mb-3 animate__animated animate__fadeIn">
                                <label className="form-label fw-bold small">Nombre y Apellido</label>
                                <input
                                    type="text"
                                    className="form-control shadow-sm"
                                    placeholder='Ej: Juan Pérez'
                                    onChange={(e) => setNombre(e.target.value)}
                                    value={nombre}
                                    required={isRegistering}
                                    disabled={loading}
                                />
                            </div>
                        )}

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
                        <div className="mb-3">
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

                        {isRegistering && (
                            <div className="mb-4 animate__animated animate__fadeIn">
                                <label className="form-label fw-bold small">Servicio / Sector Asignado</label>
                                <select
                                    className="form-select shadow-sm"
                                    value={servicio}
                                    onChange={(e) => setServicio(e.target.value)}
                                    required={isRegistering}
                                    disabled={loading}
                                >
                                    <option value="" disabled>-- Selecciona un servicio --</option>
                                    {SERVICIOS_LAB.map((srv) => (
                                        <option key={srv} value={srv}>{srv}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className={`btn ${isRegistering ? 'btn-success' : 'btn-primary'} w-100 fw-bold mb-3 shadow-sm`}
                            disabled={loading}
                        >
                            {loading ? 'Cargando...' : isRegistering ? 'Registrarse y Entrar' : 'Ingresar'}
                        </button>
                    </form>

                    <div className="position-relative my-4">
                        <hr />
                        <span className="position-absolute top-50 start-50 translate-middle px-2 bg-white text-muted small">o</span>
                    </div>

                    <button 
                        type="button" 
                        className={`btn ${isRegistering ? 'btn-outline-primary' : 'btn-outline-success'} w-100 fw-bold mb-1 shadow-sm`}
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setError('');
                            setNombre('');
                            setServicio('');
                        }}
                        disabled={loading}
                    >
                        {isRegistering ? 'Volver al Inicio de Sesión' : 'Crear Cuenta'}
                    </button>

                    {!isRegistering && (
                        <div className="text-center mt-2 border-top pt-2">
                            <button
                                type="button"
                                className="btn btn-link p-0 text-decoration-none small fw-bold text-secondary"
                                onClick={loginAsGuest}
                                disabled={loading}
                            >
                                Acceso Visitante (Demo)
                            </button>
                        </div>
                    )}

                    {/* SECCIÓN NUEVA: Estructura de Tooltips instantáneos */}
                    <div className="d-flex justify-content-center gap-3 mt-3 pt-2 border-top">
                        <div className="position-relative project-tooltip-container">
                            <button type="button" className="btn btn-link p-0 text-decoration-none text-muted" style={{ fontSize: '0.75rem' }}>
                                Términos y condiciones
                            </button>
                            <div className="project-tooltip-text">
                                Esta aplicación es de uso exclusivo interno del Hospital Ramos Mejía. Los datos solicitados son mínimos y se gestionan con absoluta confidencialidad para la identificación de los operadores del laboratorio.
                            </div>
                        </div>

                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>|</span>

                        <div className="position-relative project-tooltip-container">
                            <button type="button" className="btn btn-link p-0 text-decoration-none text-muted" style={{ fontSize: '0.75rem' }}>
                                Políticas de privacidad
                            </button>
                            <div className="project-tooltip-text">
                                Garantizamos que la información recolectada es estrictamente la mínima necesaria (Nombre, Email y Sector) para el correcto funcionamiento del sistema interno hospitalario.
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default LoginPresentacional;