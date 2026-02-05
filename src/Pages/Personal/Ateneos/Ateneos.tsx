
// src/Pages/Personal/Ateneos/Ateneos.tsx
import React, { useState, useEffect } from 'react';
import {
  collection, addDoc, onSnapshot, query, orderBy,
  serverTimestamp, doc, deleteDoc, setDoc, deleteField,
  Firestore
} from 'firebase/firestore';
import { auth } from '../../../Credenciales';
import { FolderPlus, ExternalLink, Trash2, Star, Plus, User, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface Ateneo {
  id: string;
  titulo: string;
  url: string;
  autor: string;
  userId: string;
  createdAt: any;
}

interface AteneosProps {
  userId: string | null;
  db: Firestore;
  storage?: any; 
  appId?: string;
  displayName?: string;
}

const Ateneos: React.FC<AteneosProps> = ({ userId, db, displayName }) => {
  const [ateneos, setAteneos] = useState<Ateneo[]>([]);
  const [titulo, setTitulo] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [misFavoritos, setMisFavoritos] = useState<Record<string, any>>({});
  const [showForm, setShowForm] = useState(false); // Para colapsar formulario en móvil

  const currentUser = auth.currentUser;

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

  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !url.trim() || !currentUser) return;
    setLoading(true);
    const loader = toast.loading('Publicando material...');
    try {
      await addDoc(collection(db, 'ateneos_biblioteca'), {
        titulo: titulo.trim(),
        url: url.trim(),
        autor: displayName || currentUser.displayName || currentUser.email?.split('@')[0] || "Usuario",
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      });
      setTitulo(''); setUrl('');
      setShowForm(false);
      toast.success('Publicado correctamente', { id: loader });
    } catch (err) {
      toast.error('Error al guardar', { id: loader });
    } finally { setLoading(false); }
  };

  const handleBorrar = async (id: string, t: string) => {
    if (window.confirm(`¿Eliminar "${t}"?`)) {
      try {
        await deleteDoc(doc(db, 'ateneos_biblioteca', id));
        toast.success('Eliminado');
      } catch (err) {
        toast.error('No se pudo eliminar');
      }
    }
  };

  return (
    <div className="container-fluid py-2 py-md-4 px-2 px-md-4 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark d-flex align-items-center gap-2 mb-1">
            <FolderPlus className="text-primary" size={24} /> Biblioteca
          </h2>
          <p className="text-muted small mb-0 d-none d-sm-block">Material académico y presentaciones.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className={`btn ${showForm ? 'btn-light' : 'btn-primary'} rounded-pill d-flex align-items-center gap-2 shadow-sm px-3`}
        >
          {showForm ? 'Cerrar' : <><Plus size={18} /> Publicar</>}
        </button>
      </div>

      {/* FORMULARIO DINÁMICO */}
      {showForm && (
        <form onSubmit={handlePublicar} className="mb-4 bg-white p-3 rounded-4 shadow-sm border animate__animated animate__fadeInDown">
          <div className="row g-2">
            <div className="col-md-5">
              <label className="extra-small fw-bold text-muted mb-1 ms-1">TÍTULO DEL MATERIAL</label>
              <input 
                className="form-control form-control-sm bg-light border-0 py-2 shadow-none" 
                placeholder="Ej: Manejo de Sepsis 2024" 
                value={titulo} 
                onChange={e => setTitulo(e.target.value)} 
                required
              />
            </div>
            <div className="col-md-5">
              <label className="extra-small fw-bold text-muted mb-1 ms-1">URL (DRIVE, YOUTUBE, WEB)</label>
              <input 
                className="form-control form-control-sm bg-light border-0 py-2 shadow-none" 
                placeholder="https://..." 
                value={url} 
                onChange={e => setUrl(e.target.value)} 
                required
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button 
                className="btn btn-primary btn-sm w-100 fw-bold py-2 rounded-3 shadow-none" 
                disabled={loading}
              >
                {loading ? <span className="spinner-border spinner-border-sm"></span> : "Confirmar"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* VISTA ESCRITORIO */}
      <div className="d-none d-md-block bg-white shadow-sm rounded-4 overflow-hidden border">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3 text-muted extra-small fw-bold text-uppercase">Material</th>
                <th className="px-4 py-3 text-muted extra-small fw-bold text-uppercase">Autor</th>
                <th className="px-4 py-3 text-center text-muted extra-small fw-bold text-uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ateneos.map(item => (
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
                    <span className="badge bg-light text-dark border-0 px-3 py-2 rounded-pill small">
                      <User size={12} className="me-1 text-primary" /> {item.autor}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <a href={item.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary rounded-pill px-3 d-flex align-items-center gap-2">
                        <ExternalLink size={14} /> Abrir
                      </a>
                      {userId === item.userId && (
                        <button onClick={() => handleBorrar(item.id, item.titulo)} className="btn btn-sm btn-outline-danger rounded-circle p-2">
                          <Trash2 size={14} />
                        </button>
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
        {ateneos.map(item => (
          <div key={item.id} className="card border-0 shadow-sm mb-3 rounded-4 overflow-hidden">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-start gap-2" style={{ maxWidth: '80%' }}>
                  <button 
                    onClick={() => toggleFavorito(item.id)} 
                    className={`btn p-0 mt-1 shadow-none ${misFavoritos[`ateneos_biblioteca:${item.id}`] ? 'text-warning' : 'text-muted opacity-25'}`}
                  >
                    <Star size={20} fill={misFavoritos[`ateneos_biblioteca:${item.id}`] ? "currentColor" : "none"} />
                  </button>
                  <h6 className="fw-bold text-dark mb-0 py-1" style={{ lineHeight: '1.3' }}>{item.titulo}</h6>
                </div>
                {userId === item.userId && (
                  <button onClick={() => handleBorrar(item.id, item.titulo)} className="btn btn-link text-danger p-0 shadow-none">
                    <Trash2 size={18} />
                  </button>
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

      {ateneos.length === 0 && (
        <div className="p-5 text-center text-muted bg-white rounded-4 border">
          No hay materiales subidos todavía.
        </div>
      )}

      <style>{`
        .extra-small { font-size: 0.65rem; }
        .animate__animated { animation-duration: 0.3s; }
      `}</style>
    </div>
  );
};

export default Ateneos;