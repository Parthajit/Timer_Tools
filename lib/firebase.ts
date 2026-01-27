
// Fix: Use compatibility layer for Firebase v9+ to ensure compatibility with environments expecting v8-style exports
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDxPQ4oCQn1Eh9BrNuTbOd3PMRZzZMoMUI",
  authDomain: "timetools-29759.firebaseapp.com",
  projectId: "timetools-29759",
  storageBucket: "timetools-29759.firebasestorage.app",
  messagingSenderId: "367948583182",
  appId: "1:367948583182:web:197d7fa549ee50b10c875f"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize and export services using compatibility layer
export const auth = firebase.auth();
export const db = firebase.firestore();

export default app;
