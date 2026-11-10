// TarjetaReactivo.tsx
import React from 'react';
import { db } from '../../../Credenciales';
import { doc, updateDoc } from 'firebase/firestore';
import { Tag, ExternalLink, Check, AlertTriangle, Layers, Factory } from 'lucide-react';
import type { Reactivo } from '../Insertos';
import '../../../css/TarjetaReactivo.css';

interface TarjetaProps {
    item: Reactivo;
    areas: string[];
    updatingId: string | null;
    setUpdatingId: (id: string | null) => void;
    reactivosList: Reactivo[];
    setReactivosList: React.Dispatch<React.SetStateAction<Reactivo[]>>;
}

export const TarjetaReactivo: React.FC<TarjetaProps> = ({
    item,
    areas,
    updatingId,
    setUpdatingId,
    reactivosList,
}) => {
    const itemId = item.id;
    const isUpdating = updatingId === itemId;

    const getAreaColor = (reactivo: Reactivo) => {
        if (!reactivo.realizado_en_laboratorio) return '#dc3545'; 
        return '#198754'; 
    };

    const getProviderHeaderStyle = (proveedor: string) => {
        switch (proveedor) {
            case 'ROCHE':
                return { bg: '#0d47a1', color: '#ffffff', borderBottom: '2px solid #0a3a82' }; 
            case 'ABBOTT':
                return { bg: '#e65100', color: '#ffffff', borderBottom: '2px solid #b23c00' }; 
            case 'SIEMENS':
                return { bg: '#004d40', color: '#ffffff', borderBottom: '2px solid #00332a' }; 
            default:
                return { bg: '#424242', color: '#ffffff', borderBottom: '2px solid #212121' }; 
        }
    };

    const handleToggleLaboratorio = async (id: string, currentStatus: boolean) => {
        const itemOriginal = reactivosList.find(r => r.id === id);
        if (!itemOriginal) return;

        setUpdatingId(id);
        try {
            const docRef = doc(db, 'reactivos', id);
            await updateDoc(docRef, {
                realizado_en_laboratorio: !currentStatus,
                area: itemOriginal.area || 'Química'
            });
        } catch (error) {
            console.error("Error actualizando estado del reactivo:", error);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleAreaChange = async (id: string, newArea: string) => {
        const itemOriginal = reactivosList.find(r => r.id === id);
        if (!itemOriginal) return;

        setUpdatingId(id);
        try {
            const docRef = doc(db, 'reactivos', id);
            await updateDoc(docRef, {
                realizado_en_laboratorio: itemOriginal.realizado_en_laboratorio,
                area: newArea
            });
        } catch (error) {
            console.error("Error actualizando área técnica:", error);
        } finally {
            setUpdatingId(null);
        }
    };

    const cardColor = getAreaColor(item);
    const headerStyle = getProviderHeaderStyle(item.proveedor);

    return (
        <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white hover-card d-flex flex-column justify-content-between transition-all">
            <div>
                {/* CINTA DE MARCA ESTILIZADA */}
                <div 
                    className="w-100 text-center py-2 px-3 d-flex align-items-center justify-content-center gap-2 font-monospace fw-black text-uppercase shadow-sm fs-6"
                    style={{ 
                        backgroundColor: headerStyle.bg, 
                        color: headerStyle.color, 
                        borderBottom: headerStyle.borderBottom,
                        letterSpacing: '1.2px'
                    }}
                >
                    <Factory size={14} />
                    <span>{item.proveedor}</span>
                </div>

                {/* Indicador de color por estado */}
                <div style={{ height: '4px', backgroundColor: cardColor }}></div>
                
                {/* Cuerpo de la Tarjeta */}
                <div className="card-body p-4 pb-0">
                    <div className="mb-3">
                        <span className="badge rounded-pill fw-bold" style={{ backgroundColor: `${cardColor}12`, color: cardColor, fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>
                            {item.area} — {item.realizado_en_laboratorio ? 'En Laboratorio' : 'Derivado'}
                        </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                        <h3 className="fw-black mb-0 flex-grow-1" style={{ color: cardColor, letterSpacing: '-0.5px' }}>
                            {item.analito}
                        </h3>
                        {item.url_imagen && (
                            <img 
                                src={item.url_imagen} 
                                alt={item.analito} 
                                className="img-fluid rounded border bg-light p-1 shadow-sm" 
                                style={{ width: '46px', height: '46px', objectFit: 'contain' }}
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                        )}
                    </div>
                    
                    <div className="d-flex flex-wrap gap-1 align-items-center text-muted mb-4 extra-small">
                        <Tag size={12} style={{ color: cardColor }} className="opacity-60 me-1"/> 
                        {item.codigos_catalogo.map((cod) => (
                            <span key={cod} className="font-monospace fw-bold bg-light px-2 py-1 rounded border" style={{ color: cardColor, borderColor: `${cardColor}33` }}>
                                {cod}
                            </span>
                        ))}
                        <span className="text-muted font-monospace ms-auto opacity-50 small">ID: {item.id}</span>
                    </div>

                    <div className="position-relative mb-4">
                        <p className="text-secondary small lh-base text-truncate-custom mb-0">
                            {item.descripcion || "Sin descripción disponible para esta prueba diagnóstica."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Contenedor Inferior de Acciones */}
            <div className="card-footer bg-white border-0 pt-0 px-4 pb-4 d-flex flex-column gap-3">
                <div className="w-100 rounded-3 shadow-sm border overflow-hidden bg-white" style={{ borderColor: `${cardColor}44` }}>
                    {/* Fila superior: Estado en Laboratorio */}
                    <div 
                        className="d-flex justify-content-between align-items-center p-3 text-white fw-semibold transition-all" 
                        style={{ backgroundColor: cardColor, fontSize: '0.8rem', opacity: isUpdating ? 0.6 : 1 }}
                    >
                        <div className="d-flex align-items-center gap-2 ps-1">
                            {item.realizado_en_laboratorio ? <Check size={15} /> : <AlertTriangle size={15} />}
                            <span>{item.realizado_en_laboratorio ? `En Lab: ${item.area}` : 'No se realiza'}</span>
                        </div>
                        <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleToggleLaboratorio(itemId, item.realizado_en_laboratorio)}
                            className="btn btn-xs bg-white text-dark rounded-2 py-1 px-2.5 fw-bold border-0 shadow-sm hover-opacity"
                            style={{ fontSize: '0.75rem' }}
                        >
                            {item.realizado_en_laboratorio ? 'Desactivar' : 'Activar'}
                        </button>
                    </div>

                    {/* Fila inferior: Selector de Área */}
                    <div className="p-3 bg-light d-flex align-items-center justify-content-between gap-2 border-top border-light-subtle">
                        <span className="text-muted small d-flex align-items-center gap-1 fw-medium">
                            <Layers size={13} className="text-secondary" /> Sección Técnica:
                        </span>
                        <select
                            disabled={isUpdating}
                            value={item.area || 'Química'}
                            onChange={(e) => handleAreaChange(itemId, e.target.value)}
                            className="form-select form-select-sm py-1 px-2 bg-white border rounded shadow-none text-dark fw-medium"
                            style={{ fontSize: '0.75rem', width: 'auto', minWidth: '140px', cursor: 'pointer' }}
                        >
                            {areas.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                </div>

                {/* Enlace de Documentación */}
                {item.url_catalogo && item.url_catalogo.trim() !== "" ? (
                    <a 
                        href={item.url_catalogo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn w-100 rounded-3 py-2 fw-semibold btn-sm d-flex align-items-center justify-content-center border bg-light text-secondary border-secondary-subtle transition-all hover-bg-gray"
                    >
                        <span>Documentación Técnica ({item.proveedor})</span>
                        <ExternalLink size={13} className="ms-2 opacity-70" />
                    </a>
                ) : (
                    <button disabled className="btn w-100 rounded-3 py-2 btn-sm btn-light text-muted border-0 opacity-50 style-disabled">
                        Ficha Técnica No Disponible
                    </button>
                )}
            </div>
        </div>
    );
};