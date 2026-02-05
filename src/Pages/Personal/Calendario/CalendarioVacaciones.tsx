//Pages/Calendario/CalendarioVacaciones.tsx

import CalendarioGeneral from './CalendarioGeneral';

const CalendarioVacaciones = () => {
  return (
    <div className="animate__animated animate__fadeIn">
      <CalendarioGeneral 
        tipo="vacaciones" 
        titulo="Cronograma de Vacaciones" 
        defaultColor="#10b981"
      />
    </div>
  );
};

export default CalendarioVacaciones;