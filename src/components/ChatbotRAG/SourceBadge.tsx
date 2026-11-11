// src/components/ChatbotRAG/SourceBadge.tsx

import React, { useState } from 'react';
import { FileText, Cpu, Truck, Database, X } from 'lucide-react';
import type { FuenteRAG, TipoFuente } from './types';

interface SourceBadgeProps {
  fuente: FuenteRAG;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ fuente }) => {
  const [showModal, setShowModal] = useState(false);

  const getSourceConfig = (tipo: TipoFuente) => {
    switch (tipo) {
      case 'inserto':
        return {
          label: 'Inserto Técnico',
          icon: FileText,
          bgClass: 'badge-inserto',
          accentColor: '#38bdf8',
          prefix: 'Insert:',
        };
      case 'manual':
        return {
          label: 'Manual de Equipo',
          icon: Cpu,
          bgClass: 'badge-manual',
          accentColor: '#a78bfa',
          prefix: 'Manual:',
        };
      case 'derivacion':
        return {
          label: 'Logística Derivación',
          icon: Truck,
          bgClass: 'badge-derivacion',
          accentColor: '#34d399',
          prefix: 'Derivación:',
        };
      case 'base_de_datos':
        return {
          label: 'Base de Datos LIS',
          icon: Database,
          bgClass: 'badge-database',
          accentColor: '#fbbf24',
          prefix: 'BD:',
        };
      default:
        return {
          label: 'Documento',
          icon: FileText,
          bgClass: 'badge-default',
          accentColor: '#94a3b8',
          prefix: 'Doc:',
        };
    }
  };

  const config = getSourceConfig(fuente.tipo);
  const IconComponent = config.icon;

  return (
    <>
      <button
        type="button"
        className={`rag-source-badge ${config.bgClass}`}
        onClick={() => setShowModal(true)}
        title={`Ver fragmento citado de ${fuente.archivoFuente}`}
      >
        <IconComponent size={13} className="badge-icon" style={{ color: config.accentColor }} />
        <span className="badge-prefix">{config.prefix}</span>
        <span className="badge-filename">{fuente.archivoFuente.replace('.pdf', '').replace('.sql', '')}</span>
      </button>

      {/* Modal / Popover de Inspección de Fuente */}
      {showModal && (
        <div className="rag-source-modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="rag-source-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="rag-modal-header">
              <div className="d-flex align-items-center gap-2">
                <IconComponent size={18} style={{ color: config.accentColor }} />
                <div>
                  <h6 className="rag-modal-title mb-0">{fuente.titulo}</h6>
                  <span className="rag-modal-subtitle">{config.label} • {fuente.seccion}</span>
                </div>
              </div>
              <button
                type="button"
                className="rag-modal-close"
                onClick={() => setShowModal(false)}
                aria-label="Cerrar vista de fuente"
              >
                <X size={16} />
              </button>
            </div>

            <div className="rag-modal-body">
              <div className="rag-source-meta-item">
                <span className="meta-label">Archivo Fuente:</span>
                <span className="meta-value font-monospace">{fuente.archivoFuente}</span>
              </div>
              <div className="rag-source-meta-item">
                <span className="meta-label">Sección Técnica:</span>
                <span className="meta-value">{fuente.seccion}</span>
              </div>

              <div className="rag-source-fragment-box">
                <div className="fragment-header">
                  <span>Fragmento Indexado Recuperado:</span>
                </div>
                <p className="fragment-content">{fuente.fragmento}</p>
              </div>
            </div>

            <div className="rag-modal-footer">
              <span className="rag-verification-badge">
                ✓ Contenido verificado por el LIS de LabRamos
              </span>
              <button
                type="button"
                className="rag-btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
