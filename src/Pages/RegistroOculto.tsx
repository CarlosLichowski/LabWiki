//RegistroOculto.tsx
import React, { useState } from 'react';
import appFirebase from '../Credenciales';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../css/RegistroOculto.css'; // Toda la carga visual se maneja acá

const auth = getAuth(appFirebase);
const db = getFirestore(appFirebase);

const RegistroOculto: React.FC = () => {
    const navigate = useNavigate();

    // Añadimos el estado para el nombre y apellido
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [servicio, setServicio] = useState('Laboratorio Central');
    const [telefono, setTelefono] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const listaServicios = [
        "Laboratorio Central",
        "Parasitologia",
        "Endocrinologia",
        "Hematologia",
        "Hemoterapia",
        "Salud Mental",
        "Psiquiatria",
        "Clinica Medica",
        "Traumatologia",
        "Urologia",
        "Ginecologia",
        "Obstetricia",
        "Pediatria",
        "Uco/Cardio",
        "Kinesiologia",
        "Gastroenterologia",
        "Oftalmologia",
        "Neonatología",
        "Cirugía General",
        "Neurologia",
        "Dermatologia",
        "Diagnóstico por imágenes",
        "UTI"
    ];

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (loading) return;
        setError('');

        // Validaciones previas
        if (!nombre.trim()) {
            setError("Por favor, ingrese su nombre y apellido.");
            return;
        }

        if (!telefono.trim()) {
            setError("Por favor, ingrese un número de teléfono o interno.");
            return;
        }

        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Almacenamos el campo 'nombre' en la colección de usuarios en Firestore
            await setDoc(doc(db, "usuarios", user.uid), {
                nombre: nombre.trim(),
                email: user.email,
                servicio: servicio,
                telefono: telefono.trim(),
                fechaCreacion: new Date().toISOString(),
                rol: "operador"
            });

            navigate("/", { replace: true });
        } catch (err: any) {
            console.error("Error en el registro:", err);
            let errorMessage = "Ocurrió un error al intentar crear la cuenta.";
            
            if (err.code === 'auth/email-already-in-use') {
                errorMessage = "Este correo electrónico ya está registrado.";
            } else if (err.code === 'auth/weak-password') {
                errorMessage = "La contraseña debe tener al menos 6 caracteres.";
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = "El formato del correo electrónico no es válido.";
            }
            
            setError(errorMessage);
            setLoading(false);
            
        }
    };

    return (
        <div className="login-screen">
            <div className="login-card">
                <div className="login-card-content">
                    <h2 className="login-title">
                        Registro de Personal<br />Autorizado
                    </h2>
                    <p className="login-subtitle">
                        Este enlace es privado. Ingrese sus datos para dar de alta su cuenta en la plataforma.
                    </p>

                    {error && <div className="alert-error">{error}</div>}

                    <form onSubmit={handleRegister}>
                        {/* NUEVO Campo: Nombre y Apellido */}
                        <div className="form-group">
                            <label className="form-label">Nombre y Apellido:</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Ej: Juan Pérez"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Campo: Email */}
                        <div className="form-group">
                            <label className="form-label">Correo Electrónico:</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="ejemplo@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Campo: Contraseña */}
                        <div className="form-group">
                            <label className="form-label">Contraseña:</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Mínimo 6 caracteres"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Campo: Selección de Servicio */}
                        <div className="form-group">
                            <label className="form-label">Confirma tu Servicio / Área:</label>
                            <select
                                className="form-input"
                                value={servicio}
                                onChange={(e) => setServicio(e.target.value)}
                                disabled={loading}
                            >
                                {listaServicios.map((opcion, index) => (
                                    <option key={index} value={opcion}>
                                        {opcion}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Campo: Número de Teléfono / Interno */}
                        <div className="form-group">
                            <label className="form-label">Número de Teléfono o Interno:</label>
                            <input
                                type="tel"
                                className="form-input"
                                placeholder="Ej: 12345"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))} 
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
                            {loading ? 'Registrando Cuenta...' : 'Registrar Mi Cuenta'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegistroOculto;