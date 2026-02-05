//Pages/NormasISO/NormasISO.tsx
import React, { useState, useEffect } from 'react';
import { db } from '../../Credenciales';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../Context/AuthContext';
import {  Plus, Search, Clock, User, ShieldCheck, AlignLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface Norma {
  id: string;
  titulo: string;
  resumen: string;
  contenidoDetallado: string;
  usuario: string;
  fecha: any;
  codigo: string;
}

const NormasISO = () => {
  const { user } = useAuth();
  const [normas, setNormas] = useState<Norma[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    resumen: '',
    codigo: '',
    contenidoDetallado: ''
  });

  // Cargar normas en tiempo real
  useEffect(() => {
    const q = query(collection(db, 'normas_iso'), orderBy('fecha', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Norma));
      setNormas(docs);
    });
    return () => unsub();
  }, []);

  const handleGuardarNorma = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      await addDoc(collection(db, 'normas_iso'), {
        titulo: formData.titulo,
        resumen: formData.resumen,
        codigo: formData.codigo,
        contenidoDetallado: formData.contenidoDetallado,
        usuario: user?.displayName || user?.email || "Usuario",
        fecha: Timestamp.now(),
        userId: user?.uid
      });

      toast.success("Normativa guardada con éxito");
      setShowModal(false);
      setFormData({ titulo: '', resumen: '', codigo: '', contenidoDetallado: '' });
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar la información");
    } finally {
      setGuardando(false);
    }
  };

  const normasFiltradas = normas.filter(n => 
    n.titulo.toLowerCase().includes(busqueda.toLowerCase()) || 
    n.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="container-fluid py-4 px-3">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <div className="bg-primary text-white p-3 rounded-3 me-3 shadow-sm">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="fw-bold mb-0">Gestión de Calidad ISO</h2>
            <p className="text-muted mb-0 d-none d-md-block">Base de conocimientos y resúmenes técnicos</p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-primary rounded-pill px-4 d-flex align-items-center shadow-sm"
        >
          <Plus size={18} className="me-2" /> <span className="d-none d-sm-inline">Nueva Entrada</span>
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="card border-0 shadow-sm mb-4 rounded-4">
        <div className="card-body p-2">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-0"><Search className="text-muted" size={20}/></span>
            <input 
              type="text" 
              className="form-control border-0 shadow-none" 
              placeholder="Buscar por código (Ej: 9001) o palabras clave..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* LISTADO DE NORMAS */}
      <div className="row g-3">
        {normasFiltradas.map((norma) => (
          <div key={norma.id} className="col-12">
            <div className="card border-0 shadow-sm rounded-4 transition-all">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">
                    ISO {norma.codigo}
                  </span>
                  <div className="text-muted small d-flex align-items-center">
                    <Clock size={14} className="me-1" />
                    {norma.fecha?.toDate().toLocaleDateString()}
                  </div>
                </div>
                
                <h4 className="fw-bold">{norma.titulo}</h4>
                <p className="text-secondary fw-medium mb-3">{norma.resumen}</p>
                
                <div className="bg-light p-3 rounded-3 mb-3" style={{ whiteSpace: 'pre-wrap' }}>
                  <AlignLeft size={16} className="text-primary mb-2" />
                  <div className="text-dark small">{norma.contenidoDetallado}</div>
                </div>

                <div className="d-flex align-items-center text-muted small border-top pt-3">
                  <User size={14} className="me-1" />
                  <span>Publicado por: <strong>{norma.usuario}</strong></span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE ENTRADA DE TEXTO */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold mb-0">Redactar Resumen de Norma</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleGuardarNorma}>
                <div className="modal-body p-4">
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label small fw-bold text-muted">CÓDIGO ISO</label>
                      <input type="text" placeholder="Ej: 15189" required className="form-control bg-light border-0" 
                        value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} />
                    </div>
                    <div className="col-md-8 mb-3">
                      <label className="form-label small fw-bold text-muted">TÍTULO</label>
                      <input type="text" placeholder="Ej: Requisitos de calidad en Laboratorio" required className="form-control bg-light border-0" 
                        value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">RESUMEN CORTO (Aparece en la tarjeta)</label>
                    <input type="text" placeholder="Una breve oración sobre el objetivo principal..." required className="form-control bg-light border-0" 
                      value={formData.resumen} onChange={e => setFormData({...formData, resumen: e.target.value})} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">DESARROLLO DE LA NORMA (Texto libre)</label>
                    <textarea 
                      required 
                      className="form-control bg-light border-0" 
                      rows={8}
                      placeholder="Escribe aquí los puntos clave, requisitos o explicaciones de la norma..."
                      value={formData.contenidoDetallado} 
                      onChange={e => setFormData({...formData, contenidoDetallado: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" disabled={guardando} className="btn btn-primary rounded-pill px-4 fw-bold">
                    {guardando ? 'Guardando...' : 'Guardar Información'}
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

export default NormasISO;