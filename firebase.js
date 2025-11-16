import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

import { 
  ref,
  onValue,set
} from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MSG_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DB_URL
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);


const googleProvider = new GoogleAuthProvider();


export { auth, db, storage, database, googleProvider,onValue,ref,set };
