// src/components/ActivityLog/ActivityLog.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp, Firestore } from 'firebase/firestore';

export interface Activity {
    id?: string;
    type: string;
    message: string;
    createdAt: Timestamp;
}

interface ActivityLogProps {
    userId: string;
    db: Firestore; // 🔑 Pasamos la instancia limpia desde el contexto de Auth
    appId: string;  // 🔑 Evitamos importar credenciales fijas
}

// UI Loader moderna y sutil (SaaS Clean)
export const LoadingScreen: React.FC = () => (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-secondary mb-2" role="status" style={{ width: '2rem', height: '2rem', borderWidth: '0.2em' }}>
            <span className="visually-hidden">Cargando...</span>
        </div>
        <span className="text-muted small fw-medium">Sincronizando historial...</span>
    </div>
);

const ActivityLog: React.FC<ActivityLogProps> = ({ userId, db, appId }) => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    const logCollectionPath = useMemo(() => {
        return `artifacts/${appId}/users/${userId}/activity_logs`;
    }, [userId, appId]);

    useEffect(() => {
        setLoading(true);
        const q = query(
            collection(db, logCollectionPath),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, 
            (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Activity[];
                setActivities(data);
                setLoading(false);
            },
            (error) => {
                console.error("Error escuchando logs:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [db, logCollectionPath]);

    if (loading) return <LoadingScreen />;

    return (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h5 className="fw-bold text-dark m-0">Historial de Actividad</h5>
                    <p className="text-muted small m-0">Auditoría interna del operador</p>
                </div>
                <span className="badge bg-light text-secondary border rounded-pill px-3 py-2 fw-medium">
                    {activities.length} registros
                </span>
            </div>

            {activities.length === 0 ? (
                <div className="text-center py-5 text-muted small">No hay actividades registradas en esta sesión.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table align-middle table-hover m-0" style={{ fontSize: '0.9rem' }}>
                        <thead>
                            <tr className="text-secondary small" style={{ borderBottom: '1px solid #f0f2f5' }}>
                                <th className="fw-semibold bg-transparent ps-0">Evento</th>
                                <th className="fw-semibold bg-transparent">Descripción</th>
                                <th className="fw-semibold bg-transparent text-end pe-0">Fecha y Hora</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.map((log) => (
                                <tr key={log.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                                    <td className="ps-0">
                                        <span className={`badge px-2.5 py-1.5 rounded-3 fw-semibold ${
                                            log.type === 'LOGIN' ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'
                                        }`} style={{ fontSize: '0.75rem', letterSpacing: '0.3px' }}>
                                            {log.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="text-secondary fw-medium">{log.message}</td>
                                    <td className="text-muted text-end pe-0 small">
                                        {log.createdAt?.toDate().toLocaleString(undefined, {
                                            dateStyle: 'short',
                                            timeStyle: 'short'
                                        })}
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

export default ActivityLog;