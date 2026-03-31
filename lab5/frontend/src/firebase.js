import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Конфігурація з Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAqP3LXHebwJ9VftWwJ98iJdQm4bBSxhO4",
  authDomain: "web4-a011d.firebaseapp.com",
  projectId: "web4-a011d",
  storageBucket: "web4-a011d.firebasestorage.app",
  messagingSenderId: "961135217066",
  appId: "1:961135217066:web:9dd9e68bb123f439dcc3d3",
  measurementId: "G-E6S8EN7K58"
};

// Ініціалізація додатку, авторизації та бази даних
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);