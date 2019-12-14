//firebase

import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore' 
import 'firebase/performance'
import 'firebase/analytics'
import 'firebase/storage'

const fbConfig = {
    apiKey: process.env.REACT_APP_DEV_API_KEY,
    authDomain: process.env.REACT_APP_DEV_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DEV_DATABASE_URL,
    projectId: process.env.REACT_APP_DEV_PROJECT_ID,
    storageBucket: process.env.REACT_APP_DEV_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_DEV_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_DEV_APP_ID,
    measurementId: process.env.REACT_APP_DEV_MEASUREMENT_ID,

}

// Initialize firebase instance
firebase.initializeApp(fbConfig)

// Initialize other services on firebase instance
firebase.firestore() // <- needed if using firestore
/* firebase.functions() // <- needed if using httpsCallable */
firebase.performance()
firebase.analytics()
firebase.auth()
firebase.storage()

export default firebase