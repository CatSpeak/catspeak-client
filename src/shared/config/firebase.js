import { getApps, getApp, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_PROJECTID,
  storageBucket: import.meta.env.VITE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGESENDERID,
  appId: import.meta.env.VITE_APPID,
}

const hasValidConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let app = null
let auth = null
let db = null
let storage = null

if (hasValidConfig) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
  } catch (err) {
    console.warn('[Firebase] Initialization error:', err)
  }
} else {
  console.warn(
    '[Firebase] Missing or invalid Firebase configuration (VITE_API_KEY). Firebase features will be safely disabled.',
  )
}

export { app, auth, db, storage }


