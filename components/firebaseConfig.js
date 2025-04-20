// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCMAIrQV7gp2ALaNWOPmXsVvdTqhdA_2AE",
  authDomain: "spulibraly.firebaseapp.com",
  databaseURL:
    "https://spulibraly-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "spulibraly",
  storageBucket: "spulibraly.firebasestorage.app",
  messagingSenderId: "624860013544",
  appId: "1:624860013544:web:a71bcb943d7bcadf087a5d",
  measurementId: "G-9XKFL7HFJ9",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
