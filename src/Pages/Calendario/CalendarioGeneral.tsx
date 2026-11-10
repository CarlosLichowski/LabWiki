// src/components/Calendario/CalendarioGeneral.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Check, ArrowLeft, Trash2, Plus } from 'lucide-react'; 
import toast from 'react-hot-toast';
import { db, auth } from '../../Credenciales';
import '../../css/CalendarioVacaciones.css';

interface Props {
  tipo: 'guardia' | 'vacaciones';
  titulo: string;
  defaultColor: string;
}

const PALETA_COLORES = [
  { nombre: 'Azul SaaS', hex: '#0f172a' },
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

  const handleOpenManualModal = () => {
    if (!currentUser) {
      toast.error("Debes iniciar sesión para agendar días");
      return;
    }
    const hoy = new Date().toISOString().split('T')[0];
    setFechaInicio(hoy);
    setFechaFin(hoy);
    setNombre(currentUser.displayName || "");
    setColorElegido(defaultColor);
    setShowModal(true);
  };

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
      <div className="spinner-container">
        <div className="spinner-element"></div>
      </div>
    );
  }

  return (
    <div className="calendario-page-container">
      <div className="calendario-main-wrapper">
        
        {/* CABECERA SUPERIOR */}
        <div className="cal-top-header">
          <div className="cal-title-block">
            <h1 className="cal-main-title">{titulo}</h1>
            <p className="cal-main-subtitle">
              Arrastra o toca un día para reservar el rango en el servicio activo.
            </p>
          </div>
          
          <button className="btn-asignar-guardia" onClick={handleOpenManualModal}>
            <Plus size={18} />
            <span>Asignar {tipo === 'guardia' ? 'Guardia' : 'Vacaciones'}</span>
          </button>
        </div>

        {/* TARJETA DE CONTROLES / FILTROS */}
        <div className="cal-controls-card">
          <div className="select-servicio-group">
            <label className="select-servicio-label">Servicio Seleccionado</label>
            <div className="select-servicio-wrapper">
              <select 
                className="select-servicio-soft"
                value={servicioSeleccionado}
                onChange={(e) => setServicioSeleccionado(e.target.value)}
              >
                {SERVICIOS_OPCIONES.map((serv) => (
                  <option key={serv} value={serv}>{serv}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="cal-tabs-group">
            <button
              onClick={() => navigate('/calendario-guardias')}
              className={`cal-tab-btn ${tipo === 'guardia' ? 'active' : ''}`}
            >
              Guardias
            </button>
            <button
              onClick={() => navigate('/calendario-vacaciones')}
              className={`cal-tab-btn ${tipo === 'vacaciones' ? 'active' : ''}`}
            >
              Vacaciones
            </button>
          </div>
        </div>

        {/* GRAPPER DE FULLCALENDAR */}
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

        {/* BOTÓN REGRESAR */}
        <div className="footer-navigation-area">
          <button onClick={() => navigate('/')} className="btn-nav-link">
            <ArrowLeft size={16} /> Volver al Inicio
          </button>
        </div>

      </div>

      {/* MODAL CREAR */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-sheet">
            <div className="modal-header-custom">
              <div>
                <span className="modal-tag-subtitle">Agendar Período</span>
                <div className="modal-service-name">{servicioSeleccionado}</div>
              </div>
              <button type="button" className="modal-close-btn" onClick={cerrarModal}>&times;</button>
            </div>
            
            <form onSubmit={guardarRango}>
              <div className="form-group">
                <label className="form-label-custom">Nombre </label>
                <input type="text" className="form-control-custom" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              </div>
              
              <div className="form-row-grid">
                <div className="form-group">
                  <label className="form-label-custom">Inicio</label>
                  <input type="date" className="form-control-custom" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label-custom">Fin (Inclusive)</label>
                  <input type="date" className="form-control-custom" min={fechaInicio} value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />
                </div>
              </div>
              
              <div className="form-group mb-1-5">
                <label className="form-label-custom">Color de Etiqueta</label>
                <div className="color-picker-grid">
                  {PALETA_COLORES.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      className={`color-circle-btn ${colorElegido === c.hex ? 'selected' : ''}`}
                      style={{ backgroundColor: c.hex }}
                      onClick={() => setColorElegido(c.hex)}
                    >
                      {colorElegido === c.hex && <Check size={12} className="check-icon-white" />}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="modal-actions-layout">
                <button type="button" className="btn-custom btn-custom-light" onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className="btn-custom btn-custom-dark">Confirmar Reserva</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BORRAR */}
      {showDeleteModal && eventoAEliminar && (
        <div className="modal-overlay">
          <div className="modal-sheet modal-sheet-compact">
            <div className="delete-icon-wrapper">
              <Trash2 size={24} />
            </div>
            <h4 className="delete-modal-title">¿Remover de la agenda?</h4>
            <p className="delete-modal-desc">
              Eliminarás de forma definitiva la reserva de <br /><strong>"{eventoAEliminar.title}"</strong>.
            </p>
            <div className="modal-actions-layout">
              <button type="button" className="btn-custom btn-custom-light" onClick={() => setShowDeleteModal(false)}>Volver</button>
              <button type="button" className="btn-custom btn-custom-danger" onClick={ejecutarEliminacion}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioGeneral;