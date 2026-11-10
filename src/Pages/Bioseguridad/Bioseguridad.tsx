import React, { useState } from 'react';
import { 
  ShieldCheck, 
  HandMetal, 
  Trash2, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  ExternalLink,
  Droplets,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import '../../css/Bioseguridad.css';

const Bioseguridad: React.FC = () => {
  const [tab, setTab] = useState<'normas' | 'residuos' | 'accidentes'>('normas');

  return (
    <div className="bioseguridad-container">
      {/* Header Informativo */}
      <header className="bioseguridad-header">
        <div className="bioseguridad-header-content">
          <div className="bioseguridad-header-text">
            <h3 className="bioseguridad-title">
              <ShieldCheck size={26} className="icon-shrink-0" /> Bioseguridad Hospitalaria
            </h3>
            <p className="bioseguridad-subtitle">Protocolos basados en las normas del GCBA</p>
          </div>
          <span className="bioseguridad-badge">
            Universalidad
          </span>
        </div>
      </header>

      {/* Navegación Interna Adaptada */}
      <nav className="bioseguridad-nav">
        <div className="bioseguridad-nav-grid">
          <button 
            className={`bioseguridad-nav-tab ${tab === 'normas' ? 'active' : ''}`}
            onClick={() => setTab('normas')}
          >
            Precauciones
          </button>
          <button 
            className={`bioseguridad-nav-tab ${tab === 'residuos' ? 'active' : ''}`}
            onClick={() => setTab('residuos')}
          >
            Residuos
          </button>
          <button 
            className={`bioseguridad-nav-tab ${tab === 'accidentes' ? 'active' : ''}`}
            onClick={() => setTab('accidentes')}
          >
            Accidentes
          </button>
        </div>
      </nav>

      {/* CONTENIDO 1: PRECAUCIONES ESTÁNDAR */}
      {tab === 'normas' && (
        <div className="bioseguridad-grid">
          <div className="bioseguridad-grid-col-full">
            <div className="bioseguridad-card">
              <h5 className="bioseguridad-card-title text-primary underline">Lavado de Manos</h5>
              <p className="bioseguridad-card-description">
                Es la medida más importante para evitar la transmisión de infecciones. Debe realizarse antes y después de cada procedimiento.
              </p>
              <div className="bioseguridad-steps-grid">
                {[
                  'Antes del contacto con paciente', 
                  'Antes de tarea aséptica', 
                  'Después de riesgo de exposición', 
                  'Después del contacto con paciente', 
                  'Después del entorno del paciente'
                ].map((step, idx) => (
                  <div key={idx} className="bioseguridad-step-item">
                    <span className="bioseguridad-step-number">{idx + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bioseguridad-grid-col-half">
            <div className="bioseguridad-card">
              <h5 className="bioseguridad-card-title">
                <HandMetal className="text-primary icon-shrink-0" /> Barreras de Protección (EPP)
              </h5>
              <ul className="bioseguridad-list">
                <li className="bioseguridad-list-item">
                  <CheckCircle size={18} className="text-success icon-shrink-0" /> 
                  <div><strong>Guantes:</strong> No reemplazan el lavado de manos.</div>
                </li>
                <li className="bioseguridad-list-item">
                  <CheckCircle size={18} className="text-success icon-shrink-0" /> 
                  <div><strong>Barbijos/Máscaras:</strong> En riesgo de salpicaduras.</div>
                </li>
                <li className="bioseguridad-list-item">
                  <CheckCircle size={18} className="text-success icon-shrink-0" /> 
                  <div><strong>Camisolines:</strong> Para proteger piel y ropa.</div>
                </li>
                <li className="bioseguridad-list-item">
                  <CheckCircle size={18} className="text-success icon-shrink-0" /> 
                  <div><strong>Protección Ocular:</strong> Ante riesgo de aerosoles.</div>
                </li>
              </ul>
            </div>
          </div>

          <div className="bioseguridad-grid-col-half">
            <div className="bioseguridad-card card-warning-subtle">
              <h5 className="bioseguridad-card-title">
                <AlertTriangle className="text-warning icon-shrink-0" /> Manejo de Punzocortantes
              </h5>
              <p className="bioseguridad-card-description"><strong>Regla de Oro:</strong> Jamás reencapuchar las agujas.</p>
              <div className="bioseguridad-highlight-box border-warning">
                <p className="bioseguridad-highlight-text">
                  El descarte debe ser inmediato y realizado por el mismo operador en el contenedor rígido.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO 2: RESIDUOS */}
      {tab === 'residuos' && (
        <div className="bioseguridad-grid">
          <div className="bioseguridad-grid-col-third">
            <div className="bioseguridad-card overflow-hidden padding-0">
              <div className="bioseguridad-residuo-banner bg-danger">BOLSA ROJA</div>
              <div className="bioseguridad-residuo-body">
                <Droplets size={36} className="text-danger margin-b-2" />
                <h6 className="bioseguridad-residuo-title">Residuos Patogénicos</h6>
                <p className="bioseguridad-residuo-desc">Gasas con sangre, cultivos, tejidos, guantes usados.</p>
              </div>
            </div>
          </div>

          <div className="bioseguridad-grid-col-third">
            <div className="bioseguridad-card overflow-hidden padding-0">
              <div className="bioseguridad-residuo-banner bg-dark">BOLSA NEGRA</div>
              <div className="bioseguridad-residuo-body">
                <Trash2 size={36} className="text-dark margin-b-2" />
                <h6 className="bioseguridad-residuo-title">Residuos Comunes</h6>
                <p className="bioseguridad-residuo-desc">Papeles, envoltorios de jeringas, restos de comida.</p>
              </div>
            </div>
          </div>

          <div className="bioseguridad-grid-col-third">
            <div className="bioseguridad-card overflow-hidden padding-0 border-warning">
              <div className="bioseguridad-residuo-banner bg-warning">DESCARTADOR RÍGIDO</div>
              <div className="bioseguridad-residuo-body">
                <AlertTriangle size={36} className="text-warning margin-b-2" />
                <h6 className="bioseguridad-residuo-title">Punzocortantes</h6>
                <p className="bioseguridad-residuo-desc">Agujas, bisturíes, vidrios rotos contaminados.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO 3: ACCIDENTES */}
      {tab === 'accidentes' && (
        <div className="bioseguridad-card card-accidentes">
          <h5 className="bioseguridad-card-title text-danger margin-b-3">¿Qué hacer ante una exposición?</h5>
          <div className="bioseguridad-accidentes-grid">
            <div className="bioseguridad-accidente-step">
              <h6 className="bioseguridad-accidente-heading">1. Lavado inmediato</h6>
              <p className="bioseguridad-accidente-text"><strong>Pinchazo:</strong> Lavar con abundante agua y jabón, permitir sangrado. No frotar.</p>
              <p className="bioseguridad-accidente-text"><strong>Mucosa:</strong> Lavar con solución fisiológica o agua corriente.</p>
            </div>
            <div className="bioseguridad-accidente-step">
              <h6 className="bioseguridad-accidente-heading">2. Notificación (Crítico)</h6>
              <p className="bioseguridad-accidente-text">Informar de inmediato al Jefe de Laboratorio o Guardia Médica para evaluación de Profilaxis Post-Exposición (idealmente dentro de las 2 hs).</p>
            </div>
          </div>
          <div className="bioseguridad-footer-alert">
            <span className="bioseguridad-alert-info">
              <Info size={18} className="text-primary icon-shrink-0" /> Recordá tener tu carnet de Vacunación (Hepatitis B) al día.
            </span>
            <a 
              href="https://buenosaires.gob.ar/salud/recursos-para-profesionales/bioseguridad" 
              target="_blank" 
              rel="noreferrer" 
              className="bioseguridad-external-btn"
            >
              Sitio GCBA <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}

      {/* Botón Volver */}
      <div className="bioseguridad-back-wrapper">
        <Link to="/" className="bioseguridad-back-btn">
          <ArrowLeft size={16} className="text-primary" /> 
          <span>Volver al Inicio</span>
        </Link>
      </div>
    </div>
  );
};

export default Bioseguridad;