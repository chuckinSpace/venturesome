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
        const querySnapshot = await db.collection("clients")
            .orderBy("idNumber", "desc")
            .limit(1)
            .get();
           const number =  querySnapshot.forEach(async (doc) => {
            await doc.data().idNumber;
            
           
        });
    }
    catch (err) {
        return console.log(err);
    }



/* 
    db.collection("clients")
    .get()
     .orderBy("idNumber", "desc")
    .limit(1) 
    .then((data)=> console.log(data))
    .catch(err => console.log(err)) */
   /*  .onSnapshot(function(querySnapshot) {
    
        querySnapshot.forEach(async function(doc) {
           const number = await doc.data().idNumber
           return number + 1
        });
        
    }); */
}



module.exports.getClientId = getClientId