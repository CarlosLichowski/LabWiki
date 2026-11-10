// Pages/InnovacionYNuevasMetodologias/InnovacionYNuevasMetodologias.tsx
import React, { useState, useEffect } from 'react';
import { 
  collection, addDoc, onSnapshot, query, orderBy, 
  serverTimestamp, doc, deleteDoc, getDoc 
} from 'firebase/firestore';
import { db } from '../Credenciales';
import { 
  Plus, User, Trash2, Lightbulb, ArrowLeft, X, Link2, Microscope, TestTube,
  BookOpen, ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import toast from 'react-hot-toast';
import '../css/InnovacionYNuevasMetodologias.css';

interface PublicacionInnovacion {
  id: string;
  titulo: string;
  descripcion: string;
  enlace: string;
  tipo: 'Tecnología' | 'Determinación';
  autor: string;
  autorId: string;
  createdAt: any;
}

const InnovacionYNuevasMetodologias: React.FC = () => {
  const [publicaciones, setPublicaciones] = useState<PublicacionInnovacion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [cargando, setCargando] = useState(true);
  
  const initialFormState = { 
    titulo: '', 
    descripcion: '', 
    enlace: '',
    tipo: 'Tecnología' as 'Tecnología' | 'Determinación'
  };
  const [formInno, setFormInno] = useState(initialFormState);
  
  const { user, loading: authLoading } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || !user) return;

    const q = query(collection(db, 'innovaciones'), orderBy('createdAt', 'desc'));
    
    const unsub = onSnapshot(q, (snapshot) => {
      setPublicaciones(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PublicacionInnovacion)));
      setCargando(false);
    }, (error) => {
      console.error("Error al cargar innovaciones:", error);
      toast.error("Error al sincronizar publicaciones");
      setCargando(false);
    });

    return () => unsub();
  }, [user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Debes iniciar sesión para publicar");

    let urlFormateada = formInno.enlace.trim();
    if (urlFormateada && !/^https?:\/\//i.test(urlFormateada)) {
      urlFormateada = `https://${urlFormateada}`;
    }

    try {
      let nombreAutor = 'Bioquímico/a';
      
      try {
        const userDocRef = doc(db, 'usuarios', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          nombreAutor = userData.nombre || userData.displayName || user.displayName || 'Bioquímico/a';
        } else {
          nombreAutor = user.displayName || 'Bioquímico/a';
        }
      } catch (userErr) {
        console.error("No se pudo obtener el nombre del documento de usuario:", userErr);
        nombreAutor = user.displayName || 'Bioquímico/a';
      }

      await addDoc(collection(db, 'innovaciones'), {
        titulo: formInno.titulo.trim(),
        descripcion: formInno.descripcion.trim(),
        enlace: urlFormateada,
        tipo: formInno.tipo,
        autor: nombreAutor,
        autorId: user.uid,
        createdAt: serverTimestamp()
      });
      
      toast.success('Innovación compartida con el equipo');
      handleCloseModal();
    } catch (err) { 
      console.error("Error al guardar publicación: ", err); 
      toast.error('No se pudo subir la publicación');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormInno(initialFormState);
  };

  const handleEliminar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("¿Estás seguro de que deseas eliminar esta publicación?")) {
      try {
        await deleteDoc(doc(db, 'innovaciones', id));
        toast.success('Publicación eliminada');
      } catch (err) {
        console.error("Error al eliminar: ", err);
        toast.error('No se pudo eliminar la publicación');
      }
    }
  };

  const formatearFecha = (timestamp: any) => {
    if (!timestamp) return 'RECIENTE';
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  };

  if (authLoading || cargando) {
    return (
      <div className="inno-loading-container">
        <div className="inno-spinner" role="status"></div>
        <p className="inno-loading-text">Cargando publicaciones...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="inno-restricted-wrapper">
        <div className="inno-restricted-card">
          <ShieldAlert size={48} className="inno-restricted-icon" />
          <h4 className="inno-restricted-title">Acceso restringido</h4>
          <p className="inno-restricted-desc">Por favor, iniciá sesión para ver la sección de innovación científica.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inno-portal-wrapper inno-fade-in">
      {/* HERO BANNER PRINCIPAL */}
      <div className="inno-hero-banner">
        <div className="inno-hero-overlay"></div>
        <div className="inno-hero-content">
          <h1 className="inno-hero-title">El Futuro del Diagnóstico</h1>
          <p className="inno-hero-desc">
            inteligencia artificial, automatización clínica y  nuevas metodologías.
          </p>
          <button className="btn-inno-hero-action" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Compartir Avance
          </button>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="inno-main-container">
        <div className="inno-grid-layout">
          
          {/* ÁREA DE CONTENIDO */}
          <main className="inno-content-area">
            <div className="inno-content-header">
              <h3 className="inno-section-title">Últimas Publicaciones</h3>
              <span className="inno-section-subtitle">VOL. IV — {publicaciones.length} ARTÍCULOS</span>
            </div>

            {publicaciones.length === 0 ? (
              <div className="inno-vacio-card">
                <Lightbulb size={40} className="inno-vacio-icon" />
                <p className="inno-vacio-text-bold">Aún no hay publicaciones reportadas.</p>
                <p className="inno-vacio-text-light">¡compartir un nuevo avance!</p>
              </div>
            ) : (
              <div className="inno-list-container">
                {publicaciones.map(p => (
                  <article key={p.id} className="inno-list-item">
                    
                    {/* Meta Superior: Tipo + Fecha */}
                    <div className="inno-item-meta-header">
                      <span className={`inno-type-tag ${p.tipo === 'Tecnología' ? 'tag-tech' : 'tag-det'}`}>
                        {p.tipo.toUpperCase()}
                      </span>
                      <span className="inno-item-date">{formatearFecha(p.createdAt)}</span>
                    </div>

                    {/* Fila Central: Título + Botón de Eliminar a la derecha */}
                    <div className="inno-item-middle">
                      <h4 className="inno-item-title">{p.titulo}</h4>
                      {p.autorId === user.uid && (
                        <button 
                          className="btn-inno-delete" 
                          onClick={(e) => handleEliminar(p.id, e)}
                          title="Eliminar publicación"
                        >
                          <Trash2 size={16}/>
                        </button>
                      )}
                    </div>

                    {/* Descripción */}
                    <p className="inno-item-description">{p.descripcion}</p>

                    {/* Pie: Enlace y Autor alineados horizontalmente a la izquierda */}
                    <div className="inno-item-footer">
                      {p.enlace ? (
                        <a 
                          href={p.enlace} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inno-item-link"
                        >
                          {p.tipo === 'Tecnología' ? 'Ver Producto' : 'Leer Paper Completo'}
                          <span className="inno-link-arrow">&rarr;</span>
                        </a>
                      ) : (
                        <span className="inno-item-link disabled">
                          Consultar Detalles
                          <span className="inno-link-arrow">&rarr;</span>
                        </span>
                      )}

                      <span className="inno-item-author">
                        <User size={13} className="inno-author-icon" />
                        {p.autor}
                      </span>
                    </div>

                  </article>
                ))}
              </div>
            )}

            {/* BOTÓN REGRESAR */}
            <div className="inno-back-wrapper">
              <button 
                onClick={() => navigate('/')}
                className="btn-inno-back"
              >
                <ArrowLeft size={16} /> 
                <span>VOLVER AL PANEL PRINCIPAL</span>
              </button>
            </div>
          </main>

          {/* BARRA LATERAL (SIDEBAR) */}
          <aside className="inno-sidebar-area">
            <div className="inno-sidebar-widget">
              <h4 className="inno-sidebar-title">
                <BookOpen size={16} /> Fuentes Digitales
              </h4>
              <ul className="inno-sources-list">
                <li>
                  <a href="https://novedadesbioquimicas.com/category/revista-online/" target="_blank" rel="noopener noreferrer" className="inno-source-link">
                    <div className="inno-source-content">
                      <h5>Novedades Bioquímicas</h5>
                      <span className="inno-source-meta">REVISTA ONLINE &#8690;</span>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="https://www.fba.org.ar/" target="_blank" rel="noopener noreferrer" className="inno-source-link">
                    <div className="inno-source-content">
                      <h5>Fundación Bioquímica Argentina</h5>
                      <span className="inno-source-meta">FBA INSTITUCIONAL &#8690;</span>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="https://www.revistabypc.org.ar/index.php/bypc" target="_blank" rel="noopener noreferrer" className="inno-source-link">
                    <div className="inno-source-content">
                      <h5>Revista Bioquímica y Patología Clínica</h5>
                      <span className="inno-source-meta">BYPC CIENTÍFICA &#8690;</span>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
          </aside>

        </div>
      </div>

      {/* MODAL NUEVA PUBLICACIÓN */}
      {showModal && (
        <div className="inno-modal-backdrop">
          <div className="inno-modal-dialog">
            <div className="inno-modal-content">
              <div className="inno-modal-header">
                <h5 className="inno-modal-title">
                  <Lightbulb className="inno-modal-title-icon" size={20}/>
                  Dar a conocer un descubrimiento
                </h5>
                <button className="btn-inno-close" onClick={handleCloseModal}>
                  <X size={14}/>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="inno-modal-body">
                  <div className="inno-form-group">
                    <label className="inno-form-label">TIPO DE AVANCE</label>
                    <div className="inno-type-selector">
                      <button
                        type="button"
                        className={`inno-type-btn ${formInno.tipo === 'Tecnología' ? 'active-tech' : 'inactive'}`}
                        onClick={() => setFormInno({...formInno, tipo: 'Tecnología'})}
                      >
                        <Microscope size={16}/>
                        Tecnología (Equipo)
                      </button>
                      <button
                        type="button"
                        className={`inno-type-btn ${formInno.tipo === 'Determinación' ? 'active-det' : 'inactive'}`}
                        onClick={() => setFormInno({...formInno, tipo: 'Determinación'})}
                      >
                        <TestTube size={16}/>
                        Determinación (Ensayo)
                      </button>
                    </div>
                  </div>

                  <div className="inno-form-group">
                    <label className="inno-form-label">NOMBRE DEL AVANCE</label>
                    <input 
                      type="text"
                      className="inno-form-input" 
                      placeholder={formInno.tipo === 'Tecnología' ? "Ej: Nuevo autoanalizador Cobas 6000" : "Ej: Detección molecular de gen de resistencia X"} 
                      required 
                      value={formInno.titulo}
                      onChange={e => setFormInno({...formInno, titulo: e.target.value})} 
                    />
                  </div>

                  <div className="inno-form-group">
                    <label className="inno-form-label">ENLACE AL PAPER, ESTUDIO O PRODUCTO</label>
                    <div className="inno-input-icon-wrapper">
                      <span className="inno-input-icon"><Link2 size={14}/></span>
                      <input 
                        type="text"
                        className="inno-form-input has-icon" 
                        placeholder="www.ncbi.nlm.nih.gov/pubmed/..." 
                        required
                        value={formInno.enlace}
                        onChange={e => setFormInno({...formInno, enlace: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="inno-form-group">
                    <label className="inno-form-label">¿POR QUÉ CONSIDERÁS IMPORTANTE IMPLEMENTARLO?</label>
                    <textarea 
                      className="inno-form-textarea" 
                      rows={4} 
                      placeholder="Explicá el impacto clínico, reducción de tiempos..." 
                      required 
                      value={formInno.descripcion}
                      onChange={e => setFormInno({...formInno, descripcion: e.target.value})}
                    ></textarea>
                  </div>
                </div>

                <div className="inno-modal-footer">
                  <button type="submit" className="btn-inno-submit">
                    Publicar Avance
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InnovacionYNuevasMetodologias;