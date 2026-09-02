import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA4ViDxh5xWVq8VT-V4L-x_HxcTVbHQWXM",
  authDomain: "hemoconnect-b85ca.firebaseapp.com",
  projectId: "hemoconnect-b85ca",
  storageBucket: "hemoconnect-b85ca.firebasestorage.app",
  messagingSenderId: "37997849684",
  appId: "1:37997849684:web:c09f53dd587a009725d1c1",
  measurementId: "G-JRPGTQCF31"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
