import React, { useState, useEffect } from 'react';
import { 
  collection, addDoc, onSnapshot, query, orderBy, 
  deleteDoc, doc, serverTimestamp, setDoc, deleteField 
} from 'firebase/firestore';
import { db, auth } from '../Credenciales'; 
import { Search, Plus, Trash2, X, Star, Phone, User, Home, Bed, Save } from 'lucide-react';

interface Contacto {
  id: string;
  area: string;
  nombre: string;
  interno: string;
  tipo: 'sala' | 'medico' | 'cama';
}

const Contactos: React.FC = () => {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [misFavoritos, setMisFavoritos] = useState<Record<string, any>>({});
  const [nuevo, setNuevo] = useState({ area: '', nombre: '', interno: '', tipo: 'sala' });
  const [loading, setLoading] = useState(false);
  
  const currentUser = auth.currentUser;

  useEffect(() => {
    const q = query(collection(db, 'contactos_internos'), orderBy('area', 'asc'));
    const unsubContactos = onSnapshot(q, 
      (snapshot) => {
        setContactos(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Contacto)));
      },
      (error) => console.error("Error en snapshot:", error)
    );

    let unsubFavs = () => {};
    if (currentUser) {
      unsubFavs = onSnapshot(doc(db, 'usuarios', currentUser.uid), 
        (docSnap) => {
          if (docSnap.exists()) {
            setMisFavoritos(docSnap.data().favoritos_contactos || {});
          }
        },
        (error) => console.error("Error en favoritos:", error)
      );
    }
    return () => { unsubContactos(); unsubFavs(); };
  }, [currentUser]);

  const toggleFavorito = async (contactoId: string) => {
    if (!currentUser) return;
    const userRef = doc(db, 'usuarios', currentUser.uid);
    const esFavorito = !!misFavoritos[contactoId];
    try {
      await setDoc(userRef, {
        favoritos_contactos: { [contactoId]: esFavorito ? deleteField() : true }
      }, { merge: true });
    } catch (err) { console.error(err); }
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevo.area.trim() || !nuevo.nombre.trim() || !nuevo.interno.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'contactos_internos'), {
        ...nuevo,
        area: nuevo.area.trim(),
        nombre: nuevo.nombre.trim(),
        interno: nuevo.interno.trim(),
        createdAt: serverTimestamp()
      });
      setNuevo({ area: '', nombre: '', interno: '', tipo: 'sala' });
      setMostrarForm(false);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleBorrar = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este contacto?")) {
      try {
        await deleteDoc(doc(db, 'contactos_internos', id));
      } catch (err) { console.error(err); }
    }
  };

  const filtrados = contactos.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.area.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.interno.includes(busqueda)
  );

  const listaFavoritos = filtrados.filter(c => !!misFavoritos[c.id]);

  return (
    <div className="container py-5 animate__animated animate__fadeIn min-vh-100">
      
      {/* CABECERA */}
      <div className="row align-items-end mb-4 g-3">
        <div className="col">
          <h2 className="fw-bold text-dark mb-1">Guía Telefónica</h2>
          <p className="text-secondary mb-0">Directorio de internos del servicio</p>
        </div>

        <div className="col-12 col-md-auto d-flex gap-2 align-items-center">
          <div className="position-relative" style={{ minWidth: '240px' }}>
            <Search className="position-absolute start-0 top-50 translate-middle-y ms-3 text-secondary" size={18} />
            <input 
              className="form-control ps-5 border-0 shadow-sm rounded-3 py-2"
              placeholder="Buscar..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setMostrarForm(!mostrarForm)}
            className={`btn d-flex align-items-center gap-2 fw-bold px-4 py-2 rounded-3 shadow-sm ${mostrarForm ? 'btn-secondary' : 'btn-primary'}`}
          >
            {mostrarForm ? <X size={18}/> : <Plus size={18}/>}
            <span>{mostrarForm ? 'Cerrar' : 'Nuevo'}</span>
          </button>
        </div>
      </div>

      <hr className="mb-5 opacity-10" />

      {/* FORMULARIO */}
      {mostrarForm && (
        <div className="card border-0 shadow-lg p-4 rounded-4 mb-5 animate__animated animate__fadeInDown">
          <h6 className="fw-bold text-uppercase text-primary mb-4">Registrar Nuevo Interno</h6>
          <form onSubmit={handleGuardar} className="row g-3">
            <div className="col-md-3">
                <label className="form-label small fw-bold text-secondary">Área / Sector</label>
                <input placeholder="Ej: Hematología" className="form-control rounded-3" value={nuevo.area} onChange={e => setNuevo({...nuevo, area: e.target.value})} required />
            </div>
            <div className="col-md-3">
                <label className="form-label small fw-bold text-secondary">Nombre / Referencia</label>
                <input placeholder="Ej: Mesada técnica" className="form-control rounded-3" value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} required />
            </div>
            <div className="col-md-2">
                <label className="form-label small fw-bold text-secondary">N° Interno</label>
                <input placeholder="0000" className="form-control rounded-3 fw-bold" value={nuevo.interno} onChange={e => setNuevo({...nuevo, interno: e.target.value})} required />
            </div>
            <div className="col-md-2">
                <label className="form-label small fw-bold text-secondary">Categoría</label>
                <select className="form-select rounded-3" value={nuevo.tipo} onChange={e => setNuevo({...nuevo, tipo: e.target.value as any})}>
                  <option value="sala">📞 Sala</option>
                  <option value="medico">👨‍⚕️ Médico</option>
                  <option value="cama">🛌 Cama</option>
                </select>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button type="submit" disabled={loading} className="btn btn-primary w-100 py-2 rounded-3 fw-bold">
                {loading ? '...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTADO */}
      <div className="mt-5">
        {/* FAVORITOS */}
        {listaFavoritos.length > 0 && !busqueda && (
          <div className="mb-5">
            <h3 className="h6 fw-bold text-warning text-uppercase mb-4 d-flex align-items-center gap-2">
              <Star size={16} fill="currentColor" /> Mis Frecuentes
            </h3>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
              {listaFavoritos.map(c => (
                <div className="col" key={c.id}>
                  <ContactCard contacto={c} esFav={true} onToggleFav={toggleFavorito} onBorrar={handleBorrar} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GENERAL */}
        <h3 className="h6 fw-bold text-secondary text-uppercase mb-4">Directorio General</h3>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
          {filtrados.length > 0 ? (
            filtrados.map(c => (
              <div className="col" key={c.id}>
                <ContactCard contacto={c} esFav={!!misFavoritos[c.id]} onToggleFav={toggleFavorito} onBorrar={handleBorrar} />
              </div>
            ))
          ) : (
            <div className="col-12 w-100 text-center py-5 bg-light rounded-4 border border-2 border-dashed">
              <p className="text-secondary mb-0">No se encontraron contactos.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .rounded-4 { border-radius: 1rem !important; }
        .font-monospace { font-family: 'JetBrains Mono', 'Roboto Mono', monospace; letter-spacing: -1px; }
        .group:hover .group-hover-visible { opacity: 1 !important; }
        .group-hover-visible { opacity: 0; transition: opacity 0.2s; }
        .contact-card { transition: transform 0.2s, box-shadow 0.2s; }
        .contact-card:hover { transform: translateY(-4px); box-shadow: 0 1rem 3rem rgba(0,0,0,.1) !important; }
      `}</style>
    </div>
  );
};

// COMPONENTE TARJETA
const ContactCard = ({ contacto, esFav, onToggleFav, onBorrar }: any) => {
  const getConfig = () => {
    switch(contacto.tipo) {
      case 'medico': return { icon: <User size={14}/>, color: 'text-info', bg: 'bg-info-subtle' };
      case 'cama': return { icon: <Bed size={14}/>, color: 'text-success', bg: 'bg-success-subtle' };
      default: return { icon: <Home size={14}/>, color: 'text-primary', bg: 'bg-primary-subtle' };
    }
  };

  const config = getConfig();

  return (
    <div className="card h-100 border-0 shadow-sm rounded-4 group contact-card">
      <div className="card-body p-4 d-flex flex-column">
        
        <div className="d-flex justify-content-between align-items-start mb-3">
          <span className={`badge ${config.bg} ${config.color} rounded-pill px-3 py-2 d-flex align-items-center gap-2 text-uppercase fw-bold`} style={{ fontSize: '10px' }}>
            {config.icon} {contacto.area}
          </span>
          <button 
            onClick={() => onToggleFav(contacto.id)} 
            className={`btn btn-sm rounded-circle p-2 ${esFav ? 'text-warning bg-warning-subtle' : 'text-light-emphasis'}`}
          >
            <Star size={18} fill={esFav ? "currentColor" : "none"} />
          </button>
        </div>

        <h5 className="card-title fw-bold text-dark mb-4">{contacto.nombre}</h5>

        <div className="d-flex align-items-end justify-content-between border-top pt-3 mt-auto">
          <div>
            <span className="d-block text-secondary text-uppercase fw-bold" style={{ fontSize: '9px' }}>Interno</span>
            <div className="d-flex align-items-center gap-1">
              <Phone size={14} className="text-primary" />
              <span className="h2 fw-black font-monospace text-dark mb-0">{contacto.interno}</span>
            </div>
          </div>
          
          <button 
            onClick={() => onBorrar(contacto.id)} 
            className="btn btn-link text-danger p-0 group-hover-visible text-decoration-none"
            title="Eliminar"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contactos;