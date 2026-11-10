//EstadisticasReactivos.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Activity, BarChart3 } from 'lucide-react';
import '../../css/Estadisticas.css';

export const EstadisticasReactivos: React.FC = () => {
  return (
    <div className="estadisticas-container">
      <header className="estadisticas-header">
        <h2>Control de Reactivos Roche Cobas 6000</h2>
        <p>Seleccione el módulo o vista analítica para la auditoría de reactivos.</p>
      </header>

      <div className="estadisticas-buttons-wrapper">
        <Link to="/estadisticas/estadisticasReactivos/planta" className="btn-estadisticaPlanta">
          <Layers size={20} />
          <span>Módulo c 501 (Planta / Bioquímica)</span>
        </Link>

        <Link to="/estadisticas/estadisticasReactivos/guardia" className="btn-estadisticaGuardia">
          <Activity size={20} />
          <span>Módulo ISE 1 (Guardia / Electrolitos)</span>
        </Link>

        <Link to="/estadisticas/cobas" className="btn-estadistica" style={{ backgroundColor: '#1e3a8a', width: '100%', justifyContent: 'center' }}>
          <BarChart3 size={20} />
          <span>Ver Plataforma Completa & Métricas Roche Cobas</span>
        </Link>
      </div>
    </div>
  );
};

export default EstadisticasReactivos;
