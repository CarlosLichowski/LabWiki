//ActivityLog.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { APP_ID } from '../Credenciales'; 


export interface Activity {
    id?: string;
    type: string;
    message: string;
    createdAt: Timestamp;
}

interface ActivityLogProps {
    userId: string;
}

export const LoadingScreen: React.FC = () => (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
        </div>
    </div>
);

interface ErrorScreenProps {
    message: string;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ message }) => (
    <div className="alert alert-danger text-center m-5" role="alert">
        <h4>Error de Autenticación</h4>
        <p>{message}</p>
        <p className="small">Por favor, inicia sesión nuevamente.</p>
    </div>
);

export const logActivity = async (
    userId: string,
    type: string,
    message: string
): Promise<void> => {
    try {
        const db = getFirestore();

        const path = `artifacts/${APP_ID}/users/${userId}/activity_logs`;

        await addDoc(collection(db, path), {
            type,
            message,
            createdAt: Timestamp.now(),
        });

        console.log(`Actividad registrada: [${type}] ${message}`);
    } catch (error) {
        console.error('Error registrando actividad:', error);
    }
};

const ActivityLog: React.FC<ActivityLogProps> = ({ userId }) => {
    const [activities, setActivities] = useState<Activity[]>([]);

    const logCollectionPath = useMemo(() => {
        return `artifacts/${APP_ID}/users/${userId}/activity_logs`;
    }, [userId]);

    useEffect(() => {
        const db = getFirestore();

        const q = query(
            collection(db, logCollectionPath),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Activity[];

            setActivities(data);
        });

        return () => unsubscribe();
    }, [logCollectionPath]);

    return (
        <div className="container mt-4">
            <h3 className="fw-bold">Historial de Actividad</h3>
            <ul className="list-group mt-3">
                {activities.map((log) => (
                    <li key={log.id} className="list-group-item">
                        <strong>{log.type}</strong> — {log.message}
                        <div className="text-muted small">
                            {log.createdAt.toDate().toLocaleString()}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ActivityLog;
