const functions = require('firebase-functions');
const admin = require("firebase-admin")
var serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const db = admin.firestore()
const createFolder = require("./google")
const slack = require("./slack")


   exports.createDriveFolders= functions.firestore.document("projects/{projectId}")
   
   .onCreate(async (snap) => {
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
        clientProjectNumber: project.clientProjectNumber,
        slackUsers: project.slackUsers
    }

    console.log(projectObj)
    // perform desired operations ...
    createFolder.runFolder(projectObj)
    await slack.createSlackChannel(projectObj.slackUsers,projectObj.clientName)

    return null
  });

  exports.fetchSlackUsers = functions.firestore.document("slack").onUpdate(async (change, context) => {
   console.log("started fetch slack users")
   const allUsers = await slack.getAllUsersSlack()
   const venturesomeUsers = await slack.getVenturesomeUsers()

   db.collection("slack").doc()
   .add({allUsers,venturesomeUsers})
   .then(()=> console.log("sucess creating slack doc"))
   .catch((err)=>console.log(err))
    return null
  });
