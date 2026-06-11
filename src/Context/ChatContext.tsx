// src/Context/ChatContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../Credenciales'; // 🌟 CORREGIDO: Un solo salto de carpeta desde src/Context

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

  // Escuchar mensajes en tiempo real (Limitado a los últimos 50 por rendimiento)
  useEffect(() => {
    const q = query(
      collection(db, 'chat_laboratorio'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    // Caché local temporal para no hacer peticiones repetidas del mismo usuario
    const usuariosCache: { [uid: string]: { nombre: string; servicio: string } } = {};

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const docsConDatosPromesas = snapshot.docs.map(async (d) => {
        const data = d.data();
        const uid = data.userId;
        
        let nombreReal = data.autor || 'Usuario';
        let servicioReal = 'Sin Sector';

        if (uid) {
          // Si ya lo consultamos antes, lo sacamos de la memoria caché local
          if (usuariosCache[uid]) {
            nombreReal = usuariosCache[uid].nombre;
            servicioReal = usuariosCache[uid].servicio;
          } else {
            try {
              // Si no está en caché, hacemos una única lectura a su documento de usuario
              const userDocRef = doc(db, 'usuarios', uid);
              const userDocSnap = await getDoc(userDocRef);
              
              if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                nombreReal = userData.nombre || nombreReal;
                servicioReal = userData.servicio || servicioReal;
                
                // Guardamos en caché para los próximos mensajes de este snapshot
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

      // Esperamos que se resuelvan todas las lecturas asíncronas de usuarios
      const listaMensajes = await Promise.all(docsConDatosPromesas);
      
      // Los damos vuelta para que el más nuevo quede abajo en la pantalla del chat
      setMensajes(listaMensajes.reverse());
    });

    return () => unsubscribe();
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