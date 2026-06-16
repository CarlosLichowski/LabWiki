// src/components/ChatFlotante.tsx
import React, { useEffect, useState, useRef } from 'react';
import appFirebase from '../../Credenciales';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    query, 
    onSnapshot, 
    addDoc, 
    orderBy, 
    serverTimestamp 
} from 'firebase/firestore';

const auth = getAuth(appFirebase);
const db = getFirestore(appFirebase);

interface Colaborador {
    id: string;
    nombre: string;
    servicio: string;
    role: string;
    email: string;
    online?: boolean;
}

interface Mensaje {
    id: string;
    texto: string;
    remitenteId: string;
    remitenteNombre: string;
    createdAt: any;
}

const ChatFlotante: React.FC = () => {
    // Estados de Interfaz
    const [isOpen, setIsOpen] = useState(false);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [unreadCount, setUnreadCount] = useState(2); // Contador real para el globito externo

    // Estados de Datos de Firebase
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    
    const mensajesEndRef = useRef<HTMLDivElement>(null);

    // Desplazamiento automático al fondo del chat
    const scrollToBottom = () => {
        mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            setUnreadCount(0); // Limpia las notificaciones al abrirlo
        }
    }, [mensajes, isOpen]);

    // 1. Estado de la Sesión de Usuario
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribeAuth();
    }, []);

    // 2. Cargar Colaboradores desde la raíz limpia 'usuarios'
    useEffect(() => {
        if (!currentUser) {
            setColaboradores([]);
            return;
        }

        const q = query(collection(db, 'usuarios'));
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
            const lista: Colaborador[] = [];
            snapshot.forEach((doc) => {
                if (doc.id !== currentUser.uid) {
                    const data = doc.data();
                    lista.push({
                        id: doc.id,
                        nombre: data.nombre || 'Operador',
                        servicio: data.servicio || 'Laboratorio Central',
                        role: data.role || 'Operador',
                        email: data.email || '',
                        online: data.online ?? (Math.random() > 0.3) // Simulación estética si no hay flag nativo
                    });
                }
            });
            setColaboradores(lista);
        }, (error) => {
            console.error("Error al sincronizar usuarios:", error);
        });

        return () => unsubscribeSnapshot();
    }, [currentUser]);

    // 3. Cargar Mensajes del Chat General
    useEffect(() => {
        if (!currentUser) return;

        const q = query(collection(db, 'chat_laboratorio'), orderBy('createdAt', 'asc'));
        const unsubscribeChat = onSnapshot(q, (snapshot) => {
            const listaMensajes: Mensaje[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                listaMensajes.push({
                    id: doc.id,
                    texto: data.texto,
                    remitenteId: data.remitenteId,
                    remitenteNombre: data.remitenteNombre || 'Operador',
                    createdAt: data.createdAt
                });
            });
            setMensajes(listaMensajes);
            
            // Si el chat está cerrado, incrementa el badge simulando actividad
            if (!isOpen && listaMensajes.length > 0) {
                setUnreadCount(prev => prev + 1);
            }
        }, (error) => {
            console.error("Error al sincronizar mensajes:", error);
        });

        return () => unsubscribeChat();
    }, [currentUser, isOpen]);

    // 4. Enviar Mensaje
    const handleEnviarMensaje = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoMensaje.trim() || !currentUser) return;

        try {
            await addDoc(collection(db, 'chat_laboratorio'), {
                texto: nuevoMensaje.trim(),
                remitenteId: currentUser.uid,
                remitenteNombre: currentUser.displayName || 'Carlos Lichowski',
                createdAt: serverTimestamp()
            });
            setNuevoMensaje('');
        } catch (error) {
            console.error("Error al escribir en chat_laboratorio:", error);
        }
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp) return 'Ahora';
        const date = timestamp.toDate();
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Iniciales para el Avatar de la lista lateral
    const getIniciales = (nombre: string) => {
        return nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    };

    return (
        <div className="labwiki-chat-wrapper">
            
            {/* BOTÓN FLOTANTE ESTILO ORIGINAL */}
            <button 
                className="btn-chat-trigger shadow-lg d-flex align-items-center justify-content-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? (
                    <i className="bi bi-x-lg text-white fs-4"></i>
                ) : (
                    <div className="position-relative d-flex align-items-center justify-content-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.2L4 17.2V4H20V16Z" fill="white"/>
                            <path d="M7 9H17V11H7V9ZM7 6H17V8H7V6ZM7 12H14V14H7V12Z" fill="white"/>
                        </svg>
                        {unreadCount > 0 && (
                            <span className="badge-notificacion-real d-flex align-items-center justify-content-center">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                )}
            </button>

            {/* VENTANA DE CHAT INTEGRAL (DOS COLUMNAS) */}
            {isOpen && (
                <div className="chat-window-panel shadow-2xl border-0 d-flex animate__animated animate__fadeInUp">
                    
                    {/* BARRA LATERAL IZQUIERDA: COLABORADORES */}
                    <div className="sidebar-colaboradores d-flex flex-column border-end">
                        <div className="sidebar-header p-3 border-bottom d-flex align-items-center justify-content-between">
                            <span className="fw-bold text-uppercase tracking-wider text-muted text-start" style={{ fontSize: '0.72rem' }}>
                                Colaboradores
                            </span>
                            <i className="bi bi-filter-right text-muted fs-5 cursor-pointer"></i>
                        </div>
                        <div className="sidebar-scroll flex-grow-1 overflow-y-auto p-2">
                            {/* Chat General Fijo arriba de la lista */}
                            <div className="colab-item item-active-general mb-1 d-flex align-items-center gap-2.5 p-2 rounded-3">
                                <div className="avatar-room bg-primary d-flex align-items-center justify-content-center text-white rounded-circle shadow-sm">
                                    <i className="bi bi-people-fill fs-6"></i>
                                </div>
                                <div className="flex-grow-1 text-start">
                                    <div className="fw-bold text-dark small leading-none mb-0.5">Chat General</div>
                                    <span className="text-muted d-block text-truncate" style={{ fontSize: '0.68rem' }}>Todo el equipo</span>
                                </div>
                            </div>

                            {/* Listado dinámico de compañeros de guardia */}
                            {colaboradores.map((colab) => (
                                <div key={colab.id} className="colab-item d-flex align-items-center justify-content-between p-2 rounded-3 mb-1">
                                    <div className="d-flex align-items-center gap-2.5 w-85">
                                        <div className="avatar-user-fake position-relative d-flex align-items-center justify-content-center rounded-circle text-primary fw-bold bg-primary bg-opacity-10 small">
                                            {getIniciales(colab.nombre)}
                                            <span className={`status-dot position-absolute bottom-0 end-0 rounded-circle border border-white ${colab.online ? 'bg-success' : 'bg-secondary'}`}></span>
                                        </div>
                                        <div className="text-start text-truncate">
                                            <div className="fw-bold text-dark small leading-tight text-truncate mb-0.5">{colab.nombre}</div>
                                            <span className="text-muted d-block text-truncate" style={{ fontSize: '0.65rem' }}>
                                                {colab.servicio.split(' ')[0]} • {colab.role}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: SALA DE CHAT ACTIVA */}
                    <div className="chat-main-content d-flex flex-column bg-white">
                        
                        {/* CABECERA DE LA SALA */}
                        <div className="chat-main-header text-white p-3 d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-2.5">
                                <div className="header-avatar bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                                    <i className="bi bi-chat-left-heart-fill text-white fs-5"></i>
                                </div>
                                <div className="text-start">
                                    <h6 className="mb-0 fw-bold fs-6 leading-tight">Sala General de Operadores</h6>
                                    <span className="d-block text-white-50" style={{ fontSize: '0.68rem' }}>Canal Abierto • Guardia Interna</span>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <i className="bi bi-camera-video text-white opacity-75 cursor-pointer fs-5 d-none d-sm-block"></i>
                                <button className="btn btn-link text-white p-0 border-0 opacity-85" onClick={() => setIsOpen(false)}>
                                    <i className="bi bi-x-lg fs-5"></i>
                                </button>
                            </div>
                        </div>

                        {/* CUERPO DE MENSAJES */}
                        <div className="chat-messages-container flex-grow-1 overflow-y-auto p-3 bg-light bg-opacity-30">
                            {mensajes.length === 0 ? (
                                <div className="text-center text-muted my-auto py-5 small">
                                    <i className="bi bi-chat-left-dots fs-3 d-block mb-2 opacity-40"></i>
                                    Historial vacío. Iniciá la conversación en la guardia.
                                </div>
                            ) : (
                                mensajes.map((msg) => {
                                    const esMio = currentUser && msg.remitenteId === currentUser.uid;
                                    return (
                                        <div key={msg.id} className={`d-flex flex-column mb-3.5 ${esMio ? 'align-items-end' : 'align-items-start'}`}>
                                            <span className="text-muted fw-semibold mb-1" style={{ fontSize: '0.68rem', paddingLeft: esMio ? '0':'4px', paddingRight: esMio ? '4px':'0' }}>
                                                {esMio ? 'Vos' : msg.remitenteNombre}
                                            </span>
                                            <div className={`p-2.5 px-3 rounded-4 message-bubble-modern ${esMio ? 'bg-primary text-white bubble-sender' : 'bg-white text-dark border border-light-subtle'}`}>
                                                <p className="mb-0 small text-break text-start" style={{ lineHeight: '1.4' }}>{msg.texto}</p>
                                            </div>
                                            <span className="text-muted mt-1 px-1" style={{ fontSize: '0.60rem' }}>
                                                {formatTime(msg.createdAt)} {esMio && <i className="bi bi-check2-all text-primary ms-0.5"></i>}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={mensajesEndRef} />
                        </div>

                        {/* CAJA DE TEXTO PARA ENVIAR (ESTILO CAPTURA) */}
                        <form onSubmit={handleEnviarMensaje} className="chat-footer-input p-2.5 border-top bg-white">
                            <div className="input-group input-group-pill bg-light bg-opacity-75 border rounded-pill px-2 py-0.5 align-items-center">
                                <button type="button" className="btn btn-link p-1 text-muted border-0 hover-text-dark">
                                    <i className="bi bi-paperclip fs-5"></i>
                                </button>
                                <input 
                                    type="text" 
                                    className="form-control bg-transparent border-0 small shadow-none"
                                    placeholder="Escribe un mensaje al grupo..."
                                    value={nuevoMensaje}
                                    onChange={(e) => setNuevoMensaje(e.target.value)}
                                    style={{ fontSize: '0.85rem' }}
                                />
                                <button type="submit" className="btn btn-primary btn-send-pill d-flex align-items-center justify-content-center rounded-circle">
                                    <i className="bi bi-send-fill text-white" style={{ fontSize: '0.78rem' }}></i>
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

            {/* ESTILOS INTERNOS DE CORRECCIÓN VISUAL */}
            <style>{`
                .labwiki-chat-wrapper {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    z-index: 2500;
                    font-family: system-ui, -apple-system, sans-serif;
                }
                .btn-chat-trigger {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    border: none;
                    background-color: #1a66ff;
                    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s;
                }
                .btn-chat-trigger:hover {
                    transform: scale(1.05);
                    background-color: #0052cc;
                }
                .badge-notificacion-real {
                    position: absolute;
                    top: -14px;
                    right: -14px;
                    background-color: #ff3b30;
                    color: white;
                    font-size: 0.68rem;
                    font-weight: bold;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 2px solid #ffffff;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                }
                .chat-window-panel {
                    position: absolute;
                    bottom: 72px;
                    right: 0;
                    width: 580px;
                    height: 500px;
                    border-radius: 16px;
                    background: #ffffff;
                    box-shadow: 0 12px 42px rgba(0,0,0,0.14);
                    overflow: hidden;
                }
                /* Dos Columnas */
                .sidebar-colaboradores {
                    width: 190px;
                    background-color: #f8fafc;
                }
                .chat-main-content {
                    width: 390px;
                }
                .chat-main-header {
                    background: linear-gradient(135deg, #1a66ff 0%, #0052cc 100%);
                }
                /* Elementos de la lista lateral */
                .colab-item {
                    transition: background-color 0.15s;
                }
                .colab-item:hover {
                    background-color: #f1f5f9;
                }
                .item-active-general {
                    background-color: #e0f2fe !important;
                }
                .avatar-room {
                    width: 32px;
                    height: 32px;
                    min-width: 32px;
                }
                .avatar-user-fake {
                    width: 32px;
                    height: 32px;
                    min-width: 32px;
                    font-size: 0.72rem;
                }
                .status-dot {
                    width: 9px;
                    height: 9px;
                    bottom: 1px;
                    right: 1px;
                }
                /* Estilos de Burbujas Modernas */
                .message-bubble-modern {
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                    max-width: 85%;
                }
                .bubble-sender {
                    background: linear-gradient(135deg, #1a66ff 0%, #1056e3 100%) !important;
                }
                /* Modificaciones del Input */
                .input-group-pill {
                    background-color: #f1f5f9 !important;
                }
                .btn-send-pill {
                    width: 28px;
                    height: 28px;
                    padding: 0;
                    background-color: #1a66ff;
                    border: none;
                }
                .btn-send-pill:hover {
                    background-color: #0052cc;
                }
                /* Scrollbars Minimalistas */
                .overflow-y-auto::-webkit-scrollbar {
                    width: 4px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: transparent;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .w-85 { width: 85%; }
                .mb-0.5 { margin-bottom: 0.125rem; }
                .mb-3.5 { margin-bottom: 0.85rem; }
                .p-2.5 { padding: 0.65rem !important; }
                .px-2.5 { padding-left: 0.65rem !important; padding-right: 0.65rem !important; }
            `}</style>
        </div>
    );
};

export default ChatFlotante;