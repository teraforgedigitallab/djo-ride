import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAhnE84AU1K9K4MK-NFL7-N1RL4h_xBZfA",
  authDomain: "delightful-journeys.firebaseapp.com",
  projectId: "delightful-journeys",
  storageBucket: "delightful-journeys.firebasestorage.app",
  messagingSenderId: "246061322613",
  appId: "1:246061322613:web:c4a9cf22b80996eb0fc33c",
  measurementId: "G-WEVF9WFCZ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, db, analytics };