// src/Pages/Personal/Calendario/CalendarioVacaciones.tsx
import CalendarioGeneral from './CalendarioGeneral';
import '../../css/CalendarioVacaciones.css';

const CalendarioVacaciones = () => {
  return (
    <div className="animate__animated animate__fadeIn calendario-page-container">
      <CalendarioGeneral 
        tipo="vacaciones" 
        titulo="Cronograma de Vacaciones" 
        defaultColor="#10b981"
      />
    </div>
  );
};

export default CalendarioVacaciones;