// src/useContext/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import appFirebase, { db, storage, APP_ID } from '../Credenciales'; 
import { getAuth, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore'; 
import type { FirebaseStorage } from 'firebase/storage'; 

const auth = getAuth(appFirebase);
const googleProvider = new GoogleAuthProvider();

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    db: Firestore;
    storage: FirebaseStorage;
    appId: string; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
            const result = await signInWithPopup(auth, googleProvider);
            const loggedUser = result.user;

            // 🌟 Sincronización automática con la base de datos y contactos internos
            if (loggedUser) {
                const userDocRef = doc(db, 'usuarios', loggedUser.uid);
                const docSnap = await getDoc(userDocRef);

                // Si el usuario no existe en la base de datos (Primer ingreso)
                if (!docSnap.exists()) {
                    const nombreCompleto = loggedUser.displayName || "Usuario Nuevo";
                    const email = loggedUser.email || "";
                    const telefono = loggedUser.phoneNumber || "Sin especificar";
                    const areaPorDefecto = "Laboratorio Central"; // Se puede cambiar después en su perfil

                    // 1. Crear documento de perfil de usuario
                    await setDoc(userDocRef, {
                        nombre: nombreCompleto,
                        email: email,
                        servicio: areaPorDefecto,
                        telefono: telefono,
                        favorites_contactos: {},
                        createdAt: serverTimestamp()
                    });

                    // 2. Insertar automáticamente en la Guía de Contactos Internos
                    const contactoDocRef = doc(db, 'contactos_internos', loggedUser.uid);
                    await setDoc(contactoDocRef, {
                        area: areaPorDefecto,
                        nombre: nombreCompleto,
                        interno: telefono,
                        tipo: 'medico', // Categoría para personal
                        createdAt: serverTimestamp(),
                        userId: loggedUser.uid // Mantenemos la referencia cruzada
                    });

                    console.log("Nuevo usuario registrado y agregado a la guía telefónica con éxito.");
                }
            }
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
        appId: APP_ID, 
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};