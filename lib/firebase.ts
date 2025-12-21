
// Fix: Use compat imports to resolve "no exported member" errors in environments where only the v8-style default export is available.
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

// Fix: Use standardized initialization for Firebase v8/v9-compat SDK to avoid named export issues.
const app = firebase.apps.length > 0 ? firebase.app() : firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.firestore();

export default app;
