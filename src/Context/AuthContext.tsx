// src/useContext/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
// 🟢 CORRECCIÓN: Cambiar appId por APP_ID para que coincida con Credenciales.ts
import appFirebase, { db, storage, APP_ID } from '../Credenciales'; 
import { getAuth, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import type { User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore'; 
import type { FirebaseStorage } from 'firebase/storage'; 

const auth = getAuth(appFirebase);
const googleProvider = new GoogleAuthProvider();

// 1. Definir los tipos
interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    
    db: Firestore;
    storage: FirebaseStorage;
    // 🟢 CORRECCIÓN: Usar APP_ID en la interfaz si es el nombre que se usará.
    // Si quieres que la prop se llame appId, usa: appId: string; y renombra al crear el objeto value.
    appId: string; // Dejamos 'appId' para el consumidor, pero importamos 'APP_ID'.
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


// 3. Crear el Provider
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (usuarioFirebase) => {
            setUser(usuarioFirebase);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const logout = () => signOut(auth);

    const loginWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Error al iniciar sesión con Google:", error);
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        logout,
        loginWithGoogle,
        db,
        storage,
        // 🟢 CORRECCIÓN: Mapear la importación APP_ID al nombre de la prop appId
        appId: APP_ID, 
    };

    if (loading) {
        return <div className="text-center p-5">Cargando sesión...</div>;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. Crear el Hook para usar el Contexto... (Sin cambios)
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};