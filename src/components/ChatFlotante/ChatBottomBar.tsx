//ChatBottomBar.tsx
import React from 'react';

interface ChatBottomBarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isGlobalChatOpen: boolean;
  setIsGlobalChatOpen: (open: boolean) => void;
  chatMode: string;
  countUsuarios: number;
  nombreChatPrivado?: string;
  totalMensajesSinLeer: number; // 🌟 Agregado para capturar mensajes sin leer globales
}

export const ChatBottomBar: React.FC<ChatBottomBarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  isGlobalChatOpen,
  setIsGlobalChatOpen,
  chatMode,
  countUsuarios,
  nombreChatPrivado,
  totalMensajesSinLeer
}) => {

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (!isSidebarOpen) {
      setIsGlobalChatOpen(false); // Cierra la ventana si abre la lista
    }
  };

  const toggleChatWindow = () => {
    setIsGlobalChatOpen(!isGlobalChatOpen);
    if (!isGlobalChatOpen) {
      setIsSidebarOpen(false); // Cierra la lista si abre la ventana
    }
  };

  return (
    <div className="fb-bottom-bar">
      {/* Botón Principal de Canales y Contactos */}
      <button 
        className={`fb-tab-btn ${isSidebarOpen ? 'active' : ''}`} 
        onClick={toggleSidebar}
        style={{ position: 'relative' }} // Asegura que el badge se posicione respecto al botón
      >
        <i className="bi bi-chat-dots-fill me-2"></i>
        Contactos ({countUsuarios})

        {/* 🌟 BADGE ROJO: Se muestra solo si hay mensajes sin leer y la barra lateral está cerrada */}
        {totalMensajesSinLeer > 0 && !isSidebarOpen && (
          <span className="fb-global-unread-badge">
            {totalMensajesSinLeer}
          </span>
        )}
      </button>

      {/* RECTÁNGULO DINÁMICO: Si el chat está abierto y es un Chat Privado */}
      {isGlobalChatOpen && chatMode !== 'global' && nombreChatPrivado && (
        <button 
          className={`fb-tab-btn active private-tab`} 
          onClick={toggleChatWindow}
        >
          <span className="fb-online-indicator-mini me-2"></span>
          {nombreChatPrivado}
        </button>
      )}

      {/* RECTÁNGULO DINÁMICO: Si el chat está abierto y es el Chat Global */}
      {isGlobalChatOpen && chatMode === 'global' && (
        <button 
          className={`fb-tab-btn active global-tab`} 
          onClick={toggleChatWindow}
        >
          🌍 Chat Global
        </button>
      )}
    </div>
  );
};