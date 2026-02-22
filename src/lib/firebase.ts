import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAWQu-lPYJHrDVM7qrVLRbam74bsdaNdTI",
  authDomain: "internshipmanagement-bf53c.firebaseapp.com",
  projectId: "internshipmanagement-bf53c",
  storageBucket: "internshipmanagement-bf53c.firebasestorage.app",
  messagingSenderId: "540589463706",
  appId: "1:540589463706:web:6a9d40f9ff8fbee563e723",
  measurementId: "G-XY1BJEP0N3",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
