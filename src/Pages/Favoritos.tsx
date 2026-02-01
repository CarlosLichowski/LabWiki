import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext'; // Asegúrate que la ruta sea correcta
import { doc, getDoc } from 'firebase/firestore'; 
import type { DocumentData } from 'firebase/firestore';

interface FavoriteItem extends DocumentData {
    id: string;
    type: string; // Ejemplo: 'ateneo', 'manual', 'caso_clinico'
    title: string;
    // Agrega aquí más campos necesarios para mostrar en la lista
}

const Favoritos: React.FC = () => {
    // Asumimos que useAuth proporciona las instancias de Firebase y el usuario
    const { user, db } = useAuth();
    const [favoritosList, setFavoritosList] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const userId = user?.uid;

    // 🟢 FUNCIÓN CLAVE: Cargar la lista de IDs de favoritos del perfil del usuario
    const fetchFavoriteIds = async (): Promise<Record<string, string> | null> => {
        if (!userId || !db) return null;

        try {
            // Asume que tienes una colección 'usuarios' donde guardas el perfil
            const userRef = doc(db, 'usuarios', userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                // Asume que el mapa de favoritos se guarda bajo el campo 'favoritos'
                // Formato: { 'ateneos:id1': 'ateneo', 'manuales:id2': 'manual' }
                return userSnap.data().favoritos || {};
            }
            return null;
        } catch (e) {
            console.error("Error al obtener IDs de favoritos:", e);
            setError("No se pudo cargar la lista de favoritos.");
            return null;
        }
    };

    // 🟢 FUNCIÓN CLAVE: Cargar los detalles del contenido usando los IDs
    const fetchFavoriteDetails = async (favoriteIdsMap: Record<string, string>) => {
        if (Object.keys(favoriteIdsMap).length === 0) {
            setLoading(false);
            return;
        }

        const details: FavoriteItem[] = [];
        
        // El mapa contiene claves como 'ateneos:ID_DOCUMENTO'
        for (const key in favoriteIdsMap) {
            const [collectionName, docId] = key.split(':');
            
            try {
                // ⚠️ NOTA: Si necesitas acceder a más de 10 colecciones, considera un índice de búsqueda central
                const docRef = doc(db!, collectionName, docId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    details.push({
                        id: docId,
                        type: collectionName,
                        title: docSnap.data().title || `Elemento sin título (${collectionName})`,
                        ...docSnap.data()
                    } as FavoriteItem);
                }
            } catch (e) {
                console.warn(`No se pudo cargar detalle para el ID: ${key}`, e);
            }
        }
        
        setFavoritosList(details);
        setLoading(false);
    };


    useEffect(() => {
        setLoading(true);
        const loadFavoritos = async () => {
            const idsMap = await fetchFavoriteIds();
            if (idsMap) {
                await fetchFavoriteDetails(idsMap);
            } else {
                setLoading(false);
            }
        };

        loadFavoritos();
    }, [userId, db]); // Se ejecuta al cargar el componente o si cambia el usuario/DB

    // ----------------------------------------------------
    // ⬇️ RENDERIZADO ⬇️
    // ----------------------------------------------------

    if (loading) {
        return (
            <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando tus elementos guardados...</p>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <div>
            <h2 className="mb-4 text-primary">⭐ Mis Favoritos</h2>
            
            {favoritosList.length === 0 ? (
                <div className="alert alert-info">
                    Aún no has guardado ningún elemento como favorito.
                </div>
            ) : (
                <div className="list-group">
                    {favoritosList.map((item) => (
                        <a 
                            key={item.id + item.type}
                            href={`/${item.type}/${item.id}`} // Enlaza a la página de detalle correcta
                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        >
                            <span className="fw-bold">{item.title}</span>
                            <span className={`badge bg-${item.type === 'ateneos' ? 'success' : item.type === 'manuales' ? 'warning' : 'secondary'}`}>
                                {item.type.toUpperCase()}
                            </span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Favoritos;