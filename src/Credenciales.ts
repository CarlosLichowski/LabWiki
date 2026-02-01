// Credenciales.ts (Ya es correcto)

// Credenciales.ts 
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDKOWpkZ0ApsLBlgeSTa1RaLr9xIH6w69Y",
    authDomain: "labwiki-80c41.firebaseapp.com",
    projectId: "labwiki-80c41",
    storageBucket: "labwiki-80c41.firebasestorage.app",
    messagingSenderId: "553445750762",
    appId: "1:553445750762:web:4e72c07907f44a29442493",
    measurementId: "G-BF81TTYX5C"
};

// Inicializamos la app
const appFirebase = initializeApp(firebaseConfig);

// Exportamos las instancias correctamente
export const db = getFirestore(appFirebase);
export const storage = getStorage(appFirebase);
export const auth = getAuth(appFirebase); // ✅ Corregido: antes decía 'app'
export const APP_ID = firebaseConfig.appId;

export default appFirebase;