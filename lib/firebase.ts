import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDn3xCSu5fh_hYcZNXSsYuG4mdHsfST7c4",
  authDomain: "pronurse1.firebaseapp.com",
  projectId: "pronurse1",
  storageBucket: "pronurse1.firebasestorage.app",
  messagingSenderId: "1014206351110",
  appId: "1:1014206351110:web:27c5949f8dc9a293ad4087",
  measurementId: "G-FWTDJE2S8B"
};

// تهيئة التطبيق
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// حل مشكلة persistence layer والتعارض بين التبويبات
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export const auth = getAuth(app);
export default app;
