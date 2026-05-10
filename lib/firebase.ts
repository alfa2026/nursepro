'use client'

import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'
import { getDatabase, Database } from 'firebase/database'
import { getStorage, FirebaseStorage } from 'firebase/storage'

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
let app: FirebaseApp
let db: Firestore
let auth: Auth
let realtimeDb: Database
let storage: FirebaseStorage

function initializeFirebase() {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    db = getFirestore(app)
    auth = getAuth(app)
    realtimeDb = getDatabase(app)
    storage = getStorage(app)

    // Enable offline persistence for Firestore
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open: Offline persistence disabled')
      } else if (err.code === 'unimplemented') {
        console.warn('Browser not supported for offline persistence')
      }
    })

    console.log('✅ Firebase initialized successfully')
    return true
  } catch (error) {
    console.error('❌ Firebase initialization error:', error)
    return false
  }
}

// Initialize on load
const isInitialized = initializeFirebase()

export function getFirestoreDb(): Firestore { 
  return db 
}

export function getFirebaseAuth(): Auth { 
  return auth 
}

export function getRealtimeDb(): Database { 
  return realtimeDb 
}

export function getFirebaseStorage(): FirebaseStorage { 
  return storage 
}

export function isFirebaseConfigured(): boolean { 
  return isInitialized 
}

export { app, db, auth, realtimeDb, storage }
