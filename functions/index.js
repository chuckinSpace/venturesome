const functions = require('firebase-functions');
/* const admin = require("firebase-admin");
var serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) }); */
/* const db = admin.firestore(); */
const createFolder = require("./google");
const slack = require("./slack");
const monday = require("./monday");
const typeForm = require("./typeForm")
const firebase = require("./firebase") 
 //webhook for monday.com triggered on new item (new form submission) on boardId 411284598 (form submissions)
 //https://us-central1-{FIREBASE_PROJECT_ID}.cloudfunctions.net/fetchForms

 exports.fetchForms = functions.https.onRequest(async(req,res)=>{
  console.log("on Fetch Forms");
/*    console.log(req.body.form_response.definition);
  console.log(req.body.form_response.answers);   
  console.log(req.body.form_response.hidden.clientid);   */

  const submissionObj = {
    clientId: "",
    birthDay:"",
    email:"",
    dateJoined:"",
    slack:"",
    phoneNumber:""
  }
  //call function that fetch all forms form typeform and return array of objects {formId: "",formName: "", formLink: ""} to send to monday
  const forms = await typeForm.getFormsData()  
  
  // call monday function that will update the forms board 415921614 (Onboarding Codes) with all the forms on typeForm 
  monday.updateForms(forms)

  
  //assign id from submission webhook, hidden param clientid to assign to firebase client
  submissionObj.clientId = req.body.form_response.hidden.clientid

  
  return null
  
}) 


  //webhook for monday.com triggered on status change to "Signed" on boardId 413267102
  //https://us-central1-{FIREBASE_PROJECT_ID}.cloudfunctions.net/onClientSigned
  exports.onClientSigned = functions.https.onRequest(async (req, res) => {
    
   /*   challenge for monday.com to activate new Wehbhook  */
    /*    if (!!req) {
      const challenge = req.body
      res.send(challenge)
      console.log(challenge);  
       
    } */
    

    try {
      const boardId = req.body.event.boardId
      const itemId =  req.body.event.pulseId

      const mondayObj = await monday.getResult(boardId,itemId)  
      
      //get id for client from firebase
      const clientId = await firebase.getClientId()
      //create client on firebase

      //get id for companyProject
      //assign copnay project id to obj
      //get id for project for this client if client is not new
      //create project on db with id

      console.log(mondayObj); 
    } catch (error) {
      console.log(error)
    } 
  
    
    return null
  });
  
const mondayPros = async ()=>{
      const boardId = 413267102
      const itemId =  413267104
      var clientProjectNumber = 1
      var clientId = ""
try {
      

      const mondayObj = await monday.getResult(boardId,itemId) 
      console.log("mondayObj from indexjs",mondayObj);

      const firebaseClientId = await firebase.getClientId()
      const internalProjectId = await firebase.getInternalProjectId()
      
      // if client is old client Id is taken from mondayObj, that comes from monday sales pipeline board, else client Id will be generated from 
      // the last id from firebase database
      if(!mondayObj.isNewClient){
        clientProjectNumber = await firebase.getClientProjectId(mondayObj.clientId)
        clientId = mondayObj.clientId
        console.log("clientProjectNumber : ",clientProjectNumber);
      }else{
        clientId = firebaseClientId
      }
     
      console.log("firebaseId",firebaseClientId, internalProjectId);

      const clientObj = {
        
        idNumber: clientId,
        name:mondayObj.clientName,
        email: mondayObj.email,
        phone: mondayObj.phone,
        clientProjectNumber: clientProjectNumber,
        street:"",
        zipCode:"",
        city:"",
        mondayItemIdDeal:mondayObj.itemId,
        formLink: mondayObj.formLink,
        createdAt: new Date(),
      }


      const projectObj = {
        clientId : clientId,
        clientEmail:mondayObj.email,
        clientName:mondayObj.clientName,
        createdAt: new Date(),
        idNumber: clientProjectNumber,
        pmEmail: mondayObj.pmEmail,
        pmName: mondayObj.pmName,
        slackUsers: mondayObj.slackUsers,
        companyAssigned: mondayObj.companyAssigned,
        name:mondayObj.projectName,
        clientPhone:mondayObj.phone,
        clientProjectNumber:clientProjectNumber
      }

      if(mondayObj.isNewClient){
        await firebase.createClient(clientObj)
        await firebase.createProject(projectObj)
      }else{
        await firebase.createProject(projectObj)
      }
      await firebase.sendEmail(clientObj.email,clientObj.name,clientObj.formLink,projectObj.companyAssigned)
  
      
} catch (error) {
    console.log(error);
}      
      
}
mondayPros()

  /*    exports.fetchSlackUsers = functions.firestore.document("slack").onUpdate(async (change, context) => {
   console.log("started fetch slack users")
   const allUsers = await slack.getAllUsersSlack()
   const venturesomeUsers = await slack.getVenturesomeUsers()

   db.collection("slack").doc()
   .add({allUsers,venturesomeUsers})
   .then(()=> console.log("sucess creating slack doc"))
   .catch((err)=>console.log(err))
    return null
  });  */

/* 
  exports.createDriveFolders= functions.firestore.document("projects/{projectId}")
   
  .onCreate(async (snap) => {

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
   };

   console.log(projectObj);
   // perform desired operations ...
   createFolder.runFolder(projectObj);
   await slack.createSlackChannel(projectObj.slackUsers,projectObj.clientName);

   return null;
 }); */