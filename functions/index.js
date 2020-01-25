const functions = require('firebase-functions');
const createFolder = require("./google");
const slack = require("./slack");
const monday = require("./monday");
const typeForm = require("./typeForm")
const firebase = require("./firebase") 
const sendGrid = require("./sendGrid")

//webhook from Typeform trigerred on submission, sending clientid 

exports.getClientIdTypeForm = functions.https.onRequest(async(req,res)=>{
  console.log("staging client id",req.body.form_response.hidden.clientid);  
  //assign id from submission webhook, hidden param clientid to assign to firebase client
    try {
      const clientId = req.body.form_response.hidden.clientid
      await firebase.saveIdstaging(parseInt(clientId))
    } catch (error) {
      console.log("error staging client id");
    }
   res.send({message: "success"})
})

 //webhook for monday.com triggered on new item (new form submission) on boardId 411284598 (form submissions)
 //https://us-central1-{FIREBASE_PROJECT_ID}.cloudfunctions.net/fetchForms
 exports.fetchForms = functions.https.onRequest(async(req,res)=>{
  console.log("on Fetch Forms");
/*    console.log(req.body.form_response.definition);
  console.log(req.body.form_response.answers);   
  console.log(req.body.form_response.hidden.clientid);   */

try {
//save board and itemId from webhook req
const boardId = req.body.event.boardId
const itemId =  req.body.event.pulseId

//call function that fetch all forms form typeform and return array of objects {formId: "",formName: "", formLink: ""} to send to monday
const forms = await typeForm.getFormsData()  

// call monday function that will update the forms board 415921614 (Onboarding Codes) with all the forms on typeForm 
monday.updateForms(forms)  



setTimeout(async()=> {
  console.log("in timeout");
  const clientId = await firebase.getStagedClientId()
  await firebase.deleteStagedClient(clientId)
  const submissionObj = await monday.getSubmissionData(boardId,itemId)
  submissionObj.clientId = clientId
  await firebase.saveSubmissionObj(submissionObj)
  res.send({message: "success"})
},5000)
} catch (error) {
console.log(error)
}
  

  
  
 
  
/*   const submission = monday.getSubmissionInfo() */

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
    
  console.log("on client Signed function");
    
    
     try {
      // get ids for the board and item that sent the webhook in this case sales pipeline, triggered by status change to "Signed"
      const boardId = req.body.event.boardId
      const itemId =  req.body.event.pulseId
      // variables tu maipulate and save trought the script
      let clientProjectNumber = 1
      let clientId = ""

      // 1st step get the data from the board using getResults from monday file, store it into mondayObj, 
      //if there is any error retrieving these field form the board the program will throw an error to be handled
      const mondayObj = await monday.getResult(boardId,itemId) 
      if(mondayObj === 0){
        throw new Error("error with mondayObj ending program")
      
      }else{
        // if client is old, client Id woulb be taken from mondayObj, that comes from monday sales pipeline board, else, client Id will be generated from 
        // the last id from firebase database

        if(!mondayObj.isNewClient){
          clientProjectNumber = await firebase.getClientProjectId(mondayObj.clientId)
          //check if client exists first
          if(clientProjectNumber === undefined){
            await monday.changeMondayStatus(3,boardId,itemId)
            throw new Error("client not found")
          }
          //if it does we assign our global clientId param to the mondayObj client id
          clientId = mondayObj.clientId
        }else{
          //if client its a new client, client Id will come from firebase Id 
          const firebaseClientId = await firebase.getClientId()
          clientId = firebaseClientId
          //We append the client id to the form link to send the email, making sure we format the URL correctly with encodeURIComponent
          const urlName = encodeURIComponent(mondayObj.clientName.trim())
          mondayObj.formLink = `${mondayObj.formLink}?clientid=${firebaseClientId}&clientname=${urlName}`
        }
          // now we create the client and project obj, to send to firestore functions to be created
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
        // internal project Id is the overrall project number for the company
        const internalProjectId = await firebase.getInternalProjectId()
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
          clientProjectNumber:clientProjectNumber,
          internalProjectId:internalProjectId
        }
        //if the client is new, we create the client, then the project for that client, we send the onboarding email,we change the status on the board on monday
        // to onboarding sent (on sucesss only), we already handled the error scenario of missing information inside the monday.js file, after we send back the
        // recently generated clientId to the monday Sales board, else (client is not new) we only create the project and change the status of the board to "Project Created"
        if(mondayObj.isNewClient){
          await firebase.createClient(clientObj)
          await firebase.createProject(projectObj)
          await sendGrid.sendOnboardingEmail(clientObj.email,clientObj.name,clientObj.formLink,projectObj.companyAssigned)
          await monday.changeMondayStatus(0,boardId,itemId)
          await monday.setMondayClientId(boardId,itemId,clientObj.idNumber)
        }else{
          await firebase.createProject(projectObj)
          await monday.changeMondayStatus(2,boardId,itemId)
        }
       
        res.send({message: "success"})
       
      }
    } catch (error) {
      res.send({message: "success"})
      console.log("Error in main script",error)
    } 
    
  
  
  });

 

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