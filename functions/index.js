const functions = require('firebase-functions');
const admin = require("firebase-admin")
var serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const db = admin.firestore()
const createFolder = require("./google")





   exports.createDriveFolders= functions.firestore.document("projects/{projectId}")
   
   .onCreate((snap) => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    const project = snap.data();
    const projectObj = {
        clientEmail: project.clientEmail,
        clientIdNumber: project.clientIdNumber,
        clientName: project.clientName,
        internalProjectNumber: project.idNumber,
        managerEmail: project.managerEmail,
        managerName: project.managerName,
        clientProjectNumber: project.clientProjectNumber
    }

    // access a particular field as you would any JS property
   
    console.log(projectObj)
    // perform desired operations ...
    createFolder.runFolder(projectObj)
    return null
  });
