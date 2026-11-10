// src/Pages/Metricas/PlanillaConsumoReactivos.tsx
// Redirección y compatibilidad con el sistema de carga mensual y diferencial de reactivos Roche Cobas

import React from 'react';
import ControlReactivosCobas from './ControlReactivosCobas';

export const EstadisticasReactivosPlanta: React.FC = () => {
  return <ControlReactivosCobas tabInicial="carga" />;
};

export default EstadisticasReactivosPlanta;
