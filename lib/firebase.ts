'use client'

import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'
import { getDatabase, Database } from 'firebase/database'
import { getStorage, FirebaseStorage } from 'firebase/storage'

// إدخال بياناتك مباشرة لضمان الاتصال 100%
const firebaseConfig = {
  apiKey: "AIzaSyDn3xCSu5fh_hYcZNXSsYuG4mdHsfST7c4",
  authDomain: "pronurse1.firebaseapp.com",
  projectId: "pronurse1",
  storageBucket: "pronurse1.firebasestorage.app",
  messagingSenderId: "1014206351110",
  appId: "1:1014206351110:web:27c5949f8dc9a293ad4087",
  databaseURL: "https://pronurse1-default-rtdb.firebaseio.com"
}

// Initialize Firebase
let app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)
const auth = getAuth(app)
const realtimeDb = getDatabase(app)
const storage = getStorage(app)

export function getFirestoreDb(): Firestore { return db }
export function getFirebaseAuth(): Auth { return auth }
export function getRealtimeDb(): Database { return realtimeDb }
export function getFirebaseStorage(): FirebaseStorage { return storage }

// إجبار البرنامج على اعتبار السحابة متصلة دائماً
export function isFirebaseConfigured(): boolean { return true }

export { app, db, auth, realtimeDb, storage }
