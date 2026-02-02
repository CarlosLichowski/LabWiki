import React, { useState, useEffect } from 'react';
import { 
  collection, addDoc, onSnapshot, query, orderBy, 
  deleteDoc, doc, serverTimestamp, setDoc, deleteField 
} from 'firebase/firestore';
import { db, auth } from '../Credenciales'; 
import { Search, Plus, Trash2, X, Star, Hash } from 'lucide-react';

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
    if (window.confirm("¿Estás seguro de que deseas eliminar este contacto permanentemente?")) {
      try {
        await deleteDoc(doc(db, 'contactos_internos', id));
      } catch (err) {
        console.error("Error al borrar:", err);
        alert("Error al intentar eliminar.");
      }
    }
  };

  const filtrados = contactos.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.area.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.interno.includes(busqueda)
  );

  const listaFavoritos = filtrados.filter(c => !!misFavoritos[c.id]);

  return (
    <div className="p-4 p-md-6 max-w-6xl mx-auto animate__animated animate__fadeIn">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Guía Telefónica</h2>
          <p className="text-slate-500 font-medium">Directorio de internos del servicio.</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1" style={{ minWidth: '220px' }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl w-full outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              placeholder="Buscar..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setMostrarForm(!mostrarForm)}
            className="flex items-center gap-2 font-bold px-4 py-2 rounded-xl shadow-md border-0 text-white transition-all active:scale-95"
            style={{ backgroundColor: mostrarForm ? '#ef4444' : '#2563eb' }}
          >
            {mostrarForm ? <X size={20}/> : <Plus size={20}/>}
            <span className="hidden sm:inline">{mostrarForm ? 'Cerrar' : 'Agregar'}</span>
          </button>
        </div>
      </div>

      {/* FORMULARIO */}
      {mostrarForm && (
        <form onSubmit={handleGuardar} className="mb-10 bg-white p-6 rounded-2xl border border-blue-100 shadow-lg animate__animated animate__fadeInDown">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input placeholder="Área" className="form-control p-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" value={nuevo.area} onChange={e => setNuevo({...nuevo, area: e.target.value})} required />
            <input placeholder="Nombre" className="form-control p-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} required />
            <input placeholder="Interno" className="form-control p-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none font-bold" value={nuevo.interno} onChange={e => setNuevo({...nuevo, interno: e.target.value})} required />
            <select className="form-select p-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none cursor-pointer" value={nuevo.tipo} onChange={e => setNuevo({...nuevo, tipo: e.target.value as any})}>
              <option value="sala">📞 Sala</option>
              <option value="medico">👨‍⚕️ Médico</option>
              <option value="cama">🛌 Cama</option>
            </select>
            <button type="submit" disabled={loading} className="md:col-span-4 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:bg-slate-400">
              {loading ? 'Guardando...' : 'Confirmar Nuevo Contacto'}
            </button>
          </div>
        </form>
      )}

      {/* LISTADO CON ESPACIADO SUPERIOR (mt-10) */}
      <div className="mt-10">
        {listaFavoritos.length > 0 && !busqueda && (
          <div className="mb-12">
            <h3 className="text-xs font-black text-amber-500 uppercase mb-4 flex items-center gap-2 tracking-widest">
              <Star size={14} fill="currentColor" /> Mis Frecuentes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listaFavoritos.map(c => (
                <ContactCard key={c.id} contacto={c} esFav={true} onToggleFav={toggleFavorito} onBorrar={handleBorrar} />
              ))}
            </div>
            <hr className="mt-10 border-slate-100" />
          </div>
        )}

        <h3 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest">Todos los contactos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.length > 0 ? (
            filtrados.map(c => (
              <ContactCard key={c.id} contacto={c} esFav={!!misFavoritos[c.id]} onToggleFav={toggleFavorito} onBorrar={handleBorrar} />
            ))
          ) : (
            <p className="col-span-full text-center text-slate-400 py-10">No se encontraron contactos.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const ContactCard = ({ contacto, esFav, onToggleFav, onBorrar }: any) => {
  return (
    <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
      {/* LADO IZQUIERDO: INFORMACIÓN */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tight">{contacto.area}</p>
        <h4 className="font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{contacto.nombre}</h4>
        <div className="flex items-center gap-1 mt-1">
          <Hash size={14} className="text-slate-400" />
          <p className="text-2xl font-mono font-black text-slate-900 tracking-tighter">
            {contacto.interno}
          </p>
        </div>
      </div>
      
      {/* LADO DERECHO: ACCIONES (Corregido: Siempre visibles) */}
      <div className="flex items-center gap-1">
        <button 
          onClick={() => onToggleFav(contacto.id)} 
          className={`p-2 rounded-xl transition-all hover:bg-amber-50 ${esFav ? 'text-amber-400 scale-110' : 'text-slate-300 hover:text-slate-400'}`}
          title="Favorito"
        >
          <Star size={22} fill={esFav ? "currentColor" : "none"} />
        </button>

        <button 
          onClick={() => onBorrar(contacto.id)} 
          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          title="Eliminar"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default Contactos;