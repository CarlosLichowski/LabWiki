import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { db, auth } from '../../../Credenciales';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc } from 'firebase/firestore';
import { Calendar } from 'lucide-react';
import toast from 'react-hot-toast'; // <--- Importamos toast

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
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().nombre,
        start: doc.data().fecha,
        backgroundColor: doc.data().color || defaultColor, 
        borderColor: doc.data().color || defaultColor,
        allDay: true,
        extendedProps: { userId: doc.data().userId }
      }));
      setEventos(data);
    });
    return () => unsub();
  }, [tipo, defaultColor]);

  const handleDateClick = async (arg: any) => {
    if (!currentUser) return toast.error("Debes iniciar sesión para editar");

    const nombre = prompt(`Nombre para el ${arg.dateStr}:`);
    if (!nombre || nombre.trim() === "") return;

    const colorElegido = prompt("Color: 1.Azul, 2.Verde, 3.Rojo, 4.Naranja, 5.Morado", "1");
    const indice = parseInt(colorElegido || "1") - 1;
    const colorFinal = PALETA_COLORES[indice]?.hex || defaultColor;

    const loadingToast = toast.loading('Guardando...');

    try {
      await addDoc(collection(db, 'calendarios'), {
        nombre: nombre.trim(),
        fecha: arg.dateStr,
        tipo,
        color: colorFinal,
        userId: currentUser.uid,
        createdAt: new Date()
      });
      toast.success('Agregado correctamente', { id: loadingToast });
    } catch (error) {
      toast.error('Error al guardar', { id: loadingToast });
    }
  };

  const handleEventClick = async (arg: any) => {
    if (!currentUser) return toast.error("No tienes permisos");

    const eventOwnerId = arg.event.extendedProps.userId;
    
    // Verificación visual antes de intentar borrar
    if (eventOwnerId !== currentUser.uid) {
      return toast.error("No puedes borrar un registro de otro usuario", {
        icon: '🚫',
        duration: 4000
      });
    }

    if (window.confirm(`¿Eliminar "${arg.event.title}"?`)) {
      const deletingToast = toast.loading('Eliminando...');
      try {
        await deleteDoc(doc(db, 'calendarios', arg.event.id));
        toast.success('Eliminado', { id: deletingToast });
      } catch (error) {
        toast.error('No tienes permiso para borrar esto', { id: deletingToast });
      }
    }
  };

  return (
    <div className="card shadow-sm border-0 p-4 bg-white rounded-4">
      <div className="mb-4">
        <h3 className="fw-bold text-dark d-flex align-items-center gap-2">
          <Calendar className="text-primary" size={28} /> {titulo}
        </h3>
        <p className="text-muted small">Toca un día para anotar tu nombre o una guardia.</p>
      </div>

      <div className="calendar-container border rounded-3 p-2 bg-white shadow-sm">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          events={eventos}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: ''
          }}
          height="auto"
        />
      </div>
    </div>
  );
};

export default CalendarioGeneral;