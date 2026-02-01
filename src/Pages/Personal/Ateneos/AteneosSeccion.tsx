// src/Pages/Personal/Ateneos/AteneosSeccion.tsx

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import appFirebase, { db, storage } from "../../../Credenciales"; 
import Ateneos from "./Ateneos";

// --- Componentes de soporte ---
const LoadingScreen = () => (
    <div className="d-flex flex-column align-items-center justify-content-center p-5" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3 fw-medium text-muted">Iniciando sesión segura...</p>
    </div>
);

const ErrorScreen = ({ message }: { message: string }) => (
    <div className="alert alert-danger m-4 shadow-sm d-flex align-items-center" role="alert">
        <span className="me-2">⚠️</span>
        <div>{message}</div>
    </div>
);

// --- Instancia de Auth ---
const auth = getAuth(appFirebase); 

const AteneosSeccion = () => {
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // Suscripción al estado de autenticación de Firebase
        const unsub = onAuthStateChanged(auth, (currentUser) => { 
            setUser(currentUser);
            setReady(true);
        });

        // Limpieza de la suscripción al desmontar el componente
        return () => unsub();
    }, []);

    // 1. Mientras Firebase verifica la sesión
    if (!ready) {
        return <LoadingScreen />; 
    }
    
    // 2. Si no hay un usuario logueado después de verificar
    if (!user) {
        return <ErrorScreen message="No se pudo autenticar al usuario. Por favor, inicia sesión para acceder a los ateneos." />;
    }

    // 3. Renderizado exitoso: Pasamos los datos del usuario al componente principal
    // Extraemos el nombre del email como fallback si displayName es null
    const nombreParaMostrar = user.displayName || user.email?.split('@')[0] || "Usuario";

    return (
        <div className="container-fluid p-0 animate-fade-in">
            <Ateneos 
                userId={user.uid} 
                db={db} 
                storage={storage} 
                appId="labwiki"
                displayName={nombreParaMostrar}
            />  
        </div>
    );
};

export default AteneosSeccion;