const functions = require('firebase-functions');
const admin = require("firebase-admin")
var serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const db = admin.firestore()
/* 
const createUser = ({email,uid}) =>{
    console.log("in create user")
    db.collection("users")
                       .doc(uid)
                       .set({email})
                       .then(()=> console.log("success adding user to firestore"))
                       .catch((err)=>console.log("error adding user to firestore"))
    return null
}

exports.newUser = functions.auth.user()
                    .onCreate( user => {
                        createUser(user)
                    }) */
   
    