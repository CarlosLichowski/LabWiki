//Pages/Entretenimiento/Entretenimiento.tsx
import React, { useState, useEffect } from 'react';
import { 
  collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, 
  deleteDoc, doc, updateDoc, increment, getDocs, limit 
} from 'firebase/firestore';
import { db, auth } from '../Credenciales';
import { 
  Trophy, Brain, ArrowRight, Plus, Trash2, Edit, X, Flame, Send, 
  Medal, User
} from 'lucide-react';
import '../css/Entretenimiento.css';

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
  
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [puntaje, setPuntaje] = useState(0);
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevasPreguntas, setNuevasPreguntas] = useState<Pregunta[]>([]);
  const [tempPregunta, setTempPregunta] = useState({
    pregunta: '', opciones: ['', '', '', ''], respuestaCorrecta: 0
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
    <div className="entertainment-layout">
      
      {/* HEADER PRINCIPAL */}
      <div className="entertainment-header">
        <div>
          <h3 className="entertainment-header__title">Área Recreativa 🔬</h3>
          <p className="entertainment-header__subtitle">Aprende jugando con tus colegas</p>
        </div>
        <div className="entertainment-header__buttons">
          {vista === 'menu' && (
            <>
              <button className="btn-ent-outline" onClick={cargarRankingGlobal}>
                <Trophy size={16}/> Ranking
              </button>
              <button className="btn-ent-success" onClick={() => setVista('crear')}>
                <Plus size={16}/> Crear Quiz
              </button>
            </>
          )}
        </div>
      </div>

      {/* RENDER VISTAS */}
      {vista === 'ranking' && (
        <div className="ent-card fade-in">
          <div className="ent-card__header">
            <h4 className="ent-card__title title-primary"><Medal size={20}/>Hall de la Fama</h4>
            <button className="btn-close-circle" onClick={() => setVista('menu')}><X size={18}/></button>
          </div>
          <div className="ent-table-responsive">
            <table className="ent-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Quiz</th>
                  <th>Puntaje</th>
                  <th className="text-center">Efectividad</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r) => (
                  <tr key={r.id}>
                    <td><div className="table-user-cell"><User size={14}/>{r.userName}</div></td>
                    <td className="text-muted small">{r.quizTitle}</td>
                    <td><span className="badge-score">{r.score} / {r.totalQuestions}</span></td>
                    <td className="text-center text-primary fw-bold">
                      {Math.round((r.score / r.totalQuestions) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {vista === 'menu' && (
        <div className="quiz-grid">
          {quizzes.map(q => (
            <div key={q.id} className="quiz-card-wrapper" onClick={() => {
              updateDoc(doc(db, 'quizzes', q.id), { jugadas: increment(1) });
              setQuizSeleccionado(q); setPreguntaActual(0); setPuntaje(0); setSeleccion(null); setMostrarResultado(false); setVista('jugar');
            }}>
              <div className="quiz-card">
                {currentUser?.uid === q.autorId && (
                  <div className="quiz-card__actions" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-action-round" onClick={() => { setEditandoId(q.id); setNuevoTitulo(q.titulo); setNuevasPreguntas(q.preguntas); setVista('crear'); }}><Edit size={12}/></button>
                    <button className="btn-action-round text-danger" onClick={() => { if(confirm("¿Borrar?")) deleteDoc(doc(db, 'quizzes', q.id)); }}><Trash2 size={12}/></button>
                  </div>
                )}
                <div className="quiz-card__icon"><Brain size={22}/></div>
                <h5 className="quiz-card__title">{q.titulo}</h5>
                <p className="quiz-card__author">Por: {q.autor}</p>
                <div className="quiz-card__footer">
                  <span className="quiz-card__badge">{q.preguntas.length} Preguntas</span>
                  {q.jugadas > 0 && <span className="quiz-card__streak"><Flame size={14} fill="orange"/> {q.jugadas}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {vista === 'crear' && (
        <div className="ent-card max-width-md fade-in">
          <div className="ent-card__header">
            <h4 className="ent-card__title">{editandoId ? 'Editar' : 'Nuevo'} Desafío</h4>
            <button className="btn-close-circle" onClick={cancelarCreacion}><X size={18}/></button>
          </div>
          <input className="ent-input-title" placeholder="Título del Quiz" value={nuevoTitulo} onChange={e => setNuevoTitulo(e.target.value)} />
          
          <div className="creator-box">
             <input className="ent-input-field mb-3" placeholder="Escribe la pregunta..." value={tempPregunta.pregunta} onChange={e => setTempPregunta({...tempPregunta, pregunta: e.target.value})} />
             <div className="options-grid">
                {tempPregunta.opciones.map((op, i) => (
                  <div className={`option-input-group ${tempPregunta.respuestaCorrecta === i ? 'option-input-group--correct' : ''}`} key={i}>
                    <label className="radio-container">
                      <input type="radio" name="correcta" checked={tempPregunta.respuestaCorrecta === i} onChange={() => setTempPregunta({...tempPregunta, respuestaCorrecta: i})} />
                      <span className="radio-checkmark"></span>
                    </label>
                    <input className="input-clean" placeholder={`Opción ${i+1}`} value={op} onChange={e => {
                      const nos = [...tempPregunta.opciones]; nos[i] = e.target.value; setTempPregunta({...tempPregunta, opciones: nos});
                    }} />
                  </div>
                ))}
             </div>
             <button className="btn-ent-dark" onClick={() => {
               if(!tempPregunta.pregunta || tempPregunta.opciones.some(o => !o)) return;
               setNuevasPreguntas([...nuevasPreguntas, tempPregunta]);
               setTempPregunta({ pregunta: '', opciones: ['', '', '', ''], respuestaCorrecta: 0 });
             }}>Añadir Pregunta</button>
          </div>

          <div className="questions-preview-list">
             {nuevasPreguntas.map((p, i) => (
               <div key={i} className="preview-item">
                 <span><b>{i+1}.</b> {p.pregunta}</span>
                 <button className="btn-text-danger" onClick={() => setNuevasPreguntas(nuevasPreguntas.filter((_, idx) => idx !== i))}>Eliminar</button>
               </div>
             ))}
          </div>
          <button className="btn-submit-quiz" onClick={guardarQuiz} disabled={nuevasPreguntas.length === 0}><Send size={16}/> Publicar</button>
        </div>
      )}

      {vista === 'jugar' && quizSeleccionado && (
        <div className="ent-card max-width-sm text-center fade-in">
            {!mostrarResultado ? (
              <>
                <div className="custom-progress-bar">
                  <div className="custom-progress-bar__fill" style={{width: `${((preguntaActual+1)/quizSeleccionado.preguntas.length)*100}%`}}></div>
                </div>
                <h4 className="game-question-text">{quizSeleccionado.preguntas[preguntaActual].pregunta}</h4>
                <div className="game-options-stack">
                    {quizSeleccionado.preguntas[preguntaActual].opciones.map((o, i) => {
                      let optionClass = "btn-game-option";
                      if (seleccion !== null) {
                        if (i === quizSeleccionado.preguntas[preguntaActual].respuestaCorrecta) optionClass += " option-correct";
                        else if (i === seleccion) optionClass += " option-wrong";
                        else optionClass += " option-disabled";
                      }
                      return (
                        <button key={i} className={optionClass} onClick={() => { if(seleccion === null) { setSeleccion(i); if(i === quizSeleccionado.preguntas[preguntaActual].respuestaCorrecta) setPuntaje(puntaje+1); } }}>
                          {o}
                        </button>
                      );
                    })}
                </div>
                {seleccion !== null && (
                    <button className="btn-ent-success py-3 w-100 uppercase font-bold" onClick={() => {
                        if(preguntaActual + 1 < quizSeleccionado.preguntas.length) { setPreguntaActual(preguntaActual+1); setSeleccion(null); }
                        else terminarJuego();
                    }}>Siguiente <ArrowRight size={16}/></button>
                )}
              </>
            ) : (
                <div className="results-wrapper">
                  <Trophy size={72} className="icon-gold animate-bounce" />
                  <h2 className="results-title">¡Buen trabajo!</h2>
                  <div className="score-display">{puntaje} / {quizSeleccionado.preguntas.length}</div>
                  <p className="text-muted mb-4">Tu puntaje ha sido registrado en el Ranking.</p>
                  <button className="btn-ent-dark px-5" onClick={() => setVista('menu')}>Volver al Menú</button>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Entretenimiento;