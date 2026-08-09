import { getApps, getApp, initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_PROJECTID,
  storageBucket: import.meta.env.VITE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGESENDERID,
  appId: import.meta.env.VITE_APPID,
}

let app = null
let auth = null
let db = null
let storage = null

try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined") {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
  } else {
    console.warn(
      "[Firebase] VITE_API_KEY missing or not set. Firebase services disabled gracefully.",
    )
  }
} catch (err) {
  console.warn("[Firebase] Failed to initialize Firebase:", err)
}

export { app, auth, db, storage }

