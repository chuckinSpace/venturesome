/*
TODO: get cleintProject NUmber from number of projects on database (also clients?)
      check client by email to reject new client with emaikl already on the database
*/

//firebase authentication
const admin = require("firebase-admin");
require('dotenv').config();
let serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL
  });


const db = admin.firestore();



//get last id from firebase and return the next id
const getClientId= async () =>{
    console.log("in firebase functions getClient");
    try {
        let lastId = 1
        const querySnapshot = await db.collection("clients").orderBy("idNumber", "desc").limit(1).get();
        querySnapshot.forEach((doc) => lastId = doc.data().idNumber + 1)
        
        return lastId
    }
    catch (err) {
        return console.log(err);
    }
}

//get the number of project for the company overall
const getInternalProjectId= async () =>{
   
    try {
        let lastId = 1
        const querySnapshot = await db.collection("projects").orderBy("idNumber", "desc").limit(1).get();
        querySnapshot.forEach((doc) => lastId = doc.data().idNumber + 1)
        return lastId
    }
    catch (err) {
        return console.log(err);
    }
}

//when client is not new, get the last project id and return the next project id for this client
const getClientProjectId= async (clientId) =>{
    try {
        let clientData = ""
        let clientProjectId = ""
        const querySnapshot = await db.collection("clients").get();
        querySnapshot.forEach((doc) => {
            if(doc.data().idNumber === clientId){
                clientData = doc.data()
                console.log("client found", doc.data());
            }
            console.log(doc.data());
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

//creates the client on firebase "clients" collection using the client Obj
const createClient= async (client)=>{
    db.collection("clients").add({
        idNumber: client.idNumber,
        name:client.name,
        email: client.email,
        phone: client.phone,
        clientProjectNumber: client.clientProjectNumber,
        street:client.street,
        zipCode:client.zipCode,
        city:client.city,
        mondayItemIdDeal:client.mondayItemIdDeal,
        formLink: client.formLink,
        createdAt: client.createdAt,
    })
    .then((doc)=> console.log("success creating client on firebase", doc.id))
    .catch(err=>console.log("error creating client on firebase"))
}
//creates the project on firebase "projects" collection using the project obj
const createProject=async (project)=>{
    db.collection("projects").add({
        clientId : project.clientId,
        clientEmail:project.clientEmail,
        clientName:project.clientName,
        createdAt: project.createdAt,
        idNumber: project.idNumber,
        pmEmail: project.pmEmail,
        pmName: project.pmName,
        slackUsers: project.slackUsers,
        companyAssigned: project.companyAssigned,
        name:project.name,
        clientPhone:project.clientPhone,
        clientProjectNumber:project.clientProjectNumber
    })
    .then((doc)=> console.log("success creating project on firebase", doc.id))
    .catch(err=>console.log("error creating project on firebase",err))
}

//saves the client id on "staging" collection on firebase
const saveIdstaging=async(clientId) =>{
  try {
    const doc =await db.collection("staging").add({
        clientId : clientId,
        createdAt: new Date()
     })
     const docId = doc.id
     return docId
  } catch (error) {
      console.log("Error when stagind client id ", error);
  }
}

// retrieves the client id from "staging"
const getStagedClientId = async () =>{
    let clientId = ""
    const querySnapshot = await db.collection("staging").orderBy("createdAt", "asc").limit(1).get();
    querySnapshot.forEach((doc) => clientId = doc.data().clientId)
    // delete staged client
    return clientId
}
// deletes the client id from staging
const deleteStagedClient = async(clientId) =>{
    
    let stagedClient= db.collection('staging').where('clientId','==',clientId);
    stagedClient.get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
    doc.ref.delete();
    });
})
.then(()=>console.log("item succesfully removed"))
.catch((err)=> console.log("error removing staged client",err));
    
   
}

//saves the submission obj adding it to the corresponding client, stored as clientId inside the coming obj on firebase
const saveSubmissionObj = async (submissionObj)=>{
    try {
        const getClientSnap =  db.collection('clients').where('idNumber','==',submissionObj.clientId);
        const clientObj =await getClientSnap.get()
        clientObj.forEach((doc)=>{
              doc.ref.update({
                  birthday:submissionObj.birthday,
                  contactEmail:submissionObj.email,
                  onboardingCompletedOn:new Date(),
                  slack:submissionObj.slack,
                  contactPhone:submissionObj.phone
                })
            });
    } catch (error) {
        console.log(error);
    }
}

//exports
module.exports.getClientId = getClientId
module.exports.getInternalProjectId = getInternalProjectId
module.exports.getClientProjectId = getClientProjectId
module.exports.createClient = createClient
module.exports.createProject = createProject
module.exports.saveIdstaging = saveIdstaging
module.exports.getStagedClientId = getStagedClientId
module.exports.deleteStagedClient = deleteStagedClient
module.exports.saveSubmissionObj = saveSubmissionObj







//firebase extension to send emails to use generic emails for testing

 /* db.collection('mail').add({
    to: clientEmail,
    message: {
      subject: `Welcome to ${companyAssigned}`,
      html: `<code>
      <h2>Hi ${clientName}</h2>
      <h3>We thank you for becoming a client with ${companyAssigned}</h3></br>
      please follow this link to start the onboarding process ${formLink} </code>`,
    }
  })
  .then(() => console.log('Queued email for delivery!'))
  .catch((err)=>console.log("error when sending onboarding email", err)) */
