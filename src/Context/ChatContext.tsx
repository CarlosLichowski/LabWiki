// src/Context/ChatContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../Credenciales';

interface Mensaje {
  id: string;
  texto: string;
  autor: string;
  userId: string;
  createdAt: any;
  servicio?: string; 
}

interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  mensajes: Mensaje[];
  enviarMensaje: (texto: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);

  // Escuchar el estado de autenticación antes de conectar el listener de Firestore
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined = undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Si el usuario no está logueado, limpiamos mensajes y cortamos ejecución para evitar errores de permisos
      if (!user) {
        setMensajes([]);
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
        }
        return;
      }

      // Si está logueado, montamos el listener de la colección de chat
      const q = query(
        collection(db, 'chat_laboratorio'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const usuariosCache: { [uid: string]: { nombre: string; servicio: string } } = {};

      unsubscribeSnapshot = onSnapshot(q, async (snapshot) => {
        const docsConDatosPromesas = snapshot.docs.map(async (d) => {
          const data = d.data();
          const uid = data.userId;
          
          let nombreReal = data.autor || 'Usuario';
          let servicioReal = 'Sin Sector';

          if (uid) {
            if (usuariosCache[uid]) {
              nombreReal = usuariosCache[uid].nombre;
              servicioReal = usuariosCache[uid].servicio;
            } else {
              try {
                const userDocRef = doc(db, 'usuarios', uid);
                const userDocSnap = await getDoc(userDocRef);
                
                if (userDocSnap.exists()) {
                  const userData = userDocSnap.data();
                  nombreReal = userData.nombre || nombreReal;
                  servicioReal = userData.servicio || servicioReal;
                  usuariosCache[uid] = { nombre: nombreReal, servicio: servicioReal };
                }
              } catch (err) {
                console.error("Error al traer datos del usuario del mensaje:", err);
              }
            }
          }

          return {
            id: d.id,
            texto: data.texto || '',
            userId: uid || '',
            createdAt: data.createdAt,
            autor: nombreReal,
            servicio: servicioReal
          } as Mensaje;
        });

        const listaMensajes = await Promise.all(docsConDatosPromesas);
        setMensajes(listaMensajes.reverse());
      }, (error) => {
        console.error("Error en el snapshot del chat:", error);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const enviarMensaje = async (texto: string) => {
    if (!texto.trim() || !auth.currentUser) return;

    const user = auth.currentUser;

    await addDoc(collection(db, 'chat_laboratorio'), {
      texto: texto.trim(),
      autor: user.displayName || user.email?.split('@')[0] || 'Usuario',
      userId: user.uid,
      createdAt: serverTimestamp()
    });
  };

  return (
    <ChatContext.Provider value={{ isOpen, setIsOpen, mensajes, enviarMensaje }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat debe usarse dentro de un ChatProvider');
  return context;
};