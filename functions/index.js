const functions = require('firebase-functions');
const admin = require("firebase-admin");
var serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
/* const db = admin.firestore(); */
const createFolder = require("./google");
const slack = require("./slack");
const monday = require("./monday");
const typeForm = require("./typeForm")
  
 //webhook for monday.com triggered on new item (new form submission) on boardId 411284598 (form submissions)
 //https://us-central1-{FIREBASE_PROJECT_ID}.cloudfunctions.net/fetchForms

 exports.fetchForms = functions.https.onRequest(async(req,res)=>{
  console.log("on Fetch Forms");
/*   console.log(req.body.form_response.definition);
  console.log(req.body.form_response.answers);   */


  //call function that fetch all forms form typeform and return array of objects {formId: "",formName: "", formLink: ""} to send to monday
  const forms = await typeForm.getFormsData()  
  
  // call monday function that will update the forms board 415921614 (Onboarding Codes) with all the forms on typeForm 
  monday.updateForms(forms)
 
  
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
      console.log(boardId,"boardId", itemId, "itemId")  

  /*     const mondayObj = await monday.getResult(boardId,itemId)  
      console.log(mondayObj);  */
    } catch (error) {
      console.log(error)
    } 
  
    
    return null
  });
  
const mondayPros = async ()=>{
      const boardId = 413267102
      const itemId =  413267104
  const mondayObj = await monday.getResult(boardId,itemId)  
      console.log(mondayObj, mondayObj.slackUsers); 
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