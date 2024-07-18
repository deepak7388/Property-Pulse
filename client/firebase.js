// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-project-c248e.firebaseapp.com",
  projectId: "mern-project-c248e",
  storageBucket: "mern-project-c248e.appspot.com",
  messagingSenderId: "682096727417",
  appId: "1:682096727417:web:671335fabd173466b98ba8"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);