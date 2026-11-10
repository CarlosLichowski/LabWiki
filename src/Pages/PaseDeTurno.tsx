// PaseDeTurno.tsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, where, updateDoc, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { CheckCircle2, Circle, Clock, ClipboardList, Plus, Trash2, ArrowLeft, AlertTriangle, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { db, auth } from '../Credenciales';
import '../css/PaseDeTurno.css';

interface ItemPase {
  id: string;
  texto: string;
  completado: boolean;
  servicio: string;
  createdAt: any;
  completadoAt?: any;
  usuarioNombre: string;
  tipo: 'general' | 'rechazo'; // Identificador de tipo
  numeroPeticion?: string;    // Solo números
  motivoRechazo?: string;
}

const PaseDeTurno = () => {
  const [pendientes, setPendientes] = useState<ItemPase[]>([]);
  const [completados, setCompletados] = useState<ItemPase[]>([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados para el formulario
  const [tipoForm, setTipoForm] = useState<'general' | 'rechazo'>('general');
  const [nuevoItem, setNuevoItem] = useState('');
  const [numeroPeticion, setNumeroPeticion] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');
  
  const currentUser = auth.currentUser;
  const navigate = useNavigate();
  const SERVICIO_TARGET = 'Laboratorio Central';

  useEffect(() => {
    const q = query(
      collection(db, 'pases_turno'),
      where('servicio', '==', SERVICIO_TARGET)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todos: ItemPase[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          texto: data.texto,
          completado: data.completado,
          servicio: data.servicio,
          createdAt: data.createdAt,
          completadoAt: data.completadoAt,
          usuarioNombre: data.usuarioNombre || 'Personal',
          tipo: data.tipo || 'general',
          numeroPeticion: data.numeroPeticion,
          motivoRechazo: data.motivoRechazo
        };
      });

      const listaPendientes = todos
        .filter(item => !item.completado)
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

      const listaCompletados = todos
        .filter(item => item.completado)
        .sort((a, b) => (b.completadoAt?.seconds || 0) - (a.completadoAt?.seconds || 0));

      setPendientes(listaPendientes);
      setCompletados(listaCompletados);
      setCargando(false);
    }, (error) => {
      console.error("Error cargando pase de turno:", error);
      toast.error("Error al sincronizar datos");
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  // Validación estricta de solo números para la petición
  const handlePeticionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    if (/^\d*$/.test(valor)) {
      setNumeroPeticion(valor);
    }
  };

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return toast.error("Debes iniciar sesión para añadir un ítem");

    let textoFinal = nuevoItem.trim();
    
    // Si es un rechazo, estructuramos un texto automático descriptivo
    if (tipoForm === 'rechazo') {
      if (!numeroPeticion.trim() || !motivoRechazo.trim()) {
        return toast.error("Por favor completa el número de petición y el motivo");
      }
      textoFinal = `MUESTRA RECHAZADA - Petición Nº: ${numeroPeticion} | Motivo: ${motivoRechazo}`;
    } else {
      if (!textoFinal) return;
    }

    // Resolviendo el nombre identificador para evitar el "Anónimo" persistente
    const nombreIdentificador = currentUser.displayName || currentUser.email?.split('@')[0] || 'Personal';

    try {
      await addDoc(collection(db, 'pases_turno'), {
        texto: textoFinal,
        completado: false,
        servicio: SERVICIO_TARGET,
        usuarioNombre: nombreIdentificador,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        tipo: tipoForm,
        numeroPeticion: tipoForm === 'rechazo' ? numeroPeticion : null,
        motivoRechazo: tipoForm === 'rechazo' ? motivoRechazo : null
      });

      // Limpiar estados correspondientes
      setNuevoItem('');
      setNumeroPeticion('');
      setMotivoRechazo('');
      toast.success(tipoForm === 'rechazo' ? 'Rechazo registrado' : 'Pendiente añadido');
    } catch (error) {
      toast.error('No se pudo guardar la información');
    }
  };

  const handleToggleCompletar = async (id: string, estadoActual: boolean) => {
    try {
      const docRef = doc(db, 'pases_turno', id);
      await updateDoc(docRef, {
        completado: !estadoActual,
        completadoAt: !estadoActual ? serverTimestamp() : null
      });
      if (!estadoActual) {
        toast.success('Item gestionado correctamente');
      }
    } catch (error) {
      toast.error('Error al actualizar el estado');
    }
  };

  const handleLimpiarHistorial = async () => {
    if (completados.length === 0) return;
    if (!window.confirm("¿Estás seguro de que quieres vaciar el historial?")) return;

    const loadingToast = toast.loading('Limpiando historial...');
    try {
      const batch = writeBatch(db);
      completados.forEach((item) => {
        const docRef = doc(db, 'pases_turno', item.id);
        batch.delete(docRef);
      });
      await batch.commit();
      toast.success('Historial vaciado correctamente', { id: loadingToast });
    } catch (error) {
      toast.error('Error al eliminar el historial', { id: loadingToast });
    }
  };

  const formatearFecha = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' hs';
  };

  if (cargando) {
    return (
      <div className="pase-page-container">
        <div className="pase-spinner-container">
          <div className="pase-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pase-page-container animate__animated animate__fadeIn">
      <div className="pase-card">
        
        {/* CABECERA */}
        <div className="pase-header">
          <div className="pase-title-block">
            <h5>
              <ClipboardList size={22} className="text-primary-icon" /> Pase de Turno e Incidencias
            </h5>
            <span className="badge-servicio">{SERVICIO_TARGET}</span>
          </div>
          <p className="pase-subtitle">
            Registrá novedades o reportá muestras rechazadas de forma anónima para el control de cierre de turno.
          </p>
        </div>

        {/* SELECTOR DE TIPO DE ENTRADA */}
        <div className="pase-tabs">
          <button 
            type="button" 
            className={`pase-tab-btn ${tipoForm === 'general' ? 'active' : ''}`}
            onClick={() => setTipoForm('general')}
          >
            <MessageSquare size={16} /> Novedad General
          </button>
          <button 
            type="button" 
            className={`pase-tab-btn tab-rechazo ${tipoForm === 'rechazo' ? 'active' : ''}`}
            onClick={() => setTipoForm('rechazo')}
          >
            <AlertTriangle size={16} /> Reportar Muestra Rechazada
          </button>
        </div>

        {/* FORMULARIO DINÁMICO */}
        <form onSubmit={handleAgregar} className="pase-form-dinamico">
          {tipoForm === 'general' ? (
            <div className="pase-form-row">
              <input 
                type="text" 
                className="pase-input"
                placeholder="Ej: Dejo calibrando el contador de hematología..."
                value={nuevoItem}
                onChange={(e) => setNuevoItem(e.target.value)}
                maxLength={120}
                required
              />
              <button type="submit" className="pase-submit-btn">
                <Plus size={18} /> <span className="hide-mobile">Agregar</span>
              </button>
            </div>
          ) : (
            <div className="pase-form-grid">
              <input 
                type="text" 
                className="pase-input input-peticion"
                placeholder="Nº de Petición (Solo números)"
                value={numeroPeticion}
                onChange={handlePeticionChange}
                required
              />
              <select 
                className="pase-select"
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                required
              >
                <option value="">-- Seleccionar Motivo --</option>
                <option value="Muestra Hemolizada">Muestra Hemolizada</option>
                <option value="Muestra Coagulada">Muestra Coagulada</option>
                <option value="Volumen Insuficiente">Volumen Insuficiente</option>
                <option value="Muestra mal remitida">Muestra mal remitida</option>
                <option value="Tubo Incorrecto / Sin rotular">Tubo Incorrecto / Sin rotular</option>
              </select>
              <button type="submit" className="pase-submit-btn btn-danger-action">
                <Plus size={18} /> <span>Reportar</span>
              </button>
            </div>
          )}
        </form>

        {/* SECCIÓN PENDIENTES */}
        <div className="pase-seccion">
          <h6 className="seccion-titulo text-pendiente">
            <Clock size={16} /> Pendientes Activos ({pendientes.length})
          </h6>
          
          {pendientes.length === 0 ? (
            <div className="pase-vacio">No hay novedades ni muestras rechazadas pendientes.</div>
          ) : (
            <div className="pase-lista">
              {pendientes.map((item) => (
                <div 
                  key={item.id} 
                  className={`pase-item item-pendiente ${item.tipo === 'rechazo' ? 'border-rechazo' : ''}`} 
                  onClick={() => handleToggleCompletar(item.id, item.completado)}
                >
                  <div className="pase-checkbox">
                    <Circle size={20} className="icon-circle" />
                  </div>
                  <div className="pase-contenido">
                    <p className="pase-texto">
                      {item.tipo === 'rechazo' && <span className="badge-rechazo-alert">RECHAZO</span>}
                      {item.texto}
                    </p>
                    <span className="pase-meta">Por: {item.usuarioNombre}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECCIÓN HISTORIAL COMPLETADOS */}
        <div className="pase-seccion status-completados-section">
          <div className="historial-header">
            <h6 className="seccion-titulo text-completado">
              <CheckCircle2 size={16} /> Historial de Resueltos / Gestionados ({completados.length})
            </h6>
            {completados.length > 0 && (
              <button type="button" className="btn-limpiar-historial" onClick={handleLimpiarHistorial}>
                <Trash2 size={14} /> Vaciar historial
              </button>
            )}
          </div>

          {completados.length === 0 ? (
            <div className="pase-vacio-historial">El historial está vacío.</div>
          ) : (
            <div className="pase-lista row-gap-sm">
              {completados.map((item) => (
                <div key={item.id} className="pase-item item-completado">
                  <div className="pase-checkbox checked" onClick={() => handleToggleCompletar(item.id, item.completado)}>
                    <CheckCircle2 size={20} className="icon-checked" />
                  </div>
                  <div className="pase-contenido">
                    <p className="pase-texto texto-tachado">{item.texto}</p>
                    <span className="pase-meta">
                      Resuelto el: {formatearFecha(item.completadoAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOTÓN REGRESAR */}
        <div className="pase-footer-nav">
          <button onClick={() => navigate('/')} className="btn-back-link">
            <ArrowLeft size={14} /> Volver al Inicio
          </button>
        </div>

      </div>
    </div>
  );
};

export default PaseDeTurno;