// Components/ChatFlotante/Componentes/ChatWindow.tsx
import React, { useRef, useEffect } from 'react';
import { type Mensaje } from '../../Hooks/useChatData';

interface ChatWindowProps {
  chatMode: string;
  mensajes: Mensaje[];
  currentUserUid: string;
  nuevoMensaje: string;
  setNuevoMensaje: (texto: string) => void;
  onEnviar: (e: React.FormEvent) => void;
  setIsGlobalChatOpen: (open: boolean) => void;
  nombreChatPrivado?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chatMode,
  mensajes,
  currentUserUid,
  nuevoMensaje,
  setNuevoMensaje,
  onEnviar,
  setIsGlobalChatOpen,
  nombreChatPrivado
}) => {
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const getTituloVentana = () => {
    if (chatMode === 'global') return '🌍 Chat Global (Laboratorio)';
    if (chatMode === 'ia') return '🤖 Consulta: IA en desarrollo';
    return `👤 Chat con ${nombreChatPrivado || 'Usuario'}`;
  };

  return (
    <div className="fb-chat-window">
      <div className="fb-window-header" onClick={() => setIsGlobalChatOpen(false)}>
        <div className="d-flex align-items-center gap-2">
          <span className={`fb-online-indicator ${chatMode === 'ia' ? 'ai-online' : 'global'}`}></span>
          <span className="fb-window-title">{getTituloVentana()}</span>
        </div>
        <div className="fb-window-controls" onClick={(e) => e.stopPropagation()}>
          <button title="Minimizar" onClick={() => setIsGlobalChatOpen(false)}>
            <i className="bi bi-dash-lg"></i>
          </button>
        </div>
      </div>

      <div className="fb-window-messages">
        {mensajes.map((m) => {
          const esMio = m.remitenteId === currentUserUid;
          const esIA = m.remitenteId === 'IA_BOT';

          return (
            <div key={m.id} className={`fb-msg-row ${esMio ? 'fb-mine' : ''}`}>
              {!esMio && (
                <div className={`fb-msg-avatar ${esIA ? 'ia' : ''}`}>
                  {esIA ? '🤖' : (m.remitenteNombre ? m.remitenteNombre[0].toUpperCase() : 'U')}
                </div>
              )}
              <div className="fb-msg-bubble-container" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Nombre visible arriba del mensaje para diferenciar los autores */}
                <span className="fb-msg-author" style={{ alignSelf: esMio ? 'flex-end' : 'flex-start', marginBottom: '2px' }}>
                  {esMio ? 'Tú' : m.remitenteNombre} 
                  {!esMio && m.remitenteServicio && <span className="fb-msg-sector"> ({m.remitenteServicio})</span>}
                </span>
                
                <div className={`fb-msg-bubble ${esMio ? 'mine' : ''} ${esIA ? 'ia' : ''}`}>
                  {m.texto}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={mensajesEndRef} />
      </div>

      <form className="fb-window-input" onSubmit={onEnviar}>
        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder={
            chatMode === 'global' 
              ? "Escribe un mensaje al grupo..." 
              : chatMode === 'ia' 
                ? "Escribe un mensaje a la IA..." 
                : `Escribe un mensaje a ${nombreChatPrivado || 'Usuario'}...`
          }
          maxLength={1000}
        />
        <button type="submit" disabled={!nuevoMensaje.trim()}>
          <i className="bi bi-send-fill"></i>
        </button>
      </form>
    </div>
  );
};