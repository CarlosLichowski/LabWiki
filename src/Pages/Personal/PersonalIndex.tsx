// src/components/PersonalIndex.tsx

import React, { useEffect, useState } from "react";
import { collection, query, limit, onSnapshot, orderBy, Firestore } from "firebase/firestore";
import { Loader2, Zap, ExternalLink, User, Calendar } from "lucide-react";

const PersonalIndex: React.FC<{ db: Firestore }> = ({ db }) => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) return;
        const q = query(collection(db, "globalFeed/ateneos/items"), orderBy("createdAt", "desc"), limit(10));

        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(doc => {
                const d = doc.data();
                return {
                    id: doc.id,
                    titulo: d.titulo || "Sin título",
                    autor: d.autor || "Anónimo",
                    url: d.url || "#",
                    // CORRECCIÓN: Manejo robusto de timestamp
                    fecha: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString() : "Reciente"
                };
            });
            setItems(data);
            setLoading(false);
        });
        return () => unsub();
    }, [db]);

    if (loading) return <div className="text-center py-5"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="row g-3">
            {items.map(item => (
                <div key={item.id} className="col-12">
                    <div className="card border-0 shadow-sm border-start border-4 border-primary">
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="fw-bold mb-1">{item.titulo}</h6>
                                <div className="d-flex gap-3 small text-muted">
                                    <span><User size={12}/> {item.autor}</span>
                                    <span><Calendar size={12}/> {item.fecha}</span>
                                </div>
                            </div>
                            <a href={item.url} target="_blank" className="btn btn-primary btn-sm rounded-pill">Estudiar</a>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PersonalIndex;