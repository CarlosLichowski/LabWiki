// src/components/ChatbotRAG/ChatbotRAG.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  Beaker,
  Cpu,
  Truck,
  BarChart3,
  Layers,
} from 'lucide-react';
import type { MensajeChatbot, FiltroContexto, ChatbotAPIResponse } from './types';
import { SourceBadge } from './SourceBadge';
import { MarkdownRenderer } from './MarkdownRenderer';
import './ChatbotRAG.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const MENSAJE_INICIAL: MensajeChatbot = {
  id: 'msg-bienvenida',
  remitente: 'asistente',
  texto: `
### 👋 ¡Hola! Soy el Asistente IA de LabRamos

Estoy integrado con la base de datos de producción LIS, los manuales de analizadores y los insertos técnicos de laboratorio.

Puedo ayudarte de forma instantánea con:
- **🧪 Insertos y Reactivos (RAG):** Límites de linealidad, detección e interferencias por **Hemólisis, Ictericia y Lipemia (HIL)** para pruebas Cobas (Creatinina CREJ2, Glucosa HK, Bilirrubinas, etc.).
- **⚙️ Manuales de Equipos:** Alertas y procedimientos de solución de problemas para **Roche Cobas 6000 (c501/e601)**, **Cobas e411**, **LauraXL**, **VIDAS 3** y **STA Compact Max**.
- **📊 Métricas y Cierres Internos:** Estadísticas de producción, tasas de repetición/reprocesos de guardia y registro de no conformidades.
- **🚚 Derivaciones y Logística:** Protocolos exactos de conservación (temperatura ambiente vs -20°C congelado) y transporte para **Hospital Muñiz, Garrahan, Posadas y Clínicas**.

*Selecciona una sugerencia o escribe tu consulta:*
  `.trim(),
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  sugerencias: [
    '🧪 Límites e interferencias HIL de Creatinina Jaffe (CREJ2)',
    '⚙️ Alarma Cobas c501: Reagent Shortage / Foam Detected',
    '🚚 Requisitos para derivar Carga Viral VIH a Hospital Muñiz',
    '📊 Consultar volumen de pruebas y reprocesos del último turno',
  ],
};

export const ChatbotRAG: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState<FiltroContexto>('todos');
  const [mensajes, setMensajes] = useState<MensajeChatbot[]>([MENSAJE_INICIAL]);
  const [inputTexto, setInputTexto] = useState('');
  const [isCargando, setIsCargando] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOpenEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ query?: string; filter?: FiltroContexto }>;
      setIsOpen(true);
      if (customEvent.detail?.filter) {
        setFiltroActivo(customEvent.detail.filter);
      }
      if (customEvent.detail?.query) {
        handleEnviarConsulta(customEvent.detail.query);
      }
    };

    window.addEventListener('open-rag-chatbot', handleOpenEvent);
    return () => window.removeEventListener('open-rag-chatbot', handleOpenEvent);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [mensajes, isOpen]);

  const handleEnviarConsulta = async (textoAEnviar?: string) => {
    const consulta = (textoAEnviar || inputTexto).trim();
    if (!consulta || isCargando) return;

    const nuevoMensajeUsuario: MensajeChatbot = {
      id: `user-${Date.now()}`,
      remitente: 'usuario',
      texto: consulta,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMensajes((prev) => [...prev, nuevoMensajeUsuario]);
    if (!textoAEnviar) setInputTexto('');
    setIsCargando(true);

    try {
      // Construir historial previo resumido para contexto
      const historial = mensajes.slice(-6).map((m) => ({
        role: (m.remitente === 'usuario' ? 'user' : 'assistant') as 'user' | 'assistant',
        text: m.texto,
      }));

      // Llamada al endpoint backend /api/chatbot/query
      const url = `${API_BASE_URL.replace(/\/$/, '')}/chatbot/query`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mensaje: consulta,
          conversacion: historial,
          contextoFiltro: filtroActivo,
        }),
      });

      if (!response.ok) {
        throw new Error(`El servidor respondió con código ${response.status}`);
      }

      const resJson: ChatbotAPIResponse = await response.json();
      const payload = resJson.data;

      const nuevoMensajeAsistente: MensajeChatbot = {
        id: `asst-${Date.now()}`,
        remitente: 'asistente',
        texto: payload.respuesta,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fuentes: payload.fuentes,
        sugerencias: payload.sugerencias,
        metadatos: {
          modelo: payload.metadatos?.modelo,
          tiempoRespuestaMs: payload.metadatos?.tiempoRespuestaMs,
          consultaBaseDeDatos: payload.metadatos?.consultaBaseDeDatos,
        },
      };

      setMensajes((prev) => [...prev, nuevoMensajeAsistente]);
    } catch (error) {
      console.warn('[ChatbotRAG] Fallo en conexión con backend LIS, activando contingencia clínica:', error);

      // Respuesta de contingencia clínica amigable sin romper la experiencia del usuario
      const mensajeFallback: MensajeChatbot = {
        id: `err-${Date.now()}`,
        remitente: 'asistente',
        texto: `
### ⚠️ Servicio de Conexión en Mantenimiento

No pude comunicarme con el microservicio en línea (\`${API_BASE_URL}\`).

**Orientación Rápida de Guardia:**
- Si consultas por **Creatinina Jaffe (CREJ2)**: Límite lineal 0.17 a 25.0 mg/dL. Ictericia franca (I > 10) produce interferencia negativa severa (considerar CREP2 Enzimática).
- Si consultas por **Hemólisis**: El índice H > 40 altera drásticamente **Potasio (K+)** y **GOT/AST**. Rechazar o solicitar nueva extracción.
- Si consultas por **Alarma Cobas c501 (Reagent Shortage)**: Purgar burbujas con pipeta capilar y verificar que el casete no esté por debajo de 1.5 mL.
- Si consultas por **Derivaciones**: Carga viral VIH -> Hospital Muñiz (Plasma EDTA congelado a -20°C). Citogenética -> Garrahan (Heparina de sodio a temperatura ambiente, ¡prohibido congelar!).

*Por favor verifica que el backend Labmetrics esté activo o contacta al administrador LIS.*
        `.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        esError: true,
        sugerencias: [
          '🧪 Límites e interferencias HIL de Creatinina Jaffe (CREJ2)',
          '⚙️ Alarma Cobas c501: Reagent Shortage / Foam Detected',
          '🚚 Requisitos para derivar Carga Viral VIH a Hospital Muñiz',
        ],
      };

      setMensajes((prev) => [...prev, mensajeFallback]);
    } finally {
      setIsCargando(false);
    }
  };

  const handleLimpiarHistorial = () => {
    if (window.confirm('¿Deseas reiniciar la conversación con el asistente clínico?')) {
      setMensajes([MENSAJE_INICIAL]);
    }
  };

  return (
    <>
      {/* 🟢 BOTÓN FLOTANTE TRIGGER */}
      {!isOpen && (
        <button
          type="button"
          className="rag-floating-trigger"
          onClick={() => setIsOpen(true)}
          title="Abrir Asistente Clínico Inteligente (RAG LabRamos)"
        >
          <div className="rag-trigger-icon-wrap">
            <Bot size={18} />
            <span className="rag-trigger-pulse"></span>
          </div>
          <div className="rag-trigger-text">
            <span className="rag-trigger-title">Asistente IA</span>
            <span className="rag-trigger-subtitle">Consultas rapidas</span>
          </div>
        </button>
      )}

      {/* 🟢 MODAL / DRAWER PRINCIPAL */}
      {isOpen && (
        <>
          <div className="rag-drawer-backdrop" onClick={() => setIsOpen(false)} />

          <aside className={`rag-drawer-container ${isExpanded ? 'is-expanded' : ''}`}>
            {/* CABECERA */}
            <header className="rag-header">
              <div className="rag-header-top">
                <div className="rag-header-brand">
                  <div className="rag-brand-icon">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h5 className="rag-brand-title">
                      LabRamos Copilot
                      <span className="rag-badge-rag">RAG AI</span>
                    </h5>
                    <div className="rag-brand-status">
                      <span className="rag-status-dot"></span>
                      <span>Insertos reactivos, derivaciones y guía de equipos</span>
                    </div>
                  </div>
                </div>

                <div className="rag-header-actions">
                  <button
                    type="button"
                    className="rag-icon-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                    title={isExpanded ? 'Reducir ancho' : 'Expandir ancho'}
                  >
                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                  <button
                    type="button"
                    className="rag-icon-btn"
                    onClick={handleLimpiarHistorial}
                    title="Reiniciar conversación"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    type="button"
                    className="rag-icon-btn"
                    onClick={() => setIsOpen(false)}
                    title="Cerrar asistente"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* PESTAÑAS DE FILTRO TEMÁTICO */}
              <div className="rag-filter-tabs">
                <button
                  type="button"
                  className={`rag-tab-pill ${filtroActivo === 'todos' ? 'active' : ''}`}
                  onClick={() => setFiltroActivo('todos')}
                >
                  <Layers size={12} />
                  Todos
                </button>
                <button
                  type="button"
                  className={`rag-tab-pill ${filtroActivo === 'insertos' ? 'active' : ''}`}
                  onClick={() => setFiltroActivo('insertos')}
                >
                  <Beaker size={12} />
                  Insertos
                </button>
                <button
                  type="button"
                  className={`rag-tab-pill ${filtroActivo === 'manuales' ? 'active' : ''}`}
                  onClick={() => setFiltroActivo('manuales')}
                >
                  <Cpu size={12} />
                  Manuales Equipos
                </button>

                <button
                  type="button"
                  className={`rag-tab-pill ${filtroActivo === 'derivaciones' ? 'active' : ''}`}
                  onClick={() => setFiltroActivo('derivaciones')}
                >
                  <Truck size={12} />
                  Derivaciones
                </button>
              </div>
            </header>

            {/* ÁREA DE MENSAJES */}
            <main className="rag-messages-area">
              {mensajes.map((m) => {
                const esUsuario = m.remitente === 'usuario';

                if (esUsuario) {
                  return (
                    <div key={m.id} className="rag-message-user">
                      <div>{m.texto}</div>
                      <div className="rag-user-meta">{m.timestamp}</div>
                    </div>
                  );
                }

                return (
                  <div key={m.id} className="rag-message-assistant">
                    <div className={`rag-assistant-card ${m.esError ? 'is-error' : ''}`}>
                      <div className="rag-assistant-header">
                        <div className="rag-assistant-id">
                          <Bot size={15} />
                          <span>Asistente Clínico LabRamos</span>
                        </div>
                        <span className="rag-assistant-timestamp">{m.timestamp}</span>
                      </div>

                      {/* Renderizado Markdown */}
                      <MarkdownRenderer content={m.texto} />

                      {/* Fuentes Citadas */}
                      {m.fuentes && m.fuentes.length > 0 && (
                        <div className="rag-sources-container">
                          <div className="rag-sources-label">
                            <Sparkles size={12} />
                            Fuentes Oficiales Consultadas ({m.fuentes.length}):
                          </div>
                          <div className="rag-sources-list">
                            {m.fuentes.map((f, fIdx) => (
                              <SourceBadge key={`${f.archivoFuente}-${fIdx}`} fuente={f} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metadatos y Modelo */}
                      {m.metadatos && (
                        <div className="rag-message-meta-footer mt-3">
                          <span>
                            Modelo: {m.metadatos.modelo || 'Sintetizador Clínico RAG'}
                            {m.metadatos.consultaBaseDeDatos && ' • 📊 Datos en vivo MySQL'}
                          </span>
                          {m.metadatos.tiempoRespuestaMs && (
                            <span>{m.metadatos.tiempoRespuestaMs} ms</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Sugerencias de seguimiento */}
                    {m.sugerencias && m.sugerencias.length > 0 && (
                      <div className="rag-suggestions-container">
                        {m.sugerencias.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            className="rag-suggestion-chip"
                            onClick={() => handleEnviarConsulta(sug)}
                            disabled={isCargando}
                          >
                            <span>{sug}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Indicador de escritura animado */}
              {isCargando && (
                <div className="rag-typing-container">
                  <div className="rag-typing-dots">
                    <span className="rag-typing-dot"></span>
                    <span className="rag-typing-dot"></span>
                    <span className="rag-typing-dot"></span>
                  </div>
                  <span>Recuperando insertos y procesando respuesta clínica...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </main>

            {/* BARRA DE ENTRADA */}
            <footer className="rag-input-bar-container">
              <form
                className="rag-input-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEnviarConsulta();
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  className="rag-input-field"
                  placeholder={
                    filtroActivo === 'insertos'
                      ? 'Consulta límites o HIL de un reactivo (ej. CREJ2, GLUC3)...'
                      : filtroActivo === 'manuales'
                        ? 'Consulta una alarma o mantenimiento (ej. Cobas 6000, LauraXL)...'
                        : filtroActivo === 'metricas'
                          ? 'Consulta producción, cierres o incidencias en MySQL...'
                          : filtroActivo === 'derivaciones'
                            ? 'Consulta conservación o requisitos para Muñiz, Garrahan...'
                            : 'Pregunta sobre insertos, alarmas de equipos, derivaciones o BD...'
                  }
                  value={inputTexto}
                  onChange={(e) => setInputTexto(e.target.value)}
                  disabled={isCargando}
                  maxLength={1500}
                />

                <button
                  type="submit"
                  className="rag-send-btn"
                  disabled={!inputTexto.trim() || isCargando}
                  title="Enviar consulta"
                >
                  <Send size={16} />
                </button>
              </form>

              <p className="rag-input-disclaimer">
                Asistente analítico de apoyo hospitalario. Validar valores críticos y no conformidades según POEs vigentes.
              </p>
            </footer>
          </aside>
        </>
      )}
    </>
  );
};

export default ChatbotRAG;
