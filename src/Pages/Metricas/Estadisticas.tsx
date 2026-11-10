import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, FlaskConical, BarChart3, ClipboardList } from 'lucide-react';
import '../../css/Estadisticas.css';

export const Estadisticas: React.FC = () => {
  return (
    <div className="estadisticas-container">
      <header className="estadisticas-header">
        <h2>Sistema de Estadísticas & Auditoría LIS</h2>
        <p>Control de Calidad, Incidencias y Gestión de Reactivos Roche Cobas 6000</p>
      </header>

      <div className="estadisticas-buttons-wrapper">
        <Link to="/estadisticas/cobas" className="btn-estadistica" style={{ backgroundColor: '#1e3a8a' }}>
          <BarChart3 size={20} />
          <span>Panel & Métricas Roche Cobas (Pestaña 1)</span>
        </Link>

        <Link to="/estadisticas/estadisticasReactivos/planta" className="btn-estadistica" style={{ backgroundColor: '#059669' }}>
          <ClipboardList size={20} />
          <span>Planilla Carga Mensual & Diferencial (Pestaña 2)</span>
        </Link>

        <Link to="/estadisticas/estadisticasReactivos/" className="btn-estadistica" style={{ backgroundColor: '#0284c7' }}>
          <FlaskConical size={20} />
          <span>Catálogo de Reactivos (Planta / Guardia)</span>
        </Link>

        <Link to="/estadisticas/registroincidencias" className="btn-estadistica" style={{ backgroundColor: '#475569' }}>
          <AlertTriangle size={20} />
          <span>Planilla Registro Incidencias</span>
        </Link>
      </div>
    </div>
  );
};

export default Estadisticas;
