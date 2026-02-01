import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'; 
import type { DocumentData } from 'firebase/firestore';
import { Link } from 'react-router-dom';

interface HistoryEvent extends DocumentData {
    id: string;
    action: 'view' | 'comment' | 'upload' | 'favorite' | string; 
    timestamp: { seconds: number; nanoseconds: number; }; 
    contentId: string; 
    contentType: 'ateneo' | 'manual' | 'caso_clinico' | string;
    contentTitle: string; 
}

const Historial: React.FC = () => {
    const { user, db } = useAuth();
    const [historyList, setHistoryList] = useState<HistoryEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const userId = user?.uid;

    const fetchHistory = async () => {
        if (!userId || !db) {
            setLoading(false);
            return;
        }

        try {
            const historyRef = collection(db, 'historial_actividad');
            const q = query(
                historyRef,
                where('userId', '==', userId), 
                orderBy('timestamp', 'desc'), 
                limit(50)
            );

            const querySnapshot = await getDocs(q);
            const historyData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as HistoryEvent));

            setHistoryList(historyData);
        } catch (e) {
            console.error("Error al cargar el historial:", e);
            setError("No se pudo cargar el historial de actividad.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [userId, db]); 

    const formatTimestamp = (ts: HistoryEvent['timestamp']) => {
        if (!ts) return 'Fecha desconocida';
        const date = new Date(ts.seconds * 1000); 
        return date.toLocaleTimeString('es-AR', { 
            year: 'numeric', month: 'short', day: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
    };

    const getActionDescription = (event: HistoryEvent) => {
        const { action, contentType } = event; // Corregido: removido contentTitle no usado aquí
        const typeText = contentType.charAt(0).toUpperCase() + contentType.slice(1);
        
        switch (action) {
            case 'view': return `Viste el ${typeText}: `;
            case 'comment': return `Comentaste en el ${typeText}: `;
            case 'upload': return `Subiste nuevo ${typeText}: `;
            case 'favorite': return `Marcaste como favorito el ${typeText}: `;
            default: return `Realizaste acción en ${typeText}: `;
        }
    };
    
    if (loading) return <div className="text-center p-5"><div className="spinner-border text-info"></div><p className="mt-2">Cargando...</p></div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div>
            <h2 className="mb-4 text-info">🕒 Historial de Actividad</h2>
            {historyList.length === 0 ? (
                <div className="alert alert-warning">No se encontró actividad reciente.</div>
            ) : (
                <ul className="list-group list-group-flush">
                    {historyList.map((event) => (
                        <li key={event.id} className="list-group-item d-flex justify-content-between align-items-start">
                            <div className="me-auto">
                                <p className="fw-bold mb-0">
                                    {getActionDescription(event)}
                                    <Link to={`/${event.contentType}s/${event.contentId}`} className="text-decoration-none text-primary">
                                        {event.contentTitle}
                                    </Link>
                                </p>
                                <small className="text-muted">Acción: {event.action.toUpperCase()}</small>
                            </div>
                            <small className="text-end text-secondary mt-1">{formatTimestamp(event.timestamp)}</small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Historial;