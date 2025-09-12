
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDu5EP8RmDShr9rMYlF0y-EPFzq6T1sbyw",
  authDomain: "pr-web-f50c9.firebaseapp.com",
  projectId: "pr-web-f50c9",
  storageBucket: "pr-web-f50c9.firebasestorage.app",
  messagingSenderId: "455341266684",
  appId: "1:455341266684:web:72d91717868b8aa236e979",
  measurementId: "G-44G4MX150Z"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

