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
        let counter = 0
        const querySnapshot = await db.collection("projects").get();
        querySnapshot.forEach((doc) => counter += 1)
        return counter + 1
    }
    catch (err) {
        return console.log(err);
    }
}


//when client is not new, get the last client project number and return the next client project number for this client

const getClientProjectNumber= async (clientId) =>{
    try {
        let counter = 0
        const querySnapshot = await db.collection("projects").where("clientId","==",clientId).get();
        querySnapshot.forEach((doc) => counter += 1)
        return counter + 1
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
        slackUsers: client.slackUsers,
    })
    .then((doc)=> console.log("success creating client on firebase", doc.id))
    .catch(err=>console.log("error creating client on firebase"))
}
//creates the project on firebase "projects" collection using the project obj
const createProject=async (project)=>{
    console.log("project obj going to firebase",project)
    db.collection("projects").add({
        clientId : project.clientId,
        clientEmail:project.clientEmail,
        clientName:project.clientName,
        createdAt: project.createdAt,
        idNumber: project.idNumber,
        pmEmail: project.pmEmail,
        pmName: project.pmName,
        pmId:project.pmId,
        companyAssigned: project.companyAssigned,
        name:project.name,
        clientPhone:project.clientPhone,
        clientProjectNumber:project.clientProjectNumber,
        internalProjectId: project.internalProjectId,
        smId:project.smId
    })
    .then((doc)=> console.log("success creating project on firebase", doc.id))
    .catch(err=>console.log("error creating project on firebase",err))
}

//saves the client id on "staging" collection on firebase
const saveIdstaging = async (clientId) => {
  console.log("stagin client id in firebase", clientId)
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
                  contactPhone:submissionObj.phone,
                  contactName:submissionObj.name
                })
                .then(()=>console.log("after sending submission"))
                .catch(err=> console.log("error when sving submission obj",err))
            });
           
    } catch (error) {
        console.log(error);
    }
}

const updateFirebase= async (collection,whereParam,whereIqualTo,objectToStore,consoleText)=>{
    console.log(collection,whereParam,whereIqualTo,objectToStore,consoleText)
    try {
        const getSnapshot =  db.collection(collection).where(whereParam,'==',whereIqualTo);
        const snapObj = await getSnapshot.get()
        snapObj.forEach((doc)=>doc.ref.update(objectToStore))
      } catch (error) {
          throw new Error(`Error when ${consoleText} `, error)
      }
}

/* const getSlackUsersByInternal = async(internalProjectId) =>{
    console.log("getSlackUsersByInternal starting", internalProjectId)
    let slackUsers = ""
    try {
        const getClientSnap =  db.collection('clients').where('internalProjectId','==',internalProjectId);
        const clientObj = await getClientSnap.get()
        clientObj.forEach((doc)=>{
              slackUsers = doc.data().slackUsers
            });
           return slackUsers
    } catch (error) {
        console.log(error);
    }
} */

/* const getSlackUsersByClientId = async(clientId) =>{
    console.log("getSlackUsersByClientId starting", clientId)
    let slackUsers = ""
    try {
        const getClientSnap =  db.collection('projects').where('clientId','==',clientId);
        const clientObj = await getClientSnap.get()
        clientObj.forEach((doc)=>{
              slackUsers = doc.data().slackUsers
            });
           return slackUsers
    } catch (error) {
        console.log(error);
    }
} */

const getSlackOption = async(clientId) =>{
    console.log("getSlackOption starting", clientId)
    let slackOption = ""
    try {
        const getClientSnap =  db.collection('clients').where('idNumber','==',clientId);
        const clientObj = await getClientSnap.get()
        clientObj.forEach((doc)=>{
            slackOption = doc.data().slack
            });
           return slackOption
    } catch (error) {
        console.log(error);
    }
}

const getProjectObjByInternal = async (internalProjectId) =>{
    console.log("getProjectObj starting with internal project Id", internalProjectId)
    let projectObj = ""
    try {
        const getProjectSnap =  db.collection('projects').where('internalProjectId','==',internalProjectId);
        const projectSnap = await getProjectSnap.get()
        projectSnap.forEach((doc)=>{
            projectObj = doc.data()
            });
           return projectObj
    } catch (error) {
        console.log(error);
    }
}


const getProjectObjByClientId = async (clientId) =>{
    console.log("getProjectObjByClientId starting with internal project Id", clientId)
    let projectObj = ""
    try {
        const getProjectSnap =  db.collection('projects').where('clientId','==',clientId);
        const projectSnap = await getProjectSnap.get()
        projectSnap.forEach((doc)=>{
            projectObj = doc.data()
            });
           return projectObj
    } catch (error) {
        console.log(error);
    }
}
const getClient = async (clientId) =>{
    console.log("getClient starting with client Id", clientId)
    let clientObj = ""
    try {
        const getClientSnap =  db.collection('clients').where('idNumber','==',clientId);
        const clientSnap = await getClientSnap.get()
        clientSnap.forEach((doc)=>{
            clientObj = doc.data()
            });
           return clientObj
    } catch (error) {
        console.log(error);
    }
}

//exports
module.exports.getClientId = getClientId
module.exports.getInternalProjectId = getInternalProjectId
module.exports.getClientProjectNumber = getClientProjectNumber
module.exports.createClient = createClient
module.exports.createProject = createProject
module.exports.saveIdstaging = saveIdstaging
module.exports.getStagedClientId = getStagedClientId
module.exports.deleteStagedClient = deleteStagedClient
module.exports.saveSubmissionObj = saveSubmissionObj
/* module.exports.getSlackUsersByInternal = getSlackUsersByInternal
module.exports.getSlackUsersByClientId = getSlackUsersByClientId */
module.exports.getSlackOption= getSlackOption
module.exports.getProjectObjByInternal= getProjectObjByInternal
module.exports.getProjectObjByClientId= getProjectObjByClientId
module.exports.updateFirebase = updateFirebase
module.exports.getClient = getClient

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
