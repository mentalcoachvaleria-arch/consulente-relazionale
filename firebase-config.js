// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDv4CB_l9F3XRjlczYSRANG00jJ1y6UwcM",
  authDomain: "consulting-relazioni.firebaseapp.com",
  projectId: "consulting-relazioni",
  storageBucket: "consulting-relazioni.firebasestorage.app",
  messagingSenderId: "776293586666",
  appId: "1:776293586666:web:e969ed7e846cd0522c6993"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup, signOut, onAuthStateChanged, doc, getDoc, setDoc };

// ✅ EMAIL AUTORIZZATE (aggiungi la tua email Google)
export const ADMIN_EMAILS = ['mentalcoachvaleria@gmail.com', ];