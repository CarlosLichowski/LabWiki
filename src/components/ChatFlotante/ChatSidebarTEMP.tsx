// Components/ChatFlotante/Componentes/ChatSidebar.tsx
import React from 'react';
import { type UsuarioLista, type Conversacion } from '../../Hooks/useChatData';

interface ChatSidebarProps {
  usuariosSistema: UsuarioLista[];
  isGlobalChatOpen: boolean;
  chatMode: 'global' | 'ia' | string;
  setChatMode: (mode: any) => void;
  setIsGlobalChatOpen: (open: boolean) => void;
  setIsSidebarOpen: (open: boolean) => void;
  conversaciones: Conversacion[]; 
  currentUserUid: string;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  usuariosSistema,
  isGlobalChatOpen,
  chatMode,
  setChatMode,
  setIsGlobalChatOpen,
  setIsSidebarOpen,
  conversaciones,
  currentUserUid
}) => {
  const seleccionarCanal = (modo: string) => {
    setChatMode(modo);
    setIsGlobalChatOpen(true);
    setIsSidebarOpen(false);
  };

  const obtenerSalaId = (contactoId: string) => {
    const IDsOrdenados = [currentUserUid, contactoId].sort();
    return `${IDsOrdenados[0]}_${IDsOrdenados[1]}`;
  };

  // 2. SOLUCIÓN IMPLEMENTADA: Conversión numérica robusta tolerante a undefined/null
  const obtenerMensajesSinLeer = (contactoId: string) => {
    if (!conversaciones) return 0;
    const salaId = obtenerSalaId(contactoId);
    const conv = conversaciones.find(c => c.salaId === salaId);
    return Number(conv?.noLeidos?.[currentUserUid] ?? 0);
  };

  const obtenerUltimoMensaje = (contactoId: string, servicioPorDefecto: string) => {
    if (!conversaciones) return servicioPorDefecto;
    const salaId = obtenerSalaId(contactoId);
    const conv = conversaciones.find(c => c.salaId === salaId);

    if (!conv || !conv.ultimoMensaje) {
      return servicioPorDefecto;
    }

    const prefijo = conv.ultimoRemitenteId === currentUserUid ? 'Vos: ' : '';
    const mensajeCortado = conv.ultimoMensaje.length > 22 
      ? conv.ultimoMensaje.substring(0, 20) + '...' 
      : conv.ultimoMensaje;

    return `${prefijo}${mensajeCortado}`;
  };

  return (
    <div className="fb-sidebar">
      <div className="fb-sidebar-header">
        <span>Canales y Contactos</span>
        <button className="fb-close-mini" onClick={() => setIsSidebarOpen(false)}>
          <i className="bi bi-dash-lg"></i>
        </button>
      </div>
      
      <div className="fb-sidebar-list">
        {/* CANAL: CHAT GLOBAL */}
        <div 
          className={`fb-sidebar-item global-item ${isGlobalChatOpen && chatMode === 'global' ? 'selected' : ''}`}
          onClick={() => seleccionarCanal('global')}
        >
          <div className="fb-avatar-placeholder global-avatar">🌍</div>
          <div className="fb-item-info">
            <span className="fb-user-name fw-bold">Chat Global</span>
            <span className="fb-user-sub text-muted">Sala común compartida</span>
          </div>
        </div>

        {/* CANAL: ASISTENTE CLÍNICO RAG */}
        <div 
          className="fb-sidebar-item ai-rag-item"
          style={{ background: 'rgba(37, 99, 235, 0.08)', borderLeft: '3px solid #2563eb' }}
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-rag-chatbot'));
            setIsSidebarOpen(false);
          }}
        >
          <div className="fb-avatar-placeholder" style={{ background: '#2563eb', color: '#ffffff' }}>
            🤖
          </div>
          <div className="fb-item-info">
            <span className="fb-user-name fw-bold" style={{ color: '#2563eb' }}>Copilot Clínico (RAG)</span>
            <span className="fb-user-sub text-muted">Insertos, Cobas y Métricas</span>
          </div>
        </div>

        <div className="fb-separator">Personal Registrado</div>

        {/* LISTA DE USUARIOS */}
        {usuariosSistema
          .filter(u => u.id !== currentUserUid)
          .map((u) => {
            const noLeidos = obtenerMensajesSinLeer(u.id);
            
            // 3. SOLUCIÓN IMPLEMENTADA: Lógica explícita y className dinámico estructurado
            const chatAbiertoActivo = isGlobalChatOpen && chatMode === u.id;
            const isUnread = Number(noLeidos) > 0 && !chatAbiertoActivo;
            
            const subtextoInfo = obtenerUltimoMensaje(u.id, u.servicio || 'General');

            return (
              <div 
                key={u.id} 
                className={[
                  'fb-sidebar-item',
                  chatAbiertoActivo ? 'selected' : '',
                  isUnread ? 'unread-item' : '',
                ].join(' ')}
                onClick={() => seleccionarCanal(u.id)}
              >
                <div className="fb-avatar-placeholder">
                  {String(u.nombre || u.displayName || 'U')[0].toUpperCase()}
                </div>
                <div className="fb-item-info">
                  <span className="fb-user-name">{u.nombre || u.displayName || 'Usuario'}</span>
                  
                  {isUnread ? (
                    <span className="fb-user-sub fb-unread-text">
                      {noLeidos} {noLeidos === 1 ? 'mensaje sin leer' : 'mensajes sin leer'}
                    </span>
                  ) : (
                    <span className="fb-user-sub text-muted">{subtextoInfo}</span>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};