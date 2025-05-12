// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAj6zQkbapKPvN8EAiuafeNFnJIshEUBWo",
  authDomain: "goodfellows-918a2.firebaseapp.com",
  projectId: "goodfellows-918a2",
  storageBucket: "goodfellows-918a2.appspot.com", // Note: fixed a typo here!
  messagingSenderId: "682896794906",
  appId: "1:682896794906:web:cda0d3592609c945d938a3"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
