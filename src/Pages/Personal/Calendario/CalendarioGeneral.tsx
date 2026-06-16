// src/components/Calendario/CalendarioGeneral.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Check, ArrowLeft, Trash2, Calendar as CalendarIcon } from 'lucide-react'; 
import toast from 'react-hot-toast';
import { db, auth } from '../../../Credenciales';

interface Props {
  tipo: 'guardia' | 'vacaciones';
  titulo: string;
  defaultColor: string;
}

const PALETA_COLORES = [
  { nombre: 'Azul SaaS', hex: '#4f46e5' },
  { nombre: 'Verde Menta', hex: '#10b981' },
  { nombre: 'Coral', hex: '#f43f5e' },
  { nombre: 'Ambar', hex: '#f59e0b' },
  { nombre: 'Orquídea', hex: '#a855f7' },
];

const SERVICIOS_OPCIONES = [
  'Laboratorio Central',
  'Hematología',
  'Química Clínica',
  'Microbiología',
  'Guardia de Emergencias',
  'Inmunología'
];

const CalendarioGeneral: React.FC<Props> = ({ tipo, titulo, defaultColor }) => {
  const [eventos, setEventos] = useState<any[]>([]);
  const currentUser = auth.currentUser;
  const navigate = useNavigate(); 

  const [servicioSeleccionado, setServicioSeleccionado] = useState<string>('Laboratorio Central');
  const [cargandoPermisos, setCargandoPermisos] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [colorElegido, setColorElegido] = useState(defaultColor);
  const [calendarSelection, setCalendarSelection] = useState<any>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventoAEliminar, setEventoAEliminar] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    const obtenerServicioUsuario = async () => {
      if (!currentUser) {
        setCargandoPermisos(false);
        return;
      }
      try {
        const userDocRef = doc(db, 'usuarios', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().servicio) {
          setServicioSeleccionado(userDoc.data().servicio.trim());
        }
      } catch (error) {
        console.error("Error obteniendo servicio inicial:", error);
      } finally {
        setCargandoPermisos(false);
      }
    };
    obtenerServicioUsuario();
  }, [currentUser]);

  useEffect(() => {
    if (cargandoPermisos) return;

    const q = query(
      collection(db, 'calendarios'), 
      where('tipo', '==', tipo),
      where('servicio', '==', servicioSeleccionado)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.nombre,
          start: d.fechaInicio, 
          end: d.fechaFin,      
          backgroundColor: d.color || defaultColor, 
          borderColor: 'transparent',
          allDay: true,
          extendedProps: { 
            userId: d.userId,
            servicio: d.servicio 
          }
        };
      });
      setEventos(data);
    });
    return () => unsubscribe();
  }, [tipo, defaultColor, servicioSeleccionado, cargandoPermisos]);

  const handleSelect = (selectionInfo: any) => {
    if (!currentUser) {
      toast.error("Debes iniciar sesión para agendar días");
      selectionInfo.view.calendar.unselect();
      return;
    }
    const dateFinInclusiva = new Date(selectionInfo.endStr);
    dateFinInclusiva.setDate(dateFinInclusiva.getDate() - 1);
    
    setFechaInicio(selectionInfo.startStr);
    setFechaFin(dateFinInclusiva.toISOString().split('T')[0]);
    setNombre(currentUser.displayName || "");
    setColorElegido(defaultColor);
    setCalendarSelection(selectionInfo);
    setShowModal(true);
  };

  const guardarRango = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !currentUser) return toast.error("Sesión inválida");

    const dateFinExclusiva = new Date(fechaFin);
    dateFinExclusiva.setDate(dateFinExclusiva.getDate() + 1);

    const loadingToast = toast.loading('Registrando días en agenda...');
    try {
      await addDoc(collection(db, 'calendarios'), {
        nombre: nombre.trim(),
        fechaInicio: fechaInicio,
        fechaFin: dateFinExclusiva.toISOString().split('T')[0], 
        tipo,
        color: colorElegido,
        servicio: servicioSeleccionado,
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      });
      toast.success('Rango agendado con éxito!', { id: loadingToast });
      cerrarModal();
    } catch (error) {
      toast.error('Error al guardar registro', { id: loadingToast });
    }
  };

  const ejecutarEliminacion = async () => {
    if (!eventoAEliminar) return;
    const loadingToast = toast.loading('Removiendo fecha...');
    try {
      await deleteDoc(doc(db, 'calendarios', eventoAEliminar.id));
      toast.success('Reserva cancelada correctamente', { id: loadingToast });
      setShowDeleteModal(false);
      setEventoAEliminar(null);
    } catch (err) {
      toast.error('Error al eliminar registro', { id: loadingToast });
    }
  };

  const cerrarModal = () => {
    if (calendarSelection) calendarSelection.view.calendar.unselect();
    setShowModal(false);
  };

  const handleEventClick = (arg: any) => {
    if (!currentUser) return toast.error("Identificación requerida");
    if (arg.event.extendedProps.userId !== currentUser.uid) {
      return toast.error("Solo el operador titular puede remover esta reserva");
    }
    setEventoAEliminar({ id: arg.event.id, title: arg.event.title });
    setShowDeleteModal(true);
  };

  if (cargandoPermisos) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5 card border-0 bg-white rounded-4 shadow-sm" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-secondary opacity-75" role="status" style={{ width: '1.5rem', height: '1.5rem', borderWidth: '0.15em' }}>
          <span className="visually-hidden">Cargando Agendas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 p-4 bg-white rounded-4 shadow-sm position-relative">
      
      <style>{`
        .fc {
          font-family: inherit;
          --fc-border-color: #f1f5f9 !important;
          --fc-today-bg-color: #f8fafc !important;
        }
        .fc .fc-toolbar {
          margin-bottom: 1.5rem !important;
          gap: 8px;
        }
        .fc .fc-toolbar-title {
          font-size: 1.1rem !important;
          font-weight: 700;
          color: #1e293b !important;
          text-transform: capitalize;
        }
        .fc .fc-button-group .fc-button {
          background-color: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          color: #475569 !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02) !important;
          padding: 5px 10px !important;
          font-size: 0.85rem !important;
          font-weight: 500 !important;
          text-transform: capitalize !important;
        }
        .fc .fc-button-group .fc-button:hover {
          background-color: #f8fafc !important;
          color: #0f172a !important;
        }
        .fc .fc-button-group .fc-button:focus {
          box-shadow: none !important;
        }
        .fc .fc-today-button {
          background-color: #f1f5f9 !important;
          border: none !important;
          color: #334155 !important;
          font-size: 0.8rem !important;
          font-weight: 600 !important;
          padding: 6px 12px !important;
          text-transform: uppercase;
        }
        .fc .fc-today-button:disabled {
          background-color: #f8fafc !important;
          opacity: 0.6;
        }
        .fc .fc-col-header-cell {
          padding: 14px 0 !important;
          font-weight: 600 !important;
          font-size: 0.8rem;
          color: #94a3b8 !important;
          border: none !important;
          background-color: #fafafa;
        }
        .fc-theme-standard th, .fc-theme-standard td {
          border: 1px solid #f3f4f6 !important;
        }
        .fc-scrollgrid {
          border: 1px solid #e5e7eb !important;
          border-radius: 12px;
          overflow: hidden;
        }
        .fc .fc-daygrid-day-number {
          font-size: 0.8rem !important;
          font-weight: 500;
          color: #64748b !important;
          padding: 8px 10px !important;
        }
        .fc-v-event, .fc-h-event {
          background-color: var(--fc-event-bg-color);
          border: none !important;
          padding: 3px 8px !important;
          margin: 2px 4px !important;
          border-radius: 4px !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02) !important;
          cursor: pointer;
        }
        .fc-event-title {
          font-size: 0.75rem !important;
          font-weight: 600 !important;
          letter-spacing: -0.2px;
        }
        .fc .fc-day-today { background-color: #f0fdf4 !important; }
        .fc .fc-day-today .fc-daygrid-day-number { color: #16a34a !important; font-weight: 700; }
        .opacity-40 { opacity: 0.35; background-color: #fafafa; }
        
        .select-servicio-soft {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #334155;
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0.4rem 2rem 0.4rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          outline: none;
          transition: all 0.2s ease;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.7rem center;
          background-size: 0.9rem;
        }
        .select-servicio-soft:hover {
          background-color: #f1f5f9;
          border-color: #cbd5e1;
        }
      `}</style>

      {/* CABECERA CONFIGURADA */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 border-bottom pb-3">
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3">
          <div>
            <h5 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
              <CalendarIcon size={20} className="text-secondary" /> {titulo}
            </h5>
            <p className="text-muted small m-0 mt-1">
              Arrastra el puntero para reservar el rango en el servicio activo.
            </p>
          </div>
          
          {/* SELECTOR DE CALENDARIOS POR SERVICIO */}
          <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
            <select 
              className="select-servicio-soft shadow-sm"
              value={servicioSeleccionado}
              onChange={(e) => setServicioSeleccionado(e.target.value)}
            >
              {SERVICIOS_OPCIONES.map((serv) => (
                <option key={serv} value={serv}>{serv}</option>
              ))}
            </select>
          </div>
        </div>

        {/* SELECTOR DE MÓDULOS DE AGENDA */}
        <div className="btn-group bg-light p-1 rounded-3 border" style={{ fontSize: '0.85rem' }}>
          <button
            onClick={() => navigate('/calendario-guardias')}
            className={`btn btn-sm rounded-2 px-3 border-0 py-1 fw-medium ${tipo === 'guardia' ? 'bg-white text-dark shadow-sm fw-semibold' : 'text-muted bg-transparent'}`}
          >
            Guardias
          </button>
          <button
            onClick={() => navigate('/calendario-vacaciones')}
            className={`btn btn-sm rounded-2 px-3 border-0 py-1 fw-medium ${tipo === 'vacaciones' ? 'bg-white text-dark shadow-sm fw-semibold' : 'text-muted bg-transparent'}`}
          >
            Vacaciones
          </button>
        </div>
      </div>

      {/* CALENDARIO CON SU TOOLBAR INTEGRADA */}
      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          events={eventos} 
          selectable={true}
          selectMirror={true}
          select={handleSelect}
          selectAllow={(info) => new Date(info.startStr).getTime() >= new Date().setHours(0,0,0,0)}
          eventClick={handleEventClick}
          height="auto"
          dayCellClassNames={(arg) => new Date(arg.date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) ? 'opacity-40' : ''}
          headerToolbar={{
            left: 'title',
            center: '',
            right: 'today prev,next'
          }}
        />
      </div>

      {/* MODAL CREAR (SOFT UI) */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.15)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
            <div className="modal-content border-0 shadow rounded-4 bg-white">
              <div className="modal-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex flex-column text-start">
                    <span className="small text-uppercase fw-bold text-muted tracking-wider" style={{ fontSize: '0.65rem' }}>
                      Agendar Período
                    </span>
                    <span className="text-primary fw-semibold small mt-0.5">{servicioSeleccionado}</span>
                  </div>
                  <button type="button" className="btn-close small shadow-none" onClick={cerrarModal}></button>
                </div>
                <form onSubmit={guardarRango}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary mb-1">Nombre del Operador</label>
                    <input type="text" className="form-control form-control-sm bg-light border-0 rounded-3 px-3 py-2 text-dark shadow-none fw-medium" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">Inicio</label>
                      <input type="date" className="form-control form-control-sm bg-light border-0 rounded-3 px-2 py-2 shadow-none small text-muted" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">Fin (Inclusive)</label>
                      <input type="date" className="form-control form-control-sm bg-light border-0 rounded-3 px-2 py-2 shadow-none small text-muted" min={fechaInicio} value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-secondary d-block mb-2">Color de Etiqueta</label>
                    <div className="d-flex gap-2">
                      {PALETA_COLORES.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          className={`btn rounded-circle p-0 border-2 position-relative d-flex align-items-center justify-content-center transition-all ${colorElegido === c.hex ? 'border-dark scale-110' : 'border-white'}`}
                          style={{ backgroundColor: c.hex, width: '26px', height: '26px' }}
                          onClick={() => setColorElegido(c.hex)}
                        >
                          {colorElegido === c.hex && <Check size={12} className="text-white fw-bold" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="d-flex gap-2 pt-1">
                    <button type="button" className="btn btn-light border w-50 rounded-3 py-2 text-secondary btn-sm fw-medium" onClick={cerrarModal}>Cancelar</button>
                    <button type="submit" className="btn btn-dark w-50 rounded-3 py-2 text-white btn-sm fw-medium shadow-none">Confirmar Reserva</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BORRAR */}
      {showDeleteModal && eventoAEliminar && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '340px' }}>
            <div className="modal-content border-0 shadow rounded-4 bg-white">
              <div className="modal-body p-4 text-center">
                <div className="text-danger mb-2 opacity-75"><Trash2 size={24} /></div>
                <h6 className="fw-bold text-dark mb-1">¿Remover de la agenda?</h6>
                <p className="text-muted small mb-4" style={{ lineHeight: '1.4' }}>
                  Eliminarás de forma definitiva la reserva de <br /><strong className="text-dark">"{eventoAEliminar.title}"</strong>.
                </p>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-light border w-50 rounded-3 py-2 text-secondary btn-sm fw-medium" onClick={() => setShowDeleteModal(false)}>Volver</button>
                  <button type="button" className="btn btn-danger w-50 rounded-3 py-2 text-white btn-sm fw-medium shadow-none" onClick={ejecutarEliminacion}>Sí, eliminar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTÓN REGRESAR */}
      <div className="d-flex justify-content-center mt-4">
        <button onClick={() => navigate('/')} className="btn btn-link text-decoration-none text-muted d-inline-flex align-items-center gap-2 small border-0 fw-medium">
          <ArrowLeft size={14} /> Volver al Inicio
        </button>
      </div>
    </div>
  );
};

export default CalendarioGeneral;