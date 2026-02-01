//Configuracion.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext'; // Asegúrate que la ruta sea correcta
import { 
    updateProfile, 
    updatePassword, 
    reauthenticateWithCredential, 
    EmailAuthProvider,
} from 'firebase/auth'; 
import { doc, updateDoc } from 'firebase/firestore';

const Configuracion: React.FC = () => {
    const { user, db } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'danger' | '' }>({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Carga el nombre actual del usuario al iniciar
        if (user?.displayName) {
            setDisplayName(user.displayName);
        }
    }, [user]);

    // ----------------------------------------------------
    // 🟢 FUNCIÓN 1: Actualizar Nombre Visible
    // ----------------------------------------------------
    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || loading) return;

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            // 1. Actualiza el perfil de Firebase Authentication
            await updateProfile(user, { displayName: displayName });
            
            // 2. Opcional: Actualiza el nombre en tu documento de Firestore (si lo usas)
            // Se añade ! a db para asegurar que no es null, ya que se asume que useAuth lo provee.
            const userRef = doc(db!, 'usuarios', user.uid); 
            await updateDoc(userRef, { nombre: displayName });

            setMessage({ text: 'Nombre actualizado con éxito.', type: 'success' });
        } catch (error) {
            console.error("Error al actualizar el nombre:", error);
            // 🟢 Manejo de error genérico (no requiere tipado estricto de Firebase Auth)
            setMessage({ text: 'Error al actualizar el nombre. Intenta de nuevo.', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------------------
    // 🟢 FUNCIÓN 2: Actualizar Contraseña
    // ----------------------------------------------------
    // ⚠️ La corrección está aquí: cambiamos `error: any` por `error: unknown` y hacemos una verificación de tipo.
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || loading) return;

        setLoading(true);
        setMessage({ text: '', type: '' });

        if (newPassword.length < 6) {
            setMessage({ text: 'La nueva contraseña debe tener al menos 6 caracteres.', type: 'danger' });
            setLoading(false);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setMessage({ text: 'Las contraseñas no coinciden.', type: 'danger' });
            setLoading(false);
            return;
        }

        if (!user.email || !currentPassword) {
              setMessage({ text: 'Debes ingresar la contraseña actual y tu correo.', type: 'danger' });
              setLoading(false);
              return;
        }

        try {
            // 1. Re-autenticación obligatoria
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            
            // 2. Cambia la contraseña.
            await updatePassword(user, newPassword);

            setMessage({ text: 'Contraseña actualizada con éxito. Por favor, vuelve a iniciar sesión con tu nueva contraseña.', type: 'success' });
            
            // 3. Limpiar campos
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            
        // 🟢 CORRECCIÓN DE TIPADO: Usar 'unknown' y verificar si es un error de Firebase
        } catch (error: unknown) { 
            console.error("Error al actualizar la contraseña:", error);
            let errorMessage = 'Error al actualizar la contraseña. Intenta de nuevo.';
            
            // Verificar si el error tiene la estructura de un error de Firebase Auth
            // Se comprueba si es un objeto, no nulo, y tiene la propiedad 'code' de tipo string.
            if (typeof error === 'object' && error !== null && 'code' in error && typeof (error as { code: string }).code === 'string') {
                const firebaseError = error as { code: string };

                if (firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
                    errorMessage = 'La contraseña actual ingresada es incorrecta o no válida.';
                } else if (firebaseError.code === 'auth/requires-recent-login') {
                    errorMessage = 'Por favor, cierra sesión e inicia de nuevo para poder cambiar tu contraseña (inicia sesión recientemente).';
                }
            }

            setMessage({ text: errorMessage, type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------------------
    // ⬇️ RENDERIZADO ⬇️
    // ----------------------------------------------------

    return (
        <div className="container mt-5">
            <h2 className="mb-4 text-secondary">🔧 Configuración de Perfil</h2>
            
            {message.text && (
                <div className={`alert alert-${message.type}`} role="alert">
                    {message.text}
                </div>
            )}

            {/* SECCIÓN 1: ACTUALIZAR NOMBRE VISIBLE */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-light fw-bold">Actualizar Nombre</div>
                <div className="card-body">
                    <form onSubmit={handleUpdateName}>
                        <div className="mb-3">
                            <label htmlFor="displayName" className="form-label">Nombre visible en el portal</label>
                            <input
                                type="text"
                                className="form-control"
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading && !message.text ? 'Guardando...' : 'Guardar Nombre'}
                        </button>
                    </form>
                </div>
            </div>

            {/* SECCIÓN 2: CAMBIAR CONTRASEÑA */}
            <div className="card shadow-sm">
                <div className="card-header bg-light fw-bold">Cambiar Contraseña</div>
                <div className="card-body">
                    <form onSubmit={handleUpdatePassword}>
                        <div className="mb-3">
                            <label htmlFor="currentPassword" className="form-label">Contraseña Actual</label>
                            <input
                                type="password"
                                className="form-control"
                                id="currentPassword"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="newPassword" className="form-label">Nueva Contraseña (mín. 6 caracteres)</label>
                            <input
                                type="password"
                                className="form-control"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="confirmNewPassword" className="form-label">Confirmar Nueva Contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                id="confirmNewPassword"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-danger" disabled={loading}>
                            {loading && !message.text ? 'Cambiando...' : 'Cambiar Contraseña'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Configuracion;