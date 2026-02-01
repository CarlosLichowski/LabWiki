
// src/Pages/Personal/Ateneos/Ateneos.tsx
import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../../../Credenciales'; 

const Ateneos: React.FC = () => {
  const [ateneos, setAteneos] = useState<any[]>([]);
  const [titulo, setTitulo] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. ESCUCHAR DATOS EN TIEMPO REAL
  useEffect(() => {
    // Apuntamos a la nueva colección raíz definida en las reglas
    const q = query(collection(db, 'ateneos_biblioteca'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      console.log("📡 Conectado a Firebase: Documentos encontrados:", docs.length);
      setAteneos(docs);
    }, (error) => {
      console.error("❌ Error en Listener:", error.message);
    });

    return () => unsubscribe();
  }, []);

  // 2. PUBLICAR DATOS
  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !url.trim()) return;

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Sesión expirada. Por favor, vuelve a ingresar.");
        return;
      }

      const nuevoAteneo = {
        titulo: titulo.trim(),
        url: url.trim(),
        autor: user.displayName || user.email?.split('@')[0] || "Usuario",
        userId: user.uid,
        createdAt: serverTimestamp() // Fecha oficial del servidor
      };

      console.log("📤 Intentando guardar en ateneos_biblioteca...");
      const docRef = await addDoc(collection(db, 'ateneos_biblioteca'), nuevoAteneo);
      
      console.log("✅ ¡Guardado con éxito! ID del documento:", docRef.id);
      setTitulo('');
      setUrl('');

    } catch (err: any) {
      console.error("❌ Error al publicar:", err.message);
      alert("Error de Firebase: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-slate-800">Biblioteca de Ateneos</h2>
      
      <form onSubmit={handlePublicar} className="mb-10 flex flex-col md:flex-row gap-4 bg-white p-6 shadow-sm border rounded-xl">
        <input 
          className="border p-3 flex-1 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Nombre del procedimiento o ateneo" 
          value={titulo} 
          onChange={e => setTitulo(e.target.value)}
        />
        <input 
          className="border p-3 flex-1 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Link (PDF, Drive, etc.)" 
          value={url} 
          onChange={e => setUrl(e.target.value)}
        />
        <button 
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-slate-400 transition-all"
          disabled={loading}
        >
          {loading ? 'Subiendo...' : 'Publicar'}
        </button>
      </form>

      <div className="bg-white shadow-md rounded-xl overflow-hidden border">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-bold text-slate-600">Material</th>
              <th className="p-4 font-bold text-slate-600">Autor</th>
              <th className="p-4 font-bold text-slate-600">Fecha</th>
              <th className="p-4 text-center font-bold text-slate-600">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ateneos.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-10 text-center text-slate-400 italic">No hay documentos registrados todavía.</td>
              </tr>
            ) : (
              ateneos.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-semibold text-slate-800">{item.titulo}</td>
                  <td className="p-4 text-slate-600">{item.autor}</td>
                  <td className="p-4 text-sm text-slate-500">
                    {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Procesando...'}
                  </td>
                  <td className="p-4 text-center">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">Abrir</a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ateneos;