import React from "react"
import { render } from "react-dom"
import { Provider } from "react-redux"
import firebase from "firebase/app"

import "firebase/auth"
import "firebase/firestore"
import "firebase/performance"
import "firebase/analytics"
import "firebase/storage"
// import 'firebase/functions' // <- needed if using httpsCallable
import { createStore, combineReducers } from "redux"
import {
	ReactReduxFirebaseProvider,
	firebaseReducer
} from "react-redux-firebase"
import { createFirestoreInstance, firestoreReducer } from "redux-firestore"
import App from "./App"

const fbConfig = {
	apiKey: process.env.REACT_APP_DEV_API_KEY,
	authDomain: process.env.REACT_APP_DEV_AUTH_DOMAIN,
	databaseURL: process.env.REACT_APP_DEV_DATABASE_URL,
	projectId: process.env.REACT_APP_DEV_PROJECT_ID,
	storageBucket: process.env.REACT_APP_DEV_STORAGE_BUCKET,
	messagingSenderId: process.env.REACT_APP_DEV_MESSAGING_SENDER_ID,
	appId: process.env.REACT_APP_DEV_APP_ID,
	measurementId: process.env.REACT_APP_DEV_MEASUREMENT_ID
}

// react-redux-firebase config
const rrfConfig = {
	userProfile: "users",
	useFirestoreForProfile: true,
	enableClaims: true
} // <- needed if using firestore
// Initialize firebase instance
firebase.initializeApp(fbConfig)

// Initialize other services on firebase instance

firebase.firestore() // <- needed if using firestore
/* firebase.functions() // <- needed if using httpsCallable */
firebase.performance()
firebase.analytics()
firebase.auth()
firebase.storage()

const rootReducer = combineReducers({
	firebase: firebaseReducer,
	firestore: firestoreReducer
})

const initialState = {}
const store = createStore(rootReducer, initialState)

const rrfProps = {
	firebase,
	config: rrfConfig,
	dispatch: store.dispatch,
	createFirestoreInstance // <- needed if using firestore
}

render(
	<Provider store={store}>
		<ReactReduxFirebaseProvider {...rrfProps}>
			<App />
		</ReactReduxFirebaseProvider>
	</Provider>,
	document.getElementById("root")
)
