//PlanillasIncidencias.tsx

import React, { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import './RegistroIncidencias.css';

interface FilaError {
  id: string;
  protocolo: string;
  cuil?: string;
  tipoError: {
    error147: boolean;
    sistema: boolean;
    administrativo: boolean;
    medico: boolean;
  };
  descripcion: string;
}

export const RegistroIncidencias: React.FC = () => {
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tecnico, setTecnico] = useState<string>('');
  
  // Estado para manejar múltiples filas de errores
  const [filas, setFilas] = useState<FilaError[]>([
    crearFilaVacia('1'),
    crearFilaVacia('2'),
    crearFilaVacia('3'),
  ]);

  function crearFilaVacia(id: string): FilaError {
    return {
      id,
      protocolo: '',
      cuil: '',
      tipoError: { error147: false, sistema: false, administrativo: false, medico: false },
      descripcion: '',
    };
  }

  const agregarFila = () => {
    const nuevoId = Date.now().toString();
    setFilas([...filas, crearFilaVacia(nuevoId)]);
  };

  const eliminarFila = (id: string) => {
    if (filas.length <= 1) return;
    setFilas(filas.filter((fila) => fila.id !== id));
  };

  const handleProtocoloChange = (id: string, valor: string) => {
    setFilas(
      filas.map((fila) => (fila.id === id ? { ...fila, protocolo: valor } : fila))
    );
  };

  const handleCheckboxChange = (id: string, campo: keyof FilaError['tipoError']) => {
    setFilas(
      filas.map((fila) => {
        if (fila.id === id) {
          return {
            ...fila,
            tipoError: {
              ...fila.tipoError,
              [campo]: !fila.tipoError[campo],
            },
          };
        }
        return fila;
      })
    );
  };

  const handleDescripcionChange = (id: string, valor: string) => {
    setFilas(
      filas.map((fila) => (fila.id === id ? { ...fila, descripcion: valor } : fila))
    );
  };

  const guardarPlanilla = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      fecha,
      tecnico,
      registros: filas.filter((fila) => fila.protocolo.trim() !== '' || fila.descripcion.trim() !== ''),
    };
    console.log('Datos listos para enviar:', payload);
    alert('Planilla de registro de errores guardada con éxito');
  };

  return (
    <div className="planilla-container">
      {/* Encabezado Oficial */}
      <header className="planilla-header">
        <div className="header-titles">
          <h1>PLANILLA DE REGISTRO DE ERRORES</h1>
          <h2>LABORATORIO CENTRAL - HOSPITAL RAMOS MEJÍA</h2>
        </div>

        <div className="header-inputs">
          <div className="field-group">
            <label>Fecha:</label>
            <input 
              type="date" 
              value={fecha} 
              onChange={(e) => setFecha(e.target.value)} 
            />
          </div>
          <div className="field-group">
            <label>Técnico / Operador:</label>
            <input 
              type="text" 
              placeholder="Nombre del técnico" 
              value={tecnico} 
              onChange={(e) => setTecnico(e.target.value)} 
            />
          </div>
        </div>
      </header>

      {/* Formulario Principal */}
      <form onSubmit={guardarPlanilla}>
        <div className="tabla-papel-wrapper">
          <table className="tabla-papel">
            <thead>
              <tr>
                <th className="col-header col-num">#</th>
                <th className="col-header col-protocolo">PACIENTE / N° DE PETICIÓN</th>
                <th className="col-header col-tipo">TIPO DE ERROR</th>
                <th className="col-header col-descripcion">DESCRIPCIÓN DE LA SITUACIÓN</th>
                <th className="col-header col-accion"></th>
              </tr>
            </thead>
            <tbody>
              {filas.map((fila, index) => (
                <tr key={fila.id} className="row-entry">
                  <td className="cell-number">{index + 1}</td>
                  
                  {/* Protocolo */}
                  <td className="cell-protocolo">
                    <input
                      type="text"
                      className="input-protocolo"
                      placeholder="N° de protocolo"
                      value={fila.protocolo}
                      onChange={(e) => handleProtocoloChange(fila.id, e.target.value)}
                    />
                  </td>

                  {/* Tipo de Error */}
                  <td className="cell-tipo">
                    <div className="checkbox-group-row">
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={fila.tipoError.error147}
                          onChange={() => handleCheckboxChange(fila.id, 'error147')}
                        />
                        <span>147</span>
                      </label>

                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={fila.tipoError.sistema}
                          onChange={() => handleCheckboxChange(fila.id, 'sistema')}
                        />
                        <span>Sistema</span>
                      </label>

                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={fila.tipoError.administrativo}
                          onChange={() => handleCheckboxChange(fila.id, 'administrativo')}
                        />
                        <span>Administrativo</span>
                      </label>

                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={fila.tipoError.medico}
                          onChange={() => handleCheckboxChange(fila.id, 'medico')}
                        />
                        <span>Médico</span>
                      </label>
                    </div>
                  </td>

                  {/* Descripción */}
                  <td className="cell-descripcion">
                    <textarea
                      className="textarea-incidencia-row"
                      placeholder="Describa detalladamente el error..."
                      value={fila.descripcion}
                      onChange={(e) => handleDescripcionChange(fila.id, e.target.value)}
                      rows={2}
                    />
                  </td>

                  {/* Botón Eliminar Fila */}
                  <td className="cell-action">
                    {filas.length > 1 && (
                      <button 
                        type="button" 
                        className="btn-delete-row" 
                        onClick={() => eliminarFila(fila.id)}
                        title="Eliminar registro"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Acciones y Botones */}
        <div className="planilla-actions">
          <button type="button" className="btn-add" onClick={agregarFila}>
            <Plus size={16} /> Agregar Registro
          </button>

          <button type="submit" className="btn-save">
            <Save size={16} /> Guardar Registro de Errores
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistroIncidencias;