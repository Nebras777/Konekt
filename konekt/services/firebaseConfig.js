import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCxkPujRZ4MSAWp2uG2DYb8QgD9d9OFgbI",
  authDomain: "konekt-f7f63.firebaseapp.com",
  projectId: "konekt-f7f63",
  storageBucket: "konekt-f7f63.firebasestorage.app",
  messagingSenderId: "470768657470",
  appId: "1:470768657470:web:727fcf728807f405861d6f",
  measurementId: "G-N6BZZBLFGP"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);