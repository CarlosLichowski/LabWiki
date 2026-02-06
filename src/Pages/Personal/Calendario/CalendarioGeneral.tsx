import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { db, auth } from '../../../Credenciales';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Calendar, Info, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  tipo: 'guardia' | 'vacaciones';
  titulo: string;
  defaultColor: string;
}

const PALETA_COLORES = [
  { nombre: 'Azul', hex: '#2563eb' },
  { nombre: 'Verde', hex: '#10b981' },
  { nombre: 'Rojo', hex: '#ef4444' },
  { nombre: 'Naranja', hex: '#f59e0b' },
  { nombre: 'Morado', hex: '#8b5cf6' },
];

const CalendarioGeneral: React.FC<Props> = ({ tipo, titulo, defaultColor }) => {
  const [eventos, setEventos] = useState<any[]>([]);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const q = query(collection(db, 'calendarios'), where('tipo', '==', tipo));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.nombre,
          start: d.fechaInicio || d.fecha, 
          end: d.fechaFin || d.fecha,      
          backgroundColor: d.color || defaultColor, 
          borderColor: d.color || defaultColor,
          allDay: true,
          extendedProps: { userId: d.userId }
        };
      });
      setEventos(data);
    });
    return () => unsub();
  }, [tipo, defaultColor]);

  const handleSelect = async (selectionInfo: any) => {
    if (!currentUser) return toast.error("Debes iniciar sesión");

    // --- VALIDACIÓN DE FECHAS PASADAS ---
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Seteamos a medianoche para permitir el día actual
    const fechaSeleccionada = new Date(selectionInfo.startStr);
    
    // Ajuste de zona horaria para la comparación
    fechaSeleccionada.setMinutes(fechaSeleccionada.getMinutes() + fechaSeleccionada.getTimezoneOffset());

    if (fechaSeleccionada < hoy) {
      toast.error("No puedes registrar eventos en fechas pasadas", {
        icon: <Lock size={18} className="text-danger" />
      });
      selectionInfo.view.calendar.unselect();
      return;
    }

    const nombre = prompt(`Nombre para el registro:`, currentUser.displayName || "");
    if (!nombre || nombre.trim() === "") {
        selectionInfo.view.calendar.unselect();
        return;
    }

    const colorElegido = prompt("Color: 1.Azul, 2.Verde, 3.Rojo, 4.Naranja, 5.Morado", "1");
    const indice = parseInt(colorElegido || "1") - 1;
    const colorFinal = PALETA_COLORES[indice]?.hex || defaultColor;

    const loadingToast = toast.loading('Guardando...');

    try {
      await addDoc(collection(db, 'calendarios'), {
        nombre: nombre.trim(),
        fechaInicio: selectionInfo.startStr,
        fechaFin: selectionInfo.endStr, 
        tipo,
        color: colorFinal,
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      });
      toast.success('Guardado correctamente', { id: loadingToast });
    } catch (error) {
      toast.error('Error al guardar', { id: loadingToast });
    }
    
    selectionInfo.view.calendar.unselect();
  };

  const handleEventClick = async (arg: any) => {
    if (!currentUser) return toast.error("Inicia sesión");
    if (arg.event.extendedProps.userId !== currentUser.uid) {
      return toast.error("Solo el dueño puede borrar este registro");
    }

    if (window.confirm(`¿Eliminar "${arg.event.title}"?`)) {
      try {
        await deleteDoc(doc(db, 'calendarios', arg.event.id));
        toast.success('Eliminado');
      } catch (error) {
        toast.error('Error al eliminar');
      }
    }
  };

  return (
    <div className="card shadow-sm border-0 p-4 bg-white rounded-4 overflow-hidden">
      <div className="mb-4">
        <h3 className="fw-bold text-dark d-flex align-items-center gap-2">
          <Calendar className="text-primary" size={28} /> {titulo}
        </h3>
        <p className="text-muted small d-flex align-items-center gap-2">
          <Info size={16} className="text-info" /> 
          Selecciona un rango de fechas. Las fechas pasadas están bloqueadas.
        </p>
      </div>

      <div className="calendar-container border rounded-4 p-3 bg-light">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          events={eventos}
          selectable={true}
          selectMirror={true}
          select={handleSelect}
          eventClick={handleEventClick}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: ''
          }}
          height="auto"
          eventClassNames="rounded-pill px-2 border-0 shadow-sm fw-bold"
          // Estilo visual para días pasados (opcional, los pone un poco más grises)
          dayCellClassNames={(arg) => {
            const date = new Date(arg.date);
            date.setHours(0,0,0,0);
            const today = new Date();
            today.setHours(0,0,0,0);
            return date < today ? 'bg-light opacity-50' : '';
          }}
        />
      </div>
    </div>
  );
};

export default CalendarioGeneral;