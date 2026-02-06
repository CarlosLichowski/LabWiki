//Pages/Entretenimiento/Entretenimiento.tsx
import React, { useState, useEffect } from 'react';
import { 
  collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, 
  deleteDoc, doc, updateDoc, increment, getDocs, where, limit 
} from 'firebase/firestore';
import { db, auth } from '../../../Credenciales';
import { 
  Trophy, Brain, ArrowRight, Plus, Trash2, Edit, X, Flame, Send, 
  Medal, User, Target, BarChart3
} from 'lucide-react';

interface Pregunta {
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
}

interface QuizDoc {
  id: string;
  titulo: string;
  preguntas: Pregunta[];
  autor: string;
  autorId: string;
  jugadas: number;
  createdAt: any;
}

interface RankingEntry {
  id: string;
  userName: string;
  score: number;
  totalQuestions: number;
  quizTitle: string;
  quizId: string;
}

const Entretenimiento: React.FC = () => {
  const [vista, setVista] = useState<'menu' | 'jugar' | 'crear' | 'ranking'>('menu');
  const [quizzes, setQuizzes] = useState<QuizDoc[]>([]);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [quizSeleccionado, setQuizSeleccionado] = useState<QuizDoc | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  
  // Estados del Juego
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [puntaje, setPuntaje] = useState(0);
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  // Estados del Creador
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevasPreguntas, setNuevasPreguntas] = useState<Pregunta[]>([]);
  const [tempPregunta, setTempPregunta] = useState({
    pregunta: '',
    opciones: ['', '', '', ''],
    respuestaCorrecta: 0
  });

  const currentUser = auth.currentUser;

  useEffect(() => {
    const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setQuizzes(snapshot.docs.map(d => ({ id: d.id, jugadas: d.data().jugadas || 0, ...d.data() } as QuizDoc)));
    });
    return () => unsub();
  }, []);

  const cargarRankingGlobal = async () => {
    const q = query(collection(db, 'quizzes_ranking'), orderBy('score', 'desc'), limit(10));
    const snap = await getDocs(q);
    setRanking(snap.docs.map(d => ({ id: d.id, ...d.data() } as RankingEntry)));
    setVista('ranking');
  };

  const guardarPuntajeEnRanking = async (finalScore: number, total: number, title: string, qId: string) => {
    try {
      await addDoc(collection(db, 'quizzes_ranking'), {
        userId: currentUser?.uid,
        userName: currentUser?.displayName || 'Anónimo',
        score: finalScore,
        totalQuestions: total,
        quizTitle: title,
        quizId: qId,
        timestamp: serverTimestamp()
      });
    } catch (err) { console.error("Error guardando ranking", err); }
  };

  const terminarJuego = () => {
    if (quizSeleccionado) {
      guardarPuntajeEnRanking(puntaje, quizSeleccionado.preguntas.length, quizSeleccionado.titulo, quizSeleccionado.id);
    }
    setMostrarResultado(true);
  };

  const cancelarCreacion = () => {
    setVista('menu');
    setEditandoId(null);
    setNuevoTitulo('');
    setNuevasPreguntas([]);
    setTempPregunta({ pregunta: '', opciones: ['', '', '', ''], respuestaCorrecta: 0 });
  };

  const guardarQuiz = async () => {
    if (!nuevoTitulo.trim() || nuevasPreguntas.length === 0) return;
    const data = {
      titulo: nuevoTitulo,
      preguntas: nuevasPreguntas,
      autor: currentUser?.displayName || 'Anónimo',
      autorId: currentUser?.uid,
      updatedAt: serverTimestamp()
    };
    if (editandoId) await updateDoc(doc(db, 'quizzes', editandoId), data);
    else await addDoc(collection(db, 'quizzes'), { ...data, jugadas: 0, createdAt: serverTimestamp() });
    cancelarCreacion();
  };

  return (
    <div className="container py-4">
      {/* HEADER DINÁMICO */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold m-0 text-dark">Área Recreativa 🔬</h3>
          <p className="text-muted small m-0">Aprende jugando con tus colegas</p>
        </div>
        <div className="d-flex gap-2">
          {vista === 'menu' && (
            <>
              <button className="btn btn-outline-primary rounded-pill fw-bold" onClick={cargarRankingGlobal}>
                <Trophy size={18} className="me-1"/> Ranking
              </button>
              <button className="btn btn-success rounded-pill fw-bold shadow-sm" onClick={() => setVista('crear')}>
                <Plus size={18} className="me-1"/> Crear Quiz
              </button>
            </>
          )}
        </div>
      </div>

      {/* VISTA RANKING */}
      {vista === 'ranking' && (
        <div className="card border-0 shadow-lg rounded-4 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold m-0 text-primary"><Medal className="me-2"/>Hall de la Fama</h4>
            <button className="btn btn-light rounded-circle" onClick={() => setVista('menu')}><X/></button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Usuario</th>
                  <th>Quiz</th>
                  <th>Puntaje</th>
                  <th className="text-center">Efectividad</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r, i) => (
                  <tr key={r.id}>
                    <td><div className="fw-bold"><User size={14} className="me-1"/>{r.userName}</div></td>
                    <td className="small text-muted">{r.quizTitle}</td>
                    <td><span className="badge bg-success">{r.score} / {r.totalQuestions}</span></td>
                    <td className="text-center fw-bold text-primary">
                      {Math.round((r.score / r.totalQuestions) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA MENÚ */}
      {vista === 'menu' && (
        <div className="row g-3">
          {quizzes.map(q => (
            <div key={q.id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-3 position-relative" onClick={() => {
                updateDoc(doc(db, 'quizzes', q.id), { jugadas: increment(1) });
                setQuizSeleccionado(q); setPreguntaActual(0); setPuntaje(0); setSeleccion(null); setMostrarResultado(false); setVista('jugar');
              }} style={{cursor:'pointer'}}>
                {currentUser?.uid === q.autorId && (
                  <div className="position-absolute top-0 end-0 p-2 d-flex gap-1" style={{zIndex: 10}}>
                    <button className="btn btn-sm btn-light border rounded-circle" onClick={(e) => { e.stopPropagation(); setEditandoId(q.id); setNuevoTitulo(q.titulo); setNuevasPreguntas(q.preguntas); setVista('crear'); }}><Edit size={14}/></button>
                    <button className="btn btn-sm btn-light border rounded-circle text-danger" onClick={(e) => { e.stopPropagation(); if(confirm("¿Borrar?")) deleteDoc(doc(db, 'quizzes', q.id)); }}><Trash2 size={14}/></button>
                  </div>
                )}
                <div className="bg-success-subtle text-success p-2 rounded-3 d-inline-block mb-2" style={{width:'fit-content'}}><Brain size={24}/></div>
                <h5 className="fw-bold mb-1">{q.titulo}</h5>
                <p className="text-muted small">Por: {q.autor}</p>
                <div className="d-flex justify-content-between align-items-center mt-auto">
                    <span className="badge bg-light text-dark border">{q.preguntas.length} Preguntas</span>
                    {q.jugadas > 0 && <span className="small text-warning fw-bold"><Flame size={14} fill="orange"/> {q.jugadas}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VISTA CREADOR */}
      {vista === 'crear' && (
        <div className="card border-0 shadow-lg rounded-4 p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold m-0">{editandoId ? 'Editar' : 'Nuevo'} Desafío</h4>
            <button className="btn btn-light rounded-circle" onClick={cancelarCreacion}><X /></button>
          </div>
          <input className="form-control mb-4 fw-bold shadow-sm" placeholder="Título del Quiz" value={nuevoTitulo} onChange={e => setNuevoTitulo(e.target.value)} />
          <div className="bg-light p-3 rounded-4 border mb-3 shadow-sm">
             <input className="form-control mb-3" placeholder="Escribe la pregunta..." value={tempPregunta.pregunta} onChange={e => setTempPregunta({...tempPregunta, pregunta: e.target.value})} />
             <div className="row g-2 mb-3">
                {tempPregunta.opciones.map((op, i) => (
                  <div className="col-6" key={i}>
                    <div className={`input-group input-group-sm border rounded-2 ${tempPregunta.respuestaCorrecta === i ? 'border-success ring-1' : ''}`}>
                      <span className="input-group-text bg-white">
                        <input type="radio" name="correcta" checked={tempPregunta.respuestaCorrecta === i} onChange={() => setTempPregunta({...tempPregunta, respuestaCorrecta: i})} />
                      </span>
                      <input className="form-control border-0" placeholder={`Opción ${i+1}`} value={op} onChange={e => {
                        const nos = [...tempPregunta.opciones]; nos[i] = e.target.value; setTempPregunta({...tempPregunta, opciones: nos});
                      }} />
                    </div>
                  </div>
                ))}
             </div>
             <button className="btn btn-dark w-100 rounded-3" onClick={() => {
               if(!tempPregunta.pregunta || tempPregunta.opciones.some(o => !o)) return;
               setNuevasPreguntas([...nuevasPreguntas, tempPregunta]);
               setTempPregunta({ pregunta: '', opciones: ['', '', '', ''], respuestaCorrecta: 0 });
             }}>Añadir Pregunta</button>
          </div>
          <div className="mb-4">
             {nuevasPreguntas.map((p, i) => (
               <div key={i} className="small border-bottom py-2 d-flex justify-content-between">
                 <span><b>{i+1}.</b> {p.pregunta}</span>
                 <button className="btn btn-link btn-sm text-danger p-0" onClick={() => setNuevasPreguntas(nuevasPreguntas.filter((_, idx) => idx !== i))}>Eliminar</button>
               </div>
             ))}
          </div>
          <button className="btn btn-success w-100 rounded-pill fw-bold py-3" onClick={guardarQuiz} disabled={nuevasPreguntas.length === 0}><Send size={18} className="me-2"/> Publicar</button>
        </div>
      )}

      {/* VISTA JUEGO */}
      {vista === 'jugar' && quizSeleccionado && (
        <div className="card border-0 shadow-lg rounded-4 p-4 text-center mx-auto" style={{maxWidth: '600px'}}>
            {!mostrarResultado ? (
              <>
                <div className="progress mb-4" style={{height: '8px'}}>
                  <div className="progress-bar bg-success" style={{width: `${((preguntaActual+1)/quizSeleccionado.preguntas.length)*100}%`}}></div>
                </div>
                <h4 className="fw-bold mb-4">{quizSeleccionado.preguntas[preguntaActual].pregunta}</h4>
                <div className="d-grid gap-2 mb-4">
                    {quizSeleccionado.preguntas[preguntaActual].opciones.map((o, i) => (
                        <button key={i} className={`btn btn-lg text-start p-3 rounded-3 fw-bold ${seleccion === null ? 'btn-outline-secondary' : (i === quizSeleccionado.preguntas[preguntaActual].respuestaCorrecta ? 'btn-success' : (i === seleccion ? 'btn-danger' : 'btn-light'))}`}
                        onClick={() => { if(seleccion === null) { setSeleccion(i); if(i === quizSeleccionado.preguntas[preguntaActual].respuestaCorrecta) setPuntaje(puntaje+1); } }}>
                            {o}
                        </button>
                    ))}
                </div>
                {seleccion !== null && (
                    <button className="btn btn-success w-100 py-3 rounded-pill fw-bold" onClick={() => {
                        if(preguntaActual + 1 < quizSeleccionado.preguntas.length) { setPreguntaActual(preguntaActual+1); setSeleccion(null); }
                        else terminarJuego();
                    }}>Siguiente <ArrowRight size={18}/></button>
                )}
              </>
            ) : (
                <div className="py-5">
                    <Trophy size={80} className="text-warning mb-3" />
                    <h2 className="fw-bold">¡Buen trabajo!</h2>
                    <div className="display-4 fw-bold text-success mb-2">{puntaje} / {quizSeleccionado.preguntas.length}</div>
                    <p className="text-muted mb-4">Tu puntaje ha sido registrado en el Ranking.</p>
                    <button className="btn btn-dark btn-lg rounded-pill px-5" onClick={() => setVista('menu')}>Volver al Menú</button>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Entretenimiento;