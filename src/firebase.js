// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// Analytics
import { getAnalytics } from "firebase/analytics";

// Cloud Firestore
import { getFirestore } from "firebase/firestore";

// Cloud Messaging
import { getMessaging } from "firebase/messaging";

// Performance Monitoring
import { getPerformance } from "firebase/performance";

// Remote Config
import { getRemoteConfig } from "firebase/remote-config";

// Authentication
import { getAuth } from "firebase/auth";

// Cloud Functions
import { getFunctions } from "firebase/functions";

// Cloud Storage
import { getStorage } from "firebase/storage";

// Realtime Database
import { getDatabase } from "firebase/database";

// App Check
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// AI-LEGO's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCJ8cbkQs2Avk8EsNZhAlk0j4mhGGFNcus",
  authDomain: "ai-lego.firebaseapp.com",
  projectId: "ai-lego",
  storageBucket: "ai-lego.appspot.com",
  messagingSenderId: "420213198892",
  appId: "1:420213198892:web:dee1a30862ab2fddc74189",
  measurementId: "G-V7B5B16YFP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// if (location.hostname === "localhost") {
//   console.log("localhost detected!");
// }
// Initialize Firebase Auth
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
export { auth, app, db, storage };
