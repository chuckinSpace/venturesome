/*
TODO: get id from firebase for client, save the client on database.
*/

const admin = require("firebase-admin");
require('dotenv').config();
var serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL
  });
const db = admin.firestore(); 

const getClientId= async () =>{
    console.log("in firebase functions getClient");
    try {
        var lastId = ""
        const querySnapshot = await db.collection("clients").orderBy("idNumber", "desc").limit(1).get();
        querySnapshot.forEach((doc) => lastId = doc.data().idNumber + 1)
        return lastId
    }
    catch (err) {
        return console.log(err);
    }
}

const getInternalProjectId= async () =>{
    console.log("in firebase functions getInternalProjectId");
    try {
        var lastId = ""
        const querySnapshot = await db.collection("projects").orderBy("idNumber", "desc").limit(1).get();
        querySnapshot.forEach((doc) => lastId = doc.data().idNumber + 1)
        return lastId
    }
    catch (err) {
        return console.log(err);
    }
}

const getClientProjectId= async (clientId) =>{
    console.log("in firebase functions getInternalProjectId");
    var parsedClientId = parseInt(clientId)
    try {
        var clientData = ""
        var clientProjectId = ""
        const querySnapshot = await db.collection("clients").get();
        querySnapshot.forEach((doc) => {
            if(doc.data().idNumber === parsedClientId){
                clientData = doc.data()
            }
        })
        
        clientProjectId = clientData.clientProjectNumber + 1
        if(clientData === ""){
            throw new Error(`Error trying to find the Client's project number,Client ${clientId} not found on the database`)
        } 
        return clientProjectId
    }
    catch (err) {
        return console.log(err);
    }
}

module.exports.getClientId = getClientId
module.exports.getInternalProjectId = getInternalProjectId
module.exports.getClientProjectId = getClientProjectId