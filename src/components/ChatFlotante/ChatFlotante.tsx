// src/Components/ChatFlotante.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../Context/ChatContext.tsx';
import { auth } from "../../Credenciales.ts";
import { MessageSquare, X, Send } from 'lucide-react';

const ChatFlotante: React.FC = () => {
  const { isOpen, setIsOpen, mensajes, enviarMensaje } = useChat();
  const [texto, setTexto] = useState('');
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  const LIMITE_CARACTERES = 1000;

  // 🌟 CONTROL CRÍTICO: Si no hay usuario logueado (ej: pantalla de Login), no renderiza nada
  if (!auth.currentUser) {
    return null;
  }

  // Auto-scrollear al fondo cuando se abre el chat o llega un mensaje nuevo
  useEffect(() => {
    if (isOpen) {
      mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensajes, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    
    try {
      await enviarMensaje(texto);
      setTexto('');
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    }
  };

  // VISTA 1: BOTÓN FLOTANTE (Cuando el chat está cerrado)
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="btn btn-primary rounded-circle position-fixed shadow-lg d-flex align-items-center justify-content-center transition-all"
        style={{ 
          bottom: '20px', 
          right: '20px', 
          width: '60px', 
          height: '60px', 
          zIndex: 1050,
          transform: 'scale(1)'
        }}
        title="Abrir chat del laboratorio"
      >
        <MessageSquare size={26} />
      </button>
    );
  }

  // VISTA 2: VENTANA DE CHAT ABIERTA (Estilo Soft UI / Caja contenedora)
  return (
    <div 
      className="card position-fixed shadow-lg border rounded-4 bg-white animate__animated animate__fadeInUp"
      style={{ 
        bottom: '20px', 
        right: '20px', 
        width: '350px', 
        maxHeight: '480px', 
        height: '100%', 
        zIndex: 1050, 
        display: 'flex', 
        flexDirection: 'column' 
      }}
    >
      {/* HEADER */}
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3 rounded-top-4 border-0">
        <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
          <MessageSquare size={18} /> Novedades del Laboratorio
        </h6>
        <button 
          onClick={() => setIsOpen(false)} 
          className="btn btn-link text-white p-0 shadow-none border-0 d-flex align-items-center"
        >
          <X size={20} />
        </button>
      </div>

      {/* CUERPO / MENSAJES */}
      <div className="card-body bg-light p-3 overflow-y-auto" style={{ flex: 1, fontSize: '0.9rem' }}>
        {mensajes.map((msg) => {
          const esPropio = msg.userId === auth.currentUser?.uid;
          
          return (
            <div 
              key={msg.id} 
              className={`d-flex flex-column mb-3 ${esPropio ? 'align-items-end' : 'align-items-start'}`}
              style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
            >
              {/* Nombre del autor + Sector */}
              <span className="extra-small text-muted fw-bold text-uppercase mb-1 px-1" style={{ fontSize: '9px' }}>
                {esPropio 
                  ? `${msg.autor} (Tú) — ${msg.servicio || 'Laboratorio'}` 
                  : `${msg.autor} (${msg.servicio || 'Laboratorio'})`
                }
              </span>
              
              {/* Burbuja del mensaje */}
              <div 
                className={`p-2 rounded-3 border shadow-sm ${esPropio ? 'bg-primary-subtle text-dark' : 'bg-white text-dark'}`} 
                style={{ maxWidth: '85%' }}
              >
                {msg.texto}
              </div>
            </div>
          );
        })}
        {/* Referencia invisible para el auto-scroll */}
        <div ref={mensajesEndRef} />
      </div>

      {/* FOOTER / INPUT */}
      <div className="p-2 bg-white border-top rounded-bottom-4">
        <form onSubmit={handleSend} className="d-flex gap-2 align-items-end">
          <div className="w-100 position-relative">
            <textarea 
              className="form-control bg-light border-0 py-2 shadow-none rounded-3"
              placeholder="Escribe un mensaje..."
              value={texto}
              maxLength={LIMITE_CARACTERES} 
              onChange={e => setTexto(e.target.value)}
              rows={2}
              style={{ resize: 'none', fontSize: '0.85rem' }}
              required
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm"
            style={{ height: '38px', width: '38px' }}
          >
            <Send size={14} />
          </button>
        </form>
        
        {/* Contador de caracteres integrado */}
        <div className="text-end text-muted opacity-70 px-1 mt-1" style={{ fontSize: '9px', fontWeight: '500' }}>
          {texto.length} / {LIMITE_CARACTERES}
        </div>
      </div>

      {/* Estilos locales complementarios */}
      <style>{`
        .extra-small { font-size: 0.65rem; }
        .rounded-top-4 { border-top-left-radius: 1rem !important; border-top-right-radius: 1rem !important; }
        .rounded-bottom-4 { border-bottom-left-radius: 1rem !important; border-bottom-right-radius: 1rem !important; }
      `}</style>
    </div>
  );
};

export default ChatFlotante;