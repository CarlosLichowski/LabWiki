// src/Pages/Personal/Ateneos/Ateneos.tsx
import React, { useState, useEffect } from 'react';
import {
  collection, addDoc, onSnapshot, query, orderBy,
  serverTimestamp, doc, deleteDoc, setDoc, deleteField,
  Firestore
} from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';
import { auth } from '../../../Credenciales';
import { FolderPlus, ExternalLink, Trash2, Star } from 'lucide-react';

// 1. LA INTERFAZ DEBE ESTAR FUERA DEL COMPONENTE
interface AteneosProps {
  userId: string | null;
  db: Firestore;
  storage: FirebaseStorage;
  appId: string;
  displayName?: string;
}

// 2. ASIGNAMOS LA INTERFAZ A React.FC
const Ateneos: React.FC<AteneosProps> = ({ userId, db , displayName }) => {
  const [ateneos, setAteneos] = useState<any[]>([]);
  const [titulo, setTitulo] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [misFavoritos, setMisFavoritos] = useState<Record<string, any>>({});

  const currentUser = auth.currentUser;

  useEffect(() => {
    // Usamos el 'db' que viene por props para mayor consistencia
    const q = query(collection(db, 'ateneos_biblioteca'), orderBy('createdAt', 'desc'));
    const unsubAteneos = onSnapshot(q, (snapshot) => {
      setAteneos(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
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
  }, [currentUser, db]); // Agregamos db a las dependencias

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
      console.error("Error al marcar favorito:", err);
    }
  };

  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !url.trim() || !currentUser) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'ateneos_biblioteca'), {
        titulo: titulo.trim(),
        url: url.trim(),
        autor: displayName || currentUser.displayName || currentUser.email?.split('@')[0] || "Usuario",
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      });
      setTitulo(''); setUrl('');
    } catch (err) { 
      console.error(err);
      alert("Error al guardar"); 
    }
    finally { setLoading(false); }
  };

  const handleBorrar = async (id: string, t: string) => {
    if (window.confirm(`¿Eliminar "${t}"?`)) {
      await deleteDoc(doc(db, 'ateneos_biblioteca', id));
    }
  };

  return (
    <div className="p-2 p-md-4 max-w-5xl mx-auto">
      <div className="mb-4">
        <h2 className="h3 fw-bold text-dark d-flex align-items-center gap-2">
          <FolderPlus className="text-primary" /> Biblioteca de Ateneos
        </h2>
        <p className="text-muted small">Repositorio central de material académico y presentaciones.</p>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={handlePublicar} className="mb-4 bg-white p-3 rounded-3 shadow-sm border">
        <div className="row g-2">
          <div className="col-md-5">
            <input 
              className="form-control" 
              placeholder="Título del ateneo..." 
              value={titulo} 
              onChange={e => setTitulo(e.target.value)} 
              required
            />
          </div>
          <div className="col-md-5">
            <input 
              className="form-control" 
              placeholder="Enlace URL (Drive, YouTube, etc)" 
              value={url} 
              onChange={e => setUrl(e.target.value)} 
              required
            />
          </div>
          <div className="col-md-2">
            <button 
              className="btn btn-primary w-100 fw-bold" 
              disabled={loading}
            >
              {loading ? <span className="spinner-border spinner-border-sm"></span> : "Publicar"}
            </button>
          </div>
        </div>
      </form>

      {/* TABLA */}
      <div className="bg-white shadow-sm rounded-3 overflow-hidden border">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase">Material</th>
                <th className="px-4 py-3 text-muted small fw-bold text-uppercase">Autor</th>
                <th className="px-4 py-3 text-center text-muted small fw-bold text-uppercase">Acciones</th>
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
                        <Star size={18} fill={misFavoritos[`ateneos_biblioteca:${item.id}`] ? "currentColor" : "none"} />
                      </button>
                      <span className="fw-semibold text-dark">{item.titulo}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge bg-light text-dark border">
                      {item.autor}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-primary rounded-pill d-flex align-items-center gap-1"
                      >
                        <ExternalLink size={14} /> Abrir
                      </a>
                      {userId === item.userId && (
                        <button 
                          onClick={() => handleBorrar(item.id, item.titulo)} 
                          className="btn btn-sm btn-outline-danger rounded-pill"
                        >
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
        {ateneos.length === 0 && (
          <div className="p-5 text-center text-muted">
            No hay materiales subidos todavía.
          </div>
        )}
      </div>
    </div>
  );
};

export default Ateneos;