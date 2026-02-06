//Pages/Bioseguridad/Bioseguirdad.tsx


import React, { useState } from 'react';
import { 
  ShieldCheck, 
  HandMetal, 
  Trash2, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Thermometer, 
  ExternalLink,
  Droplets,
  Stethoscope
} from 'lucide-react';

const Bioseguridad: React.FC = () => {
  const [tab, setTab] = useState<'normas' | 'residuos' | 'accidentes'>('normas');

  return (
    <div className="container py-4 animate__animated animate__fadeIn">
      {/* Header Informativo */}
      <div className="bg-primary text-white p-4 rounded-4 shadow-sm mb-4 d-flex align-items-center justify-content-between">
        <div>
          <h3 className="fw-bold m-0 d-flex align-items-center gap-2">
            <ShieldCheck size={28} /> Bioseguridad Hospitalaria
          </h3>
          <p className="m-0 opacity-75">Protocolos basados en las normas del GCBA</p>
        </div>
        <div className="bg-white text-primary p-2 rounded-3 fw-bold small">
          Universalidad
        </div>
      </div>

      {/* Navegación Interna */}
      <div className="nav nav-pills nav-fill bg-white p-2 rounded-pill shadow-sm mb-4 border">
        <button 
          className={`nav-link rounded-pill fw-bold ${tab === 'normas' ? 'active' : ''}`}
          onClick={() => setTab('normas')}
        >
          Precauciones Estándar
        </button>
        <button 
          className={`nav-link rounded-pill fw-bold ${tab === 'residuos' ? 'active' : ''}`}
          onClick={() => setTab('residuos')}
        >
          Gestión de Residuos
        </button>
        <button 
          className={`nav-link rounded-pill fw-bold ${tab === 'accidentes' ? 'active' : ''}`}
          onClick={() => setTab('accidentes')}
        >
          Accidentes Laborales
        </button>
      </div>

      {/* CONTENIDO 1: PRECAUCIONES ESTÁNDAR */}
      {tab === 'normas' && (
        <div className="row g-3">
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-3">
              <h5 className="fw-bold border-bottom pb-2 mb-3 text-primary">Lavado de Manos</h5>
              <p className="text-muted">Es la medida más importante para evitar la transmisión de infecciones. Debe realizarse antes y después de cada procedimiento.</p>
              <div className="row g-2">
                {['Antes del contacto con paciente', 'Antes de tarea aséptica', 'Después de riesgo de exposición', 'Después del contacto con paciente', 'Después del entorno del paciente'].map((step, idx) => (
                  <div key={idx} className="col-md-4 col-lg">
                    <div className="bg-light p-2 rounded-3 text-center small border h-100 d-flex align-items-center justify-content-center fw-bold">
                      {idx + 1}. {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                <HandMetal className="text-primary" /> Barreras de Protección (EPP)
              </h5>
              <ul className="list-group list-group-flush small">
                <li className="list-group-item d-flex align-items-center gap-2">
                  <CheckCircle size={16} className="text-success" /> <strong>Guantes:</strong> No reemplazan el lavado de manos.
                </li>
                <li className="list-group-item d-flex align-items-center gap-2">
                  <CheckCircle size={16} className="text-success" /> <strong>Barbijos/Máscaras:</strong> En riesgo de salpicaduras.
                </li>
                <li className="list-group-item d-flex align-items-center gap-2">
                  <CheckCircle size={16} className="text-success" /> <strong>Camisolines:</strong> Para proteger piel y ropa.
                </li>
                <li className="list-group-item d-flex align-items-center gap-2">
                  <CheckCircle size={16} className="text-success" /> <strong>Protección Ocular:</strong> Ante riesgo de aerosoles.
                </li>
              </ul>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-warning-subtle">
              <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                <AlertTriangle className="text-warning" /> Manejo de Punzocortantes
              </h5>
              <p className="small mb-2"><strong>Regla de Oro:</strong> Jamás reencapuchar las agujas.</p>
              <div className="p-3 bg-white rounded-3 border border-warning shadow-sm">
                <p className="small m-0">El descarte debe ser inmediato y realizado por el mismo operador en el contenedor rígido.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO 2: RESIDUOS */}
      {tab === 'residuos' && (
        <div className="row g-3">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
              <div className="bg-danger p-3 text-white text-center fw-bold">BOLSA ROJA</div>
              <div className="p-3 text-center">
                <Droplets size={40} className="text-danger mb-2" />
                <h6>Residuos Patogénicos</h6>
                <p className="small text-muted">Gasas con sangre, cultivos, tejidos, guantes usados.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
              <div className="bg-black p-3 text-white text-center fw-bold">BOLSA NEGRA</div>
              <div className="p-3 text-center">
                <Trash2 size={40} className="text-dark mb-2" />
                <h6>Residuos Comunes</h6>
                <p className="small text-muted">Papeles, envoltorios de jeringas, restos de comida.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden border-warning">
              <div className="bg-warning p-3 text-dark text-center fw-bold">DESCARTADOR RÍGIDO</div>
              <div className="p-3 text-center">
                <AlertTriangle size={40} className="text-warning mb-2" />
                <h6>Punzocortantes</h6>
                <p className="small text-muted">Agujas, bisturíes, vidrios rotos contaminados.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO 3: ACCIDENTES */}
      {tab === 'accidentes' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-light border-start border-danger border-5">
          <h4 className="fw-bold text-danger mb-4">¿Qué hacer ante una exposición?</h4>
          <div className="row g-4">
            <div className="col-md-6 border-end">
              <h6 className="fw-bold">1. Lavado inmediato</h6>
              <p className="small text-muted">Si fue pinchazo: Lavar con abundante agua y jabón, permitir sangrado. No frotar excesivamente.</p>
              <p className="small text-muted">Si fue mucosa: Lavar con solución fisiológica o agua corriente.</p>
            </div>
            <div className="col-md-6">
              <h6 className="fw-bold">2. Notificación (Crítico)</h6>
              <p className="small text-muted">Informar de inmediato al Jefe de Laboratorio o Guardia Médica para evaluación de Profilaxis Post-Exposición (dentro de las 2 hs del evento).</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded-3 border d-flex align-items-center justify-content-between">
            <span className="small"><Info className="text-primary me-2"/> Recordá tener tu carnet de Vacunación (Hepatitis B) al día.</span>
            <a href="https://buenosaires.gob.ar/salud/recursos-para-profesionales/bioseguridad" target="_blank" rel="noreferrer" className="btn btn-outline-primary btn-sm rounded-pill">
              Sitio Oficial GCBA <ExternalLink size={14} className="ms-1" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bioseguridad;