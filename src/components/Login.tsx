// src/Components/LoginPresentacional.tsx - CÓDIGO CORREGIDO

import React, { useState } from 'react';
import appFirebase from '../Credenciales';
// Solo necesitamos signInWithEmailAndPassword, eliminamos createUserWithEmailAndPassword
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; 
import { useNavigate } from 'react-router-dom';
// Eliminamos la importación de useAuth (ya que quitamos Google)

const auth = getAuth(appFirebase);

const LoginPresentacional: React.FC = () => {
    const navigate = useNavigate();
    
    // Eliminamos el estado 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // FUNCIÓN PRINCIPAL: Ahora solo maneja LOGIN
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        setError(''); 
        
        try {
            // Modo LOGIN
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Sesión iniciada con éxito.");
            
            // Redirección después de éxito
            navigate("/personal", { replace: true });

        } catch (err: any) {
            console.error("Error de autenticación:", err);
            
            let errorMessage = "Error al iniciar sesión. Verifica tus credenciales.";
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                errorMessage = "Credenciales inválidas. Solo cuentas pre-registradas pueden acceder.";
            }
            
            setError(errorMessage);
        }
    };
    
    // Eliminamos la función handleGoogleLogin (si no usas Google)

    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: '100vh' }}
        >
            <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="p-3">
                    {/* El título se simplifica a solo "Iniciar Sesión" */}
                    <h3 className="text-center text-primary fw-bold mb-4">
                        Iniciar Sesión
                    </h3>

                    {/* Mostrar mensaje de error si existe */}
                    {error && <div className="alert alert-danger text-center">{error}</div>}

                    {/* Formulario de Email/Password */}
                    <form onSubmit={handleSubmit}>
                        {/* Inputs de email y password: no necesitan cambios */}
                        <div className="mb-3">
                            <label className="form-label fw-bold">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder='Ingresar Email'
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                required
                                id='email'
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label fw-bold">Contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder='Ingresar Contraseña'
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                required
                                id='password'
                            />
                        </div>

                        {/* Botón Principal: Siempre dice "Ingresar" */}
                        <button type="submit" className="btn btn-primary w-100 fw-bold mb-3">
                            Ingresar
                        </button>
                    </form>

                    {/* ❌ Eliminamos toda la sección de "o" y Google Login (comentada) */}
                    
                    <hr />

                    {/* ❌ Eliminamos la lógica de alternar entre modos (Registro/Login) */}
                    <div className="text-center">
                        <p className="d-inline me-1 text-danger fw-bold">
                            ⚠️ Acceso solo para personal autorizado.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPresentacional;