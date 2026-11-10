// Hooks/useChatData.ts
import { useState, useEffect } from 'react';
import appFirebase from '../Credenciales';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, collection, query, onSnapshot, 
  orderBy, doc, getDoc, limit, where 
} from 'firebase/firestore';

const auth = getAuth(appFirebase);
const db = getFirestore(appFirebase);

export interface Mensaje {
  id: string;
  texto: string;
  remitenteId: string;
  remitenteNombre: string;
  remitenteServicio: string;
  createdAt: any;
  usuarioReferencia?: string;
  userId?: string;
  salaId?: string; // Para identificar a qué chat privado pertenece
}

export interface UsuarioLista {
  id: string;
  nombre?: string;
  displayName?: string;
  servicio?: string;
}

// 🌟 NUEVA INTERFAZ: Representa una conversación en la lista lateral
export interface Conversacion {
  salaId: string;
  participantes: string[];
  ultimoMensaje: string;
  ultimoRemitenteId: string;
  ultimoTimestamp: any;
  noLeidos: { [uid: string]: number }; // Mapa de no leídos por UID: { "A": 0, "B": 5 }
}

export const useChatData = (chatMode: string) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [usuariosSistema, setUsuariosSistema] = useState<UsuarioLista[]>([]);
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]); // 🌟 Estado para la barra lateral
  const [mensajesGlobales, setMensajesGlobales] = useState<Mensaje[]>([]);
  const [mensajesIA, setMensajesIA] = useState<Mensaje[]>([]);
  const [mensajesPrivados, setMensajesPrivados] = useState<Mensaje[]>([]);

  // Efecto 1: Estado de autenticación
  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists()) setUserData(userDoc.data());
      } else {
        setUserData(null);
      }
    });
  }, []);

  // Efecto 2: Lista de usuarios del laboratorio
  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(collection(db, 'usuarios'), (snapshot) => {
      const lista = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as UsuarioLista))
        .filter(u => u.id !== currentUser.uid);
      setUsuariosSistema(lista);
    }, (error) => console.error("Error Usuarios:", error));
    return () => unsub();
  }, [currentUser]);

  // Efecto 3: Escucha Chat Global
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'chat_laboratorio'), orderBy('createdAt', 'asc'), limit(50));
    const unsub = onSnapshot(q, (snapshot) => {
      setMensajesGlobales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mensaje)));
    }, (error) => console.error("Error Chat Global:", error));
    return () => unsub();
  }, [currentUser]);

  // Efecto 4: Escucha Chat IA
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'chat_ia'),
      where('usuarioReferencia', '==', currentUser.uid),
      orderBy('createdAt', 'asc'),
      limit(50)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setMensajesIA(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mensaje)));
    }, (error) => console.error("Error Chat IA:", error));
    return () => unsub();
  }, [currentUser]);

  // 🌟 NUEVO - Efecto 5: Escucha las conversaciones activas del usuario (Súper eficiente)
  useEffect(() => {
    if (!currentUser) {
      setConversaciones([]);
      return;
    }

    // Buscamos solo las conversaciones donde el usuario actual sea un participante
    const q = query(
      collection(db, 'conversaciones'),
      where('participantes', 'array-contains', currentUser.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const listaConv = snapshot.docs.map(doc => doc.data() as Conversacion);
      setConversaciones(listaConv);
    }, (error) => {
      console.error("Error al recuperar conversaciones:", error);
    });

    return () => unsub();
  }, [currentUser]);

  // Efecto 6: Escucha dinámica para el Chat Privado seleccionado (Solo cuando el chat está abierto)
  useEffect(() => {
    if (!currentUser || chatMode === 'global' || chatMode === 'ia') {
      setMensajesPrivados([]);
      return;
    }

    const IDsOrdenados = [currentUser.uid, chatMode].sort();
    const salaId = `${IDsOrdenados[0]}_${IDsOrdenados[1]}`;

    const q = query(
      collection(db, 'chat_privado'),
      where('salaId', '==', salaId),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setMensajesPrivados(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mensaje)));
    }, (error) => {
      console.error("Error al recuperar Chat Privado:", error);
    });

    return () => unsub();
  }, [currentUser, chatMode]);

  // 🌟 Agregamos "conversaciones" al objeto de retorno
  return { 
    currentUser, 
    userData, 
    usuariosSistema, 
    conversaciones, 
    mensajesGlobales, 
    mensajesIA, 
    mensajesPrivados 
  };
};