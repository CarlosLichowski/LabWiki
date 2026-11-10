// Components/ChatFlotante/ChatFlotante.tsx
import React, { useState, useEffect } from 'react';
import appFirebase from '../../Credenciales';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  writeBatch, 
  doc, 
  updateDoc, 
  increment 
} from 'firebase/firestore';

import { useChatData } from '../../Hooks/useChatData';
import { ChatBottomBar } from './ChatBottomBar';
import { ChatSidebar } from './ChatSidebarTEMP'; 
import { ChatWindow } from './ChatWindow';   

import './ChatFlotante.css';

const db = getFirestore(appFirebase);

const ChatFlotante: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGlobalChatOpen, setIsGlobalChatOpen] = useState(false);
  const [chatMode, setChatMode] = useState<string>('global'); 
  const [nuevoMensaje, setNuevoMensaje] = useState('');

  const { 
    currentUser, 
    userData, 
    usuariosSistema, 
    conversaciones, 
    mensajesGlobales, 
    mensajesPrivados 
  } = useChatData(chatMode);

  const mensajesAAsignar = chatMode === 'global' ? mensajesGlobales : mensajesPrivados; 
  const usuarioSeleccionado = usuariosSistema.find(u => u.id === chatMode);
  const nombreChatPrivado = usuarioSeleccionado ? (usuarioSeleccionado.nombre || usuarioSeleccionado.displayName) : undefined;

  const totalMensajesSinLeer = currentUser && conversaciones
    ? conversaciones.reduce((acc, conv) => acc + Number(conv.noLeidos?.[currentUser.uid] ?? 0), 0)
    : 0;

  useEffect(() => {
    if (chatMode !== 'global' && chatMode !== 'ia' && currentUser && isGlobalChatOpen) {
      const resetearNoLeidos = async () => {
        try {
          const IDsOrdenados = [currentUser.uid, chatMode].sort();
          const salaId = `${IDsOrdenados[0]}_${IDsOrdenados[1]}`;
          
          const convRef = doc(db, 'conversaciones', salaId);
          await updateDoc(convRef, {
            [`noLeidos.${currentUser.uid}`]: 0
          });
        } catch (error) {
          console.warn("No se pudo resetear el contador: ", error);
        }
      };

      resetearNoLeidos();
    }
  }, [chatMode, currentUser, isGlobalChatOpen]);

  const handleEnviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !currentUser) return;

    const textoUsuario = nuevoMensaje.trim();
    setNuevoMensaje('');

    let nombreDetectado = userData?.nombre || userData?.displayName || currentUser.displayName;
    if (!nombreDetectado && currentUser.email) {
      nombreDetectado = currentUser.email.split('@')[0];
    }
    
    const nombreReal = String(nombreDetectado || 'Usuario');
    const servicioReal = String(userData?.servicio || 'General');
    const uidSeguro = String(currentUser.uid);

    if (chatMode === 'global') {
      await addDoc(collection(db, 'chat_laboratorio'), {
        texto: textoUsuario,
        remitenteId: uidSeguro,
        userId: uidSeguro,
        remitenteNombre: nombreReal,
        remitenteServicio: servicioReal,
        createdAt: serverTimestamp()
      });
      
    } else {
      try {
        const IDsOrdenados = [uidSeguro, chatMode].sort();
        const salaId = `${IDsOrdenados[0]}_${IDsOrdenados[1]}`;

        const batch = writeBatch(db);

        const nuevoMensajeRef = doc(collection(db, 'chat_privado'));
        batch.set(nuevoMensajeRef, {
          salaId: salaId,
          texto: textoUsuario,
          remitenteId: uidSeguro,
          remitenteNombre: nombreReal,
          remitenteServicio: servicioReal,
          createdAt: serverTimestamp()
        });

        // 1. SOLUCIÓN IMPLEMENTADA: Inicialización explícita del mapa anidado 'noLeidos'
        const convRef = doc(db, 'conversaciones', salaId);
        batch.set(convRef, {
          salaId: salaId,
          participantes: IDsOrdenados,
          ultimoMensaje: textoUsuario,
          ultimoRemitenteId: uidSeguro,
          ultimoTimestamp: serverTimestamp(),
          noLeidos: {
            [uidSeguro]: 0,
            [chatMode]: increment(1)
          }
        }, { merge: true });

        await batch.commit();
      } catch (error) {
        console.error("Error al enviar mensaje y actualizar la conversación: ", error);
      }
    }
  };

  if (!currentUser) return null;

  return (
    <div className="fb-chat-wrapper">
      <ChatBottomBar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isGlobalChatOpen={isGlobalChatOpen}
        setIsGlobalChatOpen={setIsGlobalChatOpen}
        chatMode={chatMode} 
        countUsuarios={usuariosSistema.length}
        nombreChatPrivado={nombreChatPrivado}
        totalMensajesSinLeer={totalMensajesSinLeer}
      />

      {isSidebarOpen && (
        <ChatSidebar 
          usuariosSistema={usuariosSistema}
          isGlobalChatOpen={isGlobalChatOpen}
          chatMode={chatMode}
          setChatMode={setChatMode}
          setIsGlobalChatOpen={setIsGlobalChatOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          conversaciones={conversaciones}
          currentUserUid={currentUser.uid}
        />
      )}

      {isGlobalChatOpen && (
        <ChatWindow 
          chatMode={chatMode}
          mensajes={mensajesAAsignar}
          currentUserUid={currentUser.uid}
          nuevoMensaje={nuevoMensaje}
          setNuevoMensaje={setNuevoMensaje}
          onEnviar={handleEnviarMensaje}
          setIsGlobalChatOpen={setIsGlobalChatOpen}
          nombreChatPrivado={nombreChatPrivado}
        />
      )}
    </div>
  );
};

export default ChatFlotante;