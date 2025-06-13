// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const devConfig = {
  apiKey: "DEV_API_KEY",
  authDomain: "dev-project.firebaseapp.com",
  projectId: "cv-studio-4876b",
  storageBucket: "dev-project.appspot.com",
  messagingSenderId: "DEV_MESSAGING_SENDER_ID",
  appId: "DEV_APP_ID",
  measurementId: "DEV_MEASUREMENT_ID", // optional
};


const prodConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Select config based on NODE_ENV
const firebaseConfig = process.env.NODE_ENV === "development" ? devConfig : prodConfig;

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 9020);
}

export { app, db };
