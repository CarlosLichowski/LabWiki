// cargaReactivosPlanta.ts

import { db } from '../src/Credenciales';
import { doc, setDoc } from 'firebase/firestore';
import { CATALAGO_PRUEBAS_PLANTA } from './reactivosCatalogos'; // Ajusta la ruta relativa si el script está en otra carpeta

export const migrarReactivosAFirestore = async () => {
  try {
    console.log('Iniciando carga de reactivos a Firestore...');
    
    for (const prueba of CATALAGO_PRUEBAS_PLANTA) {
      // Usamos el 'codigo' como ID del documento en la colección
      const docRef = doc(db, 'estadisticas_reactivos_planta', prueba.codigo);
      
      await setDoc(docRef, {
        codigo: prueba.codigo,
        nombre: prueba.nombre,
        acn: Number(prueba.acn),
        unidad: prueba.unidad
      });
      
      console.log(`Cargado: ${prueba.codigo} - ${prueba.nombre}`);
    }

    alert('¡Todos los reactivos se cargaron con éxito en Firestore!');
  } catch (error) {
    console.error('Error al migrar reactivos:', error);
    alert('Ocurrió un error al cargar los reactivos. Revisa la consola.');
  }
};