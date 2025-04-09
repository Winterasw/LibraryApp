// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAlIUmf4cEpU9eoq2yl6rLYvc4mIVv2UdQ",
  authDomain: "libraryproject-5d2f8.firebaseapp.com",
  projectId: "libraryproject-5d2f8",
  storageBucket: "libraryproject-5d2f8.firebasestorage.app",
  messagingSenderId: "993368554979",
  appId: "1:993368554979:web:dd299b79a86d8427d7f4d6",
  measurementId: "G-8N8WYTWPMX",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };