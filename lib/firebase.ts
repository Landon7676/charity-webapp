// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAj6zQkbapKPvN8EAiuafeNFnJIshEUBWo",
  authDomain: "goodfellows-918a2.firebaseapp.com",
  projectId: "goodfellows-918a2",
  storageBucket: "goodfellows-918a2.appspot.com",
  messagingSenderId: "682896794906",
  appId: "1:682896794906:web:cda0d3592609c945d938a3"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Export services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
