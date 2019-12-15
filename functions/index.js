const functions = require('firebase-functions');
const admin = require("firebase-admin")
var serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const db = admin.firestore()
const createFolder = require("./google")
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
   exports.createDriveFolders= functions.firestore.document("projects/{projectId}")
   
   .onCreate((snap, context) => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    const newValue = snap.data();
    console.log("in trigger")
    console.log(context)

    // access a particular field as you would any JS property
    const name = newValue.name;
    console.log(createFolder.runFolder, typeof createFolder.runFolder, createFolder )
    // perform desired operations ...
    createFolder.runFolder()
  });
