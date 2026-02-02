//Favoritos.tsx

import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore'; 
import { db, auth } from '../Credenciales';

interface FavoriteItem {
  id: string;
  type: string;
  titulo: string;
  url: string;
  autor?: string;
}

const Favoritos: React.FC = () => {
  const [favoritosList, setFavoritosList] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const loadFavoritos = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const userRef = doc(db, 'usuarios', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const favsMap = userSnap.data().favoritos || {};
          const details: FavoriteItem[] = [];

          for (const key in favsMap) {
            const [collectionName, docId] = key.split(':');
            const docRef = doc(db, collectionName, docId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              const data = docSnap.data();
              details.push({
                id: docId,
                type: collectionName,
                titulo: data.titulo || "Sin título",
                url: data.url || "#",
                autor: data.autor
              });
            }
          }
          setFavoritosList(details);
        }
      } catch (e) {
        console.error("Error cargando favoritos:", e);
      } finally {
        setLoading(false);
      }
    };

    loadFavoritos();
  }, [user]);

  if (loading) return <div className="p-10 text-center">Cargando tus favoritos...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-slate-800">⭐ Mis Favoritos</h2>
      
      {favoritosList.length === 0 ? (
        <div className="bg-blue-50 p-6 rounded-xl text-blue-700 border border-blue-100 text-center">
          Aún no tienes elementos guardados como favoritos.
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden border">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 text-slate-600">Material</th>
                <th className="p-4 text-slate-600">Tipo</th>
                <th className="p-4 text-center text-slate-600">Acceso</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {favoritosList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-800">{item.titulo}</td>
                  <td className="p-4">
                    <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-500 uppercase">
                      {item.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <a href={item.url} target="_blank" rel="noreferrer" className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition-all">
                      Abrir
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Favoritos;