import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCkcPwMW4YobHaddgBtUaQbSELDCXcEABA",
    authDomain: "gymlognnn.firebaseapp.com",
    projectId: "gymlognnn",
    storageBucket: "gymlognnn.firebasestorage.app",
    messagingSenderId: "406138257499",
    appId: "1:406138257499:web:8769c8ccbbcb7d63b0bf7e",
    measurementId: "G-GS4LYLJJYG"
  };
  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  
  export { db, auth };
