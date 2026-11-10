// Components/UserDataChecking/UserDataChecking.tsx
import React, { useState, useEffect } from 'react';
import appFirebase from '../../Credenciales';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import '../../css/UserDataCheck.css';

const auth = getAuth(appFirebase);
const db = getFirestore(appFirebase);

const listaServicios = [
  "Laboratorio Central",
  "Parasitologia",
  "Endocrinologia",
  "Hematologia",
  "Hemoterapia",
  "Salud Mental",
  "Psiquiatria",
  "Clinica Medica",
  "Traumatologia",
  "Urologia",
  "Ginecologia",
  "Obstetricia",
  "Pediatria",
  "Uco/Cardio",
  "Kinesiologia",
  "Gastroenterologia",
  "Oftalmologia",
  "Neonatología",
  "Cirugía General",
  "Neurologia",
  "Dermatologia",
  "Diagnóstico por imágenes",
  "UTI"
];

interface UserDataCheckingProps {
  children: React.ReactNode;
}

export const UserDataChecking: React.FC<UserDataCheckingProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  // Estado para saber qué campos le faltan al usuario
  const [faltantes, setFaltantes] = useState<{
    nombre: boolean;
    email: boolean;
    telefono: boolean;
    servicio: boolean;
  }>({
    nombre: false,
    email: false,
    telefono: false,
    servicio: false
  });

  // Estado local para los inputs del formulario dinámico
  const [inputs, setInputs] = useState({
    nombre: '',
    email: '',
    telefono: '',
    servicio: 'Laboratorio Central'
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);

        // 🚀 EXCEPCIÓN MODO DEMO
        // Si el usuario es el de prueba, ignoramos el chequeo y no bloqueamos la app
        if (user.email === 'testuser@testuser.com') {
          setFaltantes({
            nombre: false,
            email: false,
            telefono: false,
            servicio: false
          });
          setLoading(false);
          return;
        }

        try {
          const userDocRef = doc(db, 'usuarios', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();

            // Evaluamos dinámicamente qué campos faltan o están vacíos
            const faltaNombre = !data.nombre || !data.nombre.trim();
            const faltaEmail = !data.email || !data.email.trim();
            const faltaTelefono = !data.telefono || !data.telefono.trim();
            const faltaServicio = !data.servicio || !data.servicio.trim();

            setFaltantes({
              nombre: faltaNombre,
              email: faltaEmail,
              telefono: faltaTelefono,
              servicio: faltaServicio
            });

            // Precargamos en los inputs lo que ya exista
            setInputs({
              nombre: data.nombre || '',
              email: data.email || user.email || '',
              telefono: data.telefono || '',
              servicio: data.servicio || 'Laboratorio Central'
            });

          } else {
            // Si el documento en Firestore no existe de plano, le exigimos rellenar todo
            setFaltantes({
              nombre: true,
              email: true,
              telefono: true,
              servicio: true
            });
            setInputs(prev => ({
              ...prev,
              email: user.email || '',
              nombre: user.displayName || ''
            }));
          }
        } catch (err) {
          console.error("Error al verificar los datos de usuario:", err);
        }
      } else {
        setUserId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: name === 'telefono' ? value.replace(/\D/g, '') : value
    }));
  };

  const handleGuardarDatos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setError('');
    setGuardando(true);

    // Armamos dinámicamente el objeto con los datos a actualizar en Firestore
    const actualizaciones: Record<string, any> = {};

    if (faltantes.nombre) {
      if (!inputs.nombre.trim()) return setError("El nombre y apellido es obligatorio.");
      actualizaciones.nombre = inputs.nombre.trim();
    }
    if (faltantes.email) {
      if (!inputs.email.trim()) return setError("El correo electrónico es obligatorio.");
      actualizaciones.email = inputs.email.trim();
    }
    if (faltantes.telefono) {
      if (!inputs.telefono.trim()) return setError("El teléfono o interno es obligatorio.");
      actualizaciones.telefono = inputs.telefono.trim();
    }
    if (faltantes.servicio) {
      if (!inputs.servicio.trim()) return setError("Debes seleccionar un servicio.");
      actualizaciones.servicio = inputs.servicio;
    }

    try {
      const userDocRef = doc(db, 'usuarios', userId);
      
      // 1. Guardar/actualizar en la colección 'usuarios' usando merge
      await setDoc(userDocRef, actualizaciones, { merge: true });

      // 2. Si se actualizó teléfono o servicio, sincronizamos también con la Guía Telefónica
      if (faltantes.telefono || faltantes.servicio) {
        const contactoDocRef = doc(db, 'contactos_internos', userId);
        const currentUser = auth.currentUser;

        const nombreContacto = inputs.nombre.trim() || currentUser?.displayName || "Usuario Registrado";
        const emailContacto = inputs.email.trim() || currentUser?.email || "";

        await setDoc(contactoDocRef, {
          area: inputs.servicio,
          nombre: nombreContacto,
          email: emailContacto,
          interno: inputs.telefono.trim(),
          tipo: 'medico',
          updatedAt: serverTimestamp(),
          userId: userId
        }, { merge: true });
      }

      // Limpiamos faltantes para dar acceso a la app
      setFaltantes({
        nombre: false,
        email: false,
        telefono: false,
        servicio: false
      });
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      setError("Ocurrió un error al intentar guardar los datos.");
    } finally {
      setGuardando(false);
    }
  };

  // Si está cargando el estado de autenticación inicial
  if (loading) {
    return (
      <div className="loading-fullscreen">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Determinar si falta al menos un dato
  const tieneDatosIncompletos = Object.values(faltantes).some(campoFalta => campoFalta === true);

  if (userId && tieneDatosIncompletos) {
    return (
      <div className="checking-overlay">
        <div className="checking-card">
          <h2 className="checking-title">Actualización Obligatoria</h2>
          <p className="checking-subtitle">
            Detectamos que faltan datos esenciales en tu perfil de operador. Por favor, completalos para continuar utilizando LabWiki.
          </p>

          {error && <div className="checking-alert-error">{error}</div>}

          <form onSubmit={handleGuardarDatos}>
            {/* INPUT DINÁMICO: Nombre y Apellido */}
            {faltantes.nombre && (
              <div className="form-group mb-3">
                <label className="form-label">Nombre y Apellido:</label>
                <input
                  type="text"
                  name="nombre"
                  className="form-input"
                  placeholder="Ej: Juan Pérez"
                  value={inputs.nombre}
                  onChange={handleInputChange}
                  required
                  disabled={guardando}
                />
              </div>
            )}

            {/* INPUT DINÁMICO: Correo Electrónico */}
            {faltantes.email && (
              <div className="form-group mb-3">
                <label className="form-label">Correo Electrónico:</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="ejemplo@correo.com"
                  value={inputs.email}
                  onChange={handleInputChange}
                  required
                  disabled={guardando}
                />
              </div>
            )}

            {/* INPUT DINÁMICO: Servicio */}
            {faltantes.servicio && (
              <div className="form-group mb-3">
                <label className="form-label">Confirma tu Servicio / Área:</label>
                <select
                  name="servicio"
                  className="form-input"
                  value={inputs.servicio}
                  onChange={handleInputChange}
                  disabled={guardando}
                >
                  {listaServicios.map((opcion, index) => (
                    <option key={index} value={opcion}>
                      {opcion}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* INPUT DINÁMICO: Teléfono o Interno */}
            {faltantes.telefono && (
              <div className="form-group mb-4">
                <label className="form-label">Número de Teléfono </label>
                <input
                  type="tel"
                  name="telefono"
                  className="form-input"
                  placeholder="Ej: 12345"
                  value={inputs.telefono}
                  onChange={handleInputChange}
                  required
                  disabled={guardando}
                />
              </div>
            )}

            <button
              type="submit"
              className="btn-submit-checking"
              disabled={guardando}
            >
              {guardando ? 'Guardando cambios...' : 'Guardar y Continuar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Si no falta nada, renderiza la app normal
  return <>{children}</>;
};