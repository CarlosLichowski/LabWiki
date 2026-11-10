// src/Pages/Metricas/GraficosYMetricas.tsx
// Redirección, compatibilidad y manejo de Cold Start para el sistema analítico Roche Cobas c501 / ISE

import React, { useState, useEffect } from 'react';
import ControlReactivosCobas from './ControlReactivosCobas';

export const GraficosYMetricas: React.FC = () => {
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [isColdStart, setIsColdStart] = useState<boolean>(false);

  useEffect(() => {
    // Temporizador de 3 segundos: si la carga inicial o el fetch demora más de 
    // lo habitual, se asume que el servidor gratuito en la nube está despertando.
    const coldStartTimer = setTimeout(() => {
      if (loadingInitial) {
        setIsColdStart(true);
      }
    }, 3000);

    // Simulación de verificación o pre-conexión al backend
    const verificarConexionBackend = async () => {
      try {
        const getApiUrl = () => {
          if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
            return (import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api';
          }
          return 'http://localhost:3000/api';
        };

        // Petición ligera de salud o métricas para despertar el servidor
        await fetch(`${getApiUrl()}/metricas/kpis?dias=7`);
      } catch (error) {
        console.warn('El servidor podría estar iniciando...', error);
      } finally {
        setLoadingInitial(false);
        clearTimeout(coldStartTimer);
      }
    };

    verificarConexionBackend();

    return () => clearTimeout(coldStartTimer);
  }, []);

  // Pantalla de carga con alerta interactiva de Cold Start para servidores gratuitos
  if (loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white rounded-xl shadow-sm border border-slate-200 text-center space-y-4 my-8 max-w-2xl mx-auto">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div>
          <p className="text-slate-800 font-bold text-lg">Cargando panel analítico de LabMetrics...</p>
          
          {isColdStart ? (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-left shadow-sm">
              <p className="text-amber-800 text-sm font-medium">
                ⏳ <strong>El servidor gratuito está despertando:</strong> Debido a un período de inactividad en la nube, la primera conexión puede demorar hasta 30 segundos. Por favor, no recargue la página. ¡Gracias por esperar!
              </p>
            </div>
          ) : (
            <p className="text-slate-500 text-sm mt-1">Conectando con la base de datos central...</p>
          )}
        </div>
      </div>
    );
  }

  // Una vez superado el arranque, renderiza la vista analítica correspondiente
  return <ControlReactivosCobas tabInicial="metricas" />;
};

export default GraficosYMetricas;