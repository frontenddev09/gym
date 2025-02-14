import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAHk7sQ-vL1Jr0wTEmKXm3PaQE0UDdHVCw",
  authDomain: "gym-training-ff32c.firebaseapp.com",
  projectId: "gym-training-ff32c",
  storageBucket: "gym-training-ff32c.firebasestorage.app",
  messagingSenderId: "781762239336",
  appId: "1:781762239336:web:5bdafe5e4a4d0cf23a14dd",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
