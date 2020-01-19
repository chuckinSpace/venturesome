/*
TODO: get cleintProject NUmber from number of projects on database (also clients?)
*/
const sgMail = require("@sendgrid/mail")
const admin = require("firebase-admin");
require('dotenv').config();
var serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL
  });
const db = admin.firestore();

sgMail.setApiKey(process.env.SG_API_KEY)
const ONBOARDING_TEMPLATE_ID = "d-61e27a20903f47f7bb06b49b12710526"


const getClientId= async () =>{
    console.log("in firebase functions getClient");
    try {
        var lastId = 1
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
        var lastId = 1
        const querySnapshot = await db.collection("projects").orderBy("idNumber", "desc").limit(1).get();
        querySnapshot.forEach((doc) => lastId = doc.data().idNumber + 1)
        return lastId
    }
    catch (err) {
        return console.log(err);
    }
}

const getClientProjectId= async (clientId) =>{
    console.log("in firebase functions getClientProjectId", clientId);
    var parsedClientId = parseInt(clientId)
    try {
        var clientData = ""
        var clientProjectId = ""
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


const sendOnboardingEmail = async (clientEmail,clientName,formLink, companyAssigned)=>{
    console.log("sending email", clientEmail,clientName,formLink, companyAssigned);
  /*   
    const msg =  {
        to:clientEmail,
        from: "carlos.moyano@venturesome.ch",
        templateId: ONBOARDING_TEMPLATE_ID,
        dynamic_template_data:{
            companyAssigned: companyAssigned,
            name:clientName,
            formLink:formLink
        }
    }
    try {
        return sgMail.send(msg)
    } catch (error) {
        console.log(error);
    } */
  
//firebase extension emails


 db.collection('mail').add({
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
  .catch((err)=>console.log("error when sending onboarding email", err))




}



module.exports.getClientId = getClientId
module.exports.getInternalProjectId = getInternalProjectId
module.exports.getClientProjectId = getClientProjectId
module.exports.createClient = createClient
module.exports.createProject = createProject
module.exports.sendOnboardingEmail = sendOnboardingEmail