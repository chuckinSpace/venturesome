
import React from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from "../firebase_config/config"

const FirebaseAuth = () => {

    
    const uiConfig =
        {
            signInFlow: 'popup',
            signInSuccessUrl: "/admin",
            signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID
            ],
        }

    return (
        <StyledFirebaseAuth
            uiConfig={uiConfig}
            firebaseAuth={firebase.auth()}
        />
    );
};

export default FirebaseAuth;