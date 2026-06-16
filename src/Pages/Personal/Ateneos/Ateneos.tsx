// src/Pages/Personal/Ateneos/Ateneos.tsx
import React, { useState, useEffect } from 'react';
import {
  collection, addDoc, onSnapshot, query, orderBy,
  serverTimestamp, doc, deleteDoc, setDoc, deleteField,
  updateDoc, Firestore
} from 'firebase/firestore';
import { auth } from '../../../Credenciales';
import { 
  FolderPlus, ExternalLink, Trash2, Star, Plus, 
  User, Calendar, ArrowLeft, ArrowUpDown, Edit3, X, ShieldAlert 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

// 🟢 Tu ID maestro exclusivo para control total
const MI_UID_ADMIN = 'cwOunAUJq7fAvTLtuEVQrjjFoLP2';

interface Ateneo {
  id: string;
  titulo: string;
  url: string;
  autor: string;
  userId: string;
  createdAt: any;
  tipo: 'Ateneo' | 'Curso';
}

interface AteneosProps {
  userId: string | null;
  db: Firestore;
  storage?: any; 
  appId?: string;
  displayName?: string;
}

const Ateneos: React.FC<AteneosProps> = ({  db, displayName }) => {
  const [ateneos, setAteneos] = useState<Ateneo[]>([]);
  const [loading, setLoading] = useState(false);
  const [misFavoritos, setMisFavoritos] = useState<Record<string, any>>({});
  const [showForm, setShowForm] = useState(false); 
  
  // Estados para control de Edición
  const [editingId, setEditingId] = useState<string | null>(null);

  // Formulario Unificado
  const initialFormState = {
    titulo: '',
    url: '',
    tipo: 'Ateneo' as 'Ateneo' | 'Curso'
  };
  const [formValues, setFormValues] = useState(initialFormState);

  // Estados de Filtrado y Ordenamiento
  const [filtroTipo, setFfiltroTipo] = useState<'Todos' | 'Ateneo' | 'Curso'>('Todos');
  const [ordenFecha, setOrdenFecha] = useState<'desc' | 'asc'>('desc');

  const currentUser = auth.currentUser;

  // 🟢 Comprobación en tiempo de renderizado: ¿Sos Carlos?
  const isAdmin = currentUser?.uid === MI_UID_ADMIN;

  useEffect(() => {
    const q = query(collection(db, 'ateneos_biblioteca'), orderBy('createdAt', 'desc'));
    const unsubAteneos = onSnapshot(q, (snapshot) => {
      setAteneos(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Ateneo)));
    });

    let unsubFavs = () => { };
    if (currentUser) {
      unsubFavs = onSnapshot(doc(db, 'usuarios', currentUser.uid), (docSnap) => {
        if (docSnap.exists()) {
          setMisFavoritos(docSnap.data().favoritos || {});
        }
      });
    }
    return () => { unsubAteneos(); unsubFavs(); };
  }, [currentUser, db]);

  const toggleFavorito = async (ateneoId: string) => {
    if (!currentUser) return;
    const userRef = doc(db, 'usuarios', currentUser.uid);
    const key = `ateneos_biblioteca:${ateneoId}`;
    const esFavorito = !!misFavoritos[key];

    try {
      await setDoc(userRef, {
        favoritos: { [key]: esFavorito ? deleteField() : 'ateneos_biblioteca' }
      }, { merge: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleGuardarMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.titulo.trim() || !formValues.url.trim() || !currentUser) return;
    setLoading(true);
    
    const msg = editingId ? 'Actualizando material...' : 'Publicando material...';
    const loader = toast.loading(msg);

    try {
      if (editingId) {
        const docRef = doc(db, 'ateneos_biblioteca', editingId);
        await updateDoc(docRef, {
          titulo: formValues.titulo.trim(),
          url: formValues.url.trim(),
          tipo: formValues.tipo
        });
        toast.success('Material actualizado', { id: loader });
      } else {
        await addDoc(collection(db, 'ateneos_biblioteca'), {
          titulo: formValues.titulo.trim(),
          url: formValues.url.trim(),
          tipo: formValues.tipo,
          autor: displayName || currentUser.displayName || currentUser.email?.split('@')[0] || "Usuario",
          userId: currentUser.uid,
          createdAt: serverTimestamp()
        });
        toast.success('Publicado correctamente', { id: loader });
      }
      handleCerrarFormulario();
    } catch (err) {
      toast.error('Error al guardar cambios', { id: loader });
    } finally { setLoading(false); }
  };

  const handleIniciarEdicion = (item: Ateneo) => {
    setFormValues({
      titulo: item.titulo,
      url: item.url,
      tipo: item.tipo
    });
    setEditingId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCerrarFormulario = () => {
    setShowForm(false);
    setEditingId(null);
    setFormValues(initialFormState);
  };

  const handleBorrar = async (id: string, t: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente "${t}"?`)) {
      try {
        await deleteDoc(doc(db, 'ateneos_biblioteca', id));
        toast.success('Material eliminado de la biblioteca');
      } catch (err) {
        toast.error('No se pudo eliminar el archivo');
      }
    }
  };

  // Filtrado y Ordenamiento en memoria
  const ateneosProcesados = ateneos
    .filter(item => {
      if (filtroTipo === 'Todos') return true;
      return item.tipo === filtroTipo;
    })
    .sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return ordenFecha === 'desc' ? timeB - timeA : timeA - timeB;
    });

  return (
    <div className="container-fluid py-2 py-md-4 px-2 px-md-4 max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark d-flex align-items-center gap-2 mb-1">
            <FolderPlus className="text-primary" size={24} /> Biblioteca Digital
          </h2>
          <p className="text-muted small mb-0 d-none d-sm-block">
            Material académico, ateneos del servicio y cursos de formación.
            {/* 🟢 Tag visual para avisarte que tenés los superpoderes activos en la interfaz */}
            {isAdmin && <span className="badge bg-danger-subtle text-danger ms-2 fw-bold"><ShieldAlert size={12} className="me-1"/> Modo Admin Activo</span>}
          </p>
        </div>
        <button 
          onClick={() => { if(showForm) { handleCerrarFormulario(); } else { setShowForm(true); } }} 
          className={`btn ${showForm ? 'btn-light text-secondary' : 'btn-primary'} rounded-pill d-flex align-items-center gap-2 shadow-sm px-3 fw-bold`}
        >
          {showForm ? <><X size={16} /> Cancelar</> : <><Plus size={18} /> Publicar</>}
        </button>
      </div>

      {/* FORMULARIO DINÁMICO */}
      {showForm && (
        <form onSubmit={handleGuardarMaterial} className="mb-4 bg-white p-3 rounded-4 shadow-sm border animate__animated animate__fadeInDown">
          <div className="d-flex align-items-center gap-2 mb-2 border-bottom pb-2">
            <span className={`badge ${editingId ? 'bg-warning-subtle text-warning-dark' : 'bg-primary-subtle text-primary'} px-2 py-1`}>
              {editingId ? 'Modo Edición' : 'Nueva Publicación'}
            </span>
          </div>
          <div className="row g-2">
            <div className="col-md-4">
              <label className="extra-small fw-bold text-muted mb-1 ms-1">TÍTULO DEL MATERIAL</label>
              <input 
                className="form-control form-control-sm bg-light border-0 py-2 shadow-none text-dark" 
                placeholder="Ej: Control de Calidad en Hematología" 
                value={formValues.titulo} 
                onChange={e => setFormValues({...formValues, titulo: e.target.value})} 
                required
              />
            </div>
            <div className="col-md-4">
              <label className="extra-small fw-bold text-muted mb-1 ms-1">URL (DRIVE, YOUTUBE, CLOUD)</label>
              <input 
                className="form-control form-control-sm bg-light border-0 py-2 shadow-none text-dark" 
                placeholder="https://..." 
                value={formValues.url} 
                onChange={e => setFormValues({...formValues, url: e.target.value})} 
                required
              />
            </div>
            <div className="col-md-2">
              <label className="extra-small fw-bold text-muted mb-1 ms-1">TIPO DE CONTENIDO</label>
              <select 
                className="form-select form-select-sm bg-light border-0 py-2 shadow-none fw-semibold text-dark"
                value={formValues.tipo}
                onChange={e => setFormValues({...formValues, tipo: e.target.value as any})}
              >
                <option value="Ateneo">Ateneo Semanal</option>
                <option value="Curso">Curso / Capacitación</option>
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button 
                className={`btn ${editingId ? 'btn-warning text-dark' : 'btn-primary'} btn-sm w-100 fw-bold py-2 rounded-3 shadow-none`} 
                disabled={loading}
              >
                {loading ? <span className="spinner-border spinner-border-sm"></span> : (editingId ? "Actualizar" : "Confirmar")}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* BARRA DE CONTROL */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-3 bg-white p-2 rounded-3 border shadow-sm">
        <div className="nav p-1 bg-light rounded-3 d-flex gap-1">
          {(['Todos', 'Ateneo', 'Curso'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFfiltroTipo(t)}
              className={`btn btn-sm border-0 px-3 py-1.5 rounded-2 fw-semibold text-capitalize transition-all ${
                filtroTipo === t 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-secondary hover-bg-light'
              }`}
            >
              {t === 'Todos' ? 'Todos' : t === 'Ateneo' ? 'Ateneos' : 'Cursos'}
            </button>
          ))}
        </div>

        <div className="d-flex align-items-center gap-2 px-1">
          <span className="text-muted small d-none d-md-inline-block fw-medium">
            <ArrowUpDown size={14} className="me-1"/> Ordenar por publicación:
          </span>
          <select
            className="form-select form-select-sm border-0 bg-light shadow-none fw-semibold rounded-2 text-secondary py-1.5"
            style={{ width: 'auto', minWidth: '180px', cursor: 'pointer' }}
            value={ordenFecha}
            onChange={e => setOrdenFecha(e.target.value as any)}
          >
            <option value="desc">Más recientes primero</option>
            <option value="asc">Más antiguos primero</option>
          </select>
        </div>
      </div>

      {/* VISTA ESCRITORIO */}
      <div className="d-none d-md-block bg-white shadow-sm rounded-4 overflow-hidden border">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3 text-muted extra-small fw-bold text-uppercase">Material</th>
                <th className="px-4 py-3 text-muted extra-small fw-bold text-uppercase">Clasificación</th>
                <th className="px-4 py-3 text-muted extra-small fw-bold text-uppercase">Autor</th>
                <th className="px-4 py-3 text-center text-muted extra-small fw-bold text-uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ateneosProcesados.map(item => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <div className="d-flex align-items-center">
                      <button 
                        onClick={() => toggleFavorito(item.id)} 
                        className={`btn btn-link p-0 me-3 shadow-none ${misFavoritos[`ateneos_biblioteca:${item.id}`] ? 'text-warning' : 'text-light border-secondary'}`}
                        style={{ border: 'none' }}
                      >
                        <Star size={20} fill={misFavoritos[`ateneos_biblioteca:${item.id}`] ? "currentColor" : "none"} />
                      </button>
                      <span className="fw-semibold text-dark">{item.titulo}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge border-0 px-2.5 py-1.5 rounded-2 small fw-bold ${
                      item.tipo === 'Curso' ? 'bg-purple-subtle text-purple' : 'bg-info-subtle text-info'
                    }`}>
                      {item.tipo || 'Ateneo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge bg-light text-dark border-0 px-3 py-2 rounded-pill small">
                      <User size={12} className="me-1 text-primary" /> {item.autor}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <a href={item.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary rounded-pill px-3 d-flex align-items-center gap-2">
                        <ExternalLink size={14} /> Abrir
                      </a>
                      
                      {/* 🟢 CONDICIÓN DE ACCIONES ACTUALIZADA (Dueño original O Carlos) */}
                      {(currentUser?.uid === item.userId || isAdmin) && (
                        <div className="d-flex gap-1">
                          <button onClick={() => handleIniciarEdicion(item)} className="btn btn-sm btn-outline-secondary rounded-circle p-2" title="Editar">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => handleBorrar(item.id, item.titulo)} className="btn btn-sm btn-outline-danger rounded-circle p-2" title="Eliminar">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VISTA MÓVIL */}
      <div className="d-md-none">
        {ateneosProcesados.map(item => (
          <div key={item.id} className="card border-0 shadow-sm mb-3 rounded-4 overflow-hidden">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-start gap-2" style={{ maxWidth: '75%' }}>
                  <button 
                    onClick={() => toggleFavorito(item.id)} 
                    className={`btn p-0 mt-1 shadow-none ${misFavoritos[`ateneos_biblioteca:${item.id}`] ? 'text-warning' : 'text-muted opacity-25'}`}
                  >
                    <Star size={20} fill={misFavoritos[`ateneos_biblioteca:${item.id}`] ? "currentColor" : "none"} />
                  </button>
                  <div>
                    <h6 className="fw-bold text-dark mb-1 py-1" style={{ lineHeight: '1.3' }}>{item.titulo}</h6>
                    <span className={`badge border-0 px-2 py-1 rounded-2 extra-small fw-bold ${
                      item.tipo === 'Curso' ? 'bg-purple-subtle text-purple' : 'bg-info-subtle text-info'
                    }`}>
                      {item.tipo || 'Ateneo'}
                    </span>
                  </div>
                </div>

                {/* 🟢 CONDICIÓN DE ACCIONES MÓVIL ACTUALIZADA (Dueño original O Carlos) */}
                {(currentUser?.uid === item.userId || isAdmin) && (
                  <div className="d-flex gap-2">
                    <button onClick={() => handleIniciarEdicion(item)} className="btn btn-link text-secondary p-0 shadow-none">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => handleBorrar(item.id, item.titulo)} className="btn btn-link text-danger p-0 shadow-none">
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="d-flex align-items-center gap-3 mt-3">
                <div className="extra-small text-muted d-flex align-items-center gap-1">
                  <User size={12} className="text-primary" /> {item.autor}
                </div>
                <div className="extra-small text-muted d-flex align-items-center gap-1">
                   <Calendar size={12} /> {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Reciente'}
                </div>
              </div>

              <a href={item.url} target="_blank" rel="noreferrer" className="btn btn-primary w-100 rounded-pill mt-3 d-flex align-items-center justify-content-center gap-2 fw-bold py-2 shadow-sm">
                <ExternalLink size={16} /> Ver Material
              </a>
            </div>
          </div>
        ))}
      </div>

      {ateneosProcesados.length === 0 && (
        <div className="p-5 text-center text-muted bg-white rounded-4 border">
          No hay elementos subidos que coincidan con la selección actual.
        </div>
      )}

      <style>{`
        .extra-small { font-size: 0.65rem; }
        .animate__animated { animation-duration: 0.3s; }
        .hover-bg-light:hover { background-color: #f8f9fa; }
        .bg-purple-subtle { background-color: #f3e8ff; }
        .text-purple { color: #6b21a8; }
        .bg-info-subtle { background-color: #e0f2fe; }
        .text-info { color: #0369a1; }
        .bg-warning-subtle { background-color: #fffbeb; }
        .text-warning-dark { color: #b45309; }
        .bg-danger-subtle { background-color: #fef2f2; }
        .text-danger { color: #dc2626; }
        .transition-all { transition: all 0.2s ease-in-out; }
      `}</style>

      {/* RETORNO */}
      <div className="d-flex justify-content-center mt-5">
        <Link 
          to="/" 
          className="btn bg-secondary-subtle text-dark border d-inline-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-bold transition-all shadow-sm"
          style={{ textDecoration: 'none' }}
        >
          <ArrowLeft size={16} className="text-primary" /> 
          <span>Volver al Inicio</span>
        </Link>
      </div>

    </div>
  );
};

export default Ateneos;