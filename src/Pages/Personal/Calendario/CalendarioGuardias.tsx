//Pages/Calendario/CalendarioGuardias.tsx

import CalendarioGeneral from './CalendarioGeneral';

const CalendarioGuardias = () => {
  return (
    <div className="animate__animated animate__fadeIn">
      <CalendarioGeneral 
        tipo="guardia" 
        titulo="Guardias del Servicio" 
        defaultColor="#2563eb"
      />
    </div>
  );
};

export default CalendarioGuardias;