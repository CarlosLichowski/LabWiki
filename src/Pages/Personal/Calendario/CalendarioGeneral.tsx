import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Info, X, Check, ArrowLeft, Trash2 } from 'lucide-react'; 
import toast from 'react-hot-toast';
import { db, auth } from '../../../Credenciales';

interface Props {
  tipo: 'guardia' | 'vacaciones';
  titulo: string;
  defaultColor: string;
}

const PALETA_COLORES = [
  { nombre: 'Azul', hex: '#3b82f6' },
  { nombre: 'Verde', hex: '#10b981' },
  { nombre: 'Rojo', hex: '#ef4444' },
  { nombre: 'Naranja', hex: '#f59e0b' },
  { nombre: 'Morado', hex: '#8b5cf6' },
];

const CalendarioGeneral: React.FC<Props> = ({ tipo, titulo, defaultColor }) => {
  const [eventos, setEventos] = useState<any[]>([]);
  const currentUser = auth.currentUser;
  const navigate = useNavigate(); 

  const [esAutorizado, setEsAutorizado] = useState<boolean | null>(null);
  const [cargandoPermisos, setCargandoPermisos] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [colorElegido, setColorElegido] = useState(defaultColor);
  const [calendarSelection, setCalendarSelection] = useState<any>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventoAEliminar, setEventoAEliminar] = useState<{ id: string; title: string } | null>(null);

  // 🟢 EFECTO CORREGIDO CON CLÁUSULA DE GUARDA PARA LA AUTENTICACIÓN
  useEffect(() => {
    const verificarSector = async () => {
      // Si la sesión de Firebase aún no determinó el usuario, evitamos la consulta
      if (!currentUser) {
        setEsAutorizado(false);
        setCargandoPermisos(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'usuarios', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().servicio?.trim() === 'Laboratorio Central') {
          setEsAutorizado(true);
        } else {
          setEsAutorizado(false);
        }
      } catch (error) {
        console.error("❌ Error al consultar Firestore:", error);
        setEsAutorizado(false);
      } finally {
        setCargandoPermisos(false);
      }
    };

    verificarSector();
  }, [currentUser]);

  useEffect(() => {
    if (!esAutorizado) return;

    const q = query(collection(db, 'calendarios'), where('tipo', '==', tipo));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.nombre,
          start: d.fechaInicio, 
          end: d.fechaFin,      
          backgroundColor: d.color || defaultColor, 
          borderColor: d.color || defaultColor,
          allDay: true,
          extendedProps: { userId: d.userId }
        };
      });
      setEventos(data);
    });
    return () => unsub();
  }, [tipo, defaultColor, esAutorizado]);

  const handleSelect = (selectionInfo: any) => {
    if (!currentUser) {
      toast.error("Debes iniciar sesión");
      selectionInfo.view.calendar.unselect();
      return;
    }
    const dateFinInclusiva = new Date(selectionInfo.endStr);
    dateFinInclusiva.setDate(dateFinInclusiva.getDate() - 1);
    const endStrInclusiva = dateFinInclusiva.toISOString().split('T')[0];

    setFechaInicio(selectionInfo.startStr);
    setFechaFin(endStrInclusiva);
    setNombre(currentUser.displayName || "");
    setColorElegido(defaultColor);
    setCalendarSelection(selectionInfo);
    setShowModal(true);
  };

  const guardarRango = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !currentUser) return toast.error("Por favor, inicia sesión");

    const dateFinExclusiva = new Date(fechaFin);
    dateFinExclusiva.setDate(dateFinExclusiva.getDate() + 1);
    const endStrExclusiva = dateFinExclusiva.toISOString().split('T')[0];

    const loadingToast = toast.loading('Guardando rango de días...');

    try {
      await addDoc(collection(db, 'calendarios'), {
        nombre: nombre.trim(),
        fechaInicio: fechaInicio,
        fechaFin: endStrExclusiva, 
        tipo,
        color: colorElegido,
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      });
      toast.success('Rango registrado correctamente!', { id: loadingToast });
      cerrarModal();
    } catch (error) {
      toast.error('Error al guardar en la base de datos', { id: loadingToast });
    }
  };

  const cerrarModal = () => {
    if (calendarSelection) calendarSelection.view.calendar.unselect();
    setShowModal(false);
    setNombre('');
  };

  const handleEventClick = (arg: any) => {
    if (!currentUser) return toast.error("Inicia sesión");
    if (arg.event.extendedProps.userId !== currentUser.uid) {
      return toast.error("Solo el dueño puede borrar este registro");
    }
    setEventoAEliminar({ id: arg.event.id, title: arg.event.title });
    setShowDeleteModal(true);
  };

  const ejecutarEliminacion = async () => {
    if (!eventoAEliminar) return;
    const loadingToast = toast.loading('Eliminando registro...');
    try {
      await deleteDoc(doc(db, 'calendarios', eventoAEliminar.id));
      toast.success('Registro eliminado', { id: loadingToast });
      setShowDeleteModal(false);
      setEventoAEliminar(null);
    } catch (error) {
      toast.error('Error al eliminar', { id: loadingToast });
    }
  };

  const handleSelectAllow = (selectInfo: any) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicioSeleccionado = new Date(selectInfo.startStr);
    inicioSeleccionado.setMinutes(inicioSeleccionado.getMinutes() + inicioSeleccionado.getTimezoneOffset());
    return inicioSeleccionado >= hoy;
  };

  if (cargandoPermisos) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5 card shadow-sm border-0 bg-white rounded-4">
        <div className="spinner-border text-primary border-2" role="status" style={{ width: '2rem', height: '2rem' }}>
          <span className="visually-hidden">Cargando verificación...</span>
        </div>
      </div>
    );
  }

  if (!esAutorizado) {
    return (
      <div className="card shadow-sm border-0 p-5 bg-white rounded-4 text-center">
        <h4 className="fw-bold text-dark mb-2">Acceso Restringido</h4>
        <p className="text-secondary mx-auto" style={{ maxWidth: '450px' }}>
          Lo sentimos, esta sección de gestión de turnos es exclusiva para el personal del sector <strong>Laboratorio Central</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0 p-4 bg-white rounded-4 position-relative">
      
      {/* 🌟 ESTILOS CSS INYECTADOS PARA OVERRIDE MINIMALISTA DE FULLCALENDAR */}
      <style>{`
        /* Tipografía general y bordes suaves */
        .fc {
          font-family: inherit;
          --fc-border-color: #f1f5f9 !important; /* Slate 100 */
          --fc-today-bg-color: #f8fafc !important; /* Slate 50 */
        }
        
        /* Cabecera de días (Lu, Ma, Mi...) */
        .fc .fc-col-header-cell {
          padding: 12px 0 !important;
          font-weight: 600 !important;
          text-transform: capitalize;
          font-size: 0.85rem;
          color: #64748b !important; /* Slate 500 */
          border: none !important;
        }

        /* Quitar bordes externos toscos */
        .fc-theme-standard th, .fc-theme-standard td {
          border: 1px solid #f1f5f9 !important;
        }
        .fc-scrollgrid {
          border: none !important;
          border-radius: 12px;
          overflow: hidden;
        }

        /* Estilo de los Números de los Días */
        .fc .fc-daygrid-day-number {
          font-size: 0.85rem !important;
          font-weight: 500;
          color: #475569 !important; /* Slate 600 */
          padding: 8px 10px !important;
        }

        /* Customización de los Bloques de Eventos (Guardias/Vacaciones) */
        .fc-v-event, .fc-h-event {
          background-color: var(--fc-event-bg-color);
          border: none !important;
          padding: 4px 10px !important;
          margin-top: 3px !important;
          margin-bottom: 3px !important;
          border-radius: 6px !important; /* Soft UI rounded corner */
          box-shadow: 0 2px 4px rgba(0,0,0,0.04) !important;
          transition: transform 0.15s ease, opacity 0.15s ease;
          cursor: pointer;
        }

        .fc-v-event:hover, .fc-h-event:hover {
          transform: translateY(-1px);
          opacity: 0.95;
        }

        .fc-event-title {
          font-size: 0.8rem !important;
          font-weight: 600 !important;
          letter-spacing: -0.01em;
        }

        /* Remover los botones por defecto feos de FullCalendar */
        .fc .fc-toolbar {
          margin-bottom: 0px !important;
          display: none !important; /* Lo manejamos con nuestro propio HTML arriba */
        }

        /* Celda del dia actual (Today) */
        .fc .fc-day-today {
          background-color: #f0fdf4 !important; 
        }
        .fc .fc-day-today .fc-daygrid-day-number {
          color: #16a34a !important; 
          font-weight: 700;
        }
      `}</style>

      {/* CABECERA MINIMALISTA */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark d-flex align-items-center gap-2 mb-1" style={{ letterSpacing: '-0.02em' }}>
            {titulo}
          </h4>
          <p className="text-muted small mb-0 d-flex align-items-center gap-1.5">
            <Info size={14} className="text-secondary" /> Arrastrá sobre el calendario para reservar tus días.
          </p>
        </div>

        {/* CONTROLES DE CAMBIO DE MÓDULO */}
        <div className="d-flex align-items-center gap-3 w-100 w-md-auto justify-content-between">
          <div className="btn-group bg-light p-1 rounded-3 border border-light-subtle">
            <button
              onClick={() => navigate('/calendario-guardias')}
              className={`btn btn-sm rounded-3 px-3 fw-medium transition-all py-1.5 border-0 ${
                tipo === 'guardia' ? 'bg-white text-dark shadow-sm fw-semibold' : 'text-secondary bg-transparent'
              }`}
            >
              Guardias
            </button>
            <button
              onClick={() => navigate('/calendario-vacaciones')}
              className={`btn btn-sm rounded-3 px-3 fw-medium transition-all py-1.5 border-0 ${
                tipo === 'vacaciones' ? 'bg-white text-dark shadow-sm fw-semibold' : 'text-secondary bg-transparent'
              }`}
            >
              Vacaciones
            </button>
          </div>
        </div>
      </div>

      {/* CONTENEDOR DEL CALENDARIO */}
      <div className="calendar-container border-0 rounded-4 p-0 bg-white">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          events={eventos} 
          selectable={true}
          selectMirror={true}
          select={handleSelect}
          selectAllow={handleSelectAllow}
          eventClick={handleEventClick}
          height="auto"
          dayCellClassNames={(arg) => {
            const date = new Date(arg.date);
            date.setHours(0,0,0,0);
            const today = new Date();
            today.setHours(0,0,0,0);
            return date < today ? 'bg-light opacity-40' : '';
          }}
        />
      </div>

      {/* MODAL DE CREACIÓN */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 bg-white overflow-hidden">
              <div className="modal-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold text-dark m-0">Agendar {tipo === 'guardia' ? 'Guardia' : 'Vacaciones'}</h6>
                  <button type="button" className="btn btn-link text-secondary p-1 rounded-circle bg-light border-0" onClick={cerrarModal}>
                    <X size={16} />
                  </button>
                </div>
                <form onSubmit={guardarRango}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted mb-1">Funcionario</label>
                    <input type="text" className="form-control form-control-sm bg-light border-0 rounded-3 px-3 py-2 text-dark shadow-none" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted mb-1">Desde</label>
                      <input type="date" className="form-control form-control-sm bg-light border-0 rounded-3 px-3 py-2 shadow-none" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted mb-1">Hasta (Inclusive)</label>
                      <input type="date" className="form-control form-control-sm bg-light border-0 rounded-3 px-3 py-2 shadow-none" min={fechaInicio} value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-muted d-block mb-1.5">Color identificador</label>
                    <div className="d-flex gap-2">
                      {PALETA_COLORES.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          className={`btn rounded-circle p-2.5 border-2 position-relative transition-all ${colorElegido === c.hex ? 'border-dark scale-110 shadow-sm' : 'border-white'}`}
                          style={{ backgroundColor: c.hex, width: '28px', height: '28px' }}
                          onClick={() => setColorElegido(c.hex)}
                        >
                          {colorElegido === c.hex && <Check size={10} className="text-white position-absolute top-50 start-50 translate-middle fw-bold" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="d-flex gap-2 pt-2">
                    <button type="button" className="btn btn-light bg-secondary-subtle border-0 w-50 rounded-3 fw-medium py-2 text-dark btn-sm" onClick={cerrarModal}>Cancelar</button>
                    <button type="submit" className={`btn ${tipo === 'guardia' ? 'btn-primary' : 'btn-success'} border-0 w-50 rounded-3 fw-medium py-2 text-white btn-sm shadow-none`}>Confirmar</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ELIMINACIÓN */}
      {showDeleteModal && eventoAEliminar && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '360px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 bg-white">
              <div className="modal-body p-4 text-center">
                <div className="d-inline-flex p-2.5 bg-danger-subtle text-danger rounded-circle mb-3">
                  <Trash2 size={22} />
                </div>
                <h6 className="fw-bold text-dark mb-1">¿Remover registro?</h6>
                <p className="text-muted small mb-4">
                  Vas a eliminar el bloque de días de <br /><strong className="text-dark">"{eventoAEliminar.title}"</strong>.
                </p>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-light bg-secondary-subtle border-0 w-50 rounded-3 fw-medium py-2 text-dark btn-sm" onClick={() => { setShowDeleteModal(false); setEventoAEliminar(null); }}>Volver</button>
                  <button type="button" className="btn btn-danger border-0 w-50 rounded-3 fw-medium py-2 text-white btn-sm shadow-none" onClick={ejecutarEliminacion}>Sí, eliminar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTÓN INFERIOR DE RETORNO */}
      <div className="d-flex justify-content-center mt-4">
        <Link to="/" className="btn btn-light bg-light text-secondary border-0 d-inline-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-semibold transition-all small" style={{ textDecoration: 'none' }}>
          <ArrowLeft size={14} /> <span>Volver al Inicio</span>
        </Link>
      </div>
    </div>
  );
};

export default CalendarioGeneral;