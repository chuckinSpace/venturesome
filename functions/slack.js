require('dotenv').config()
const firebase = require("./firebase") 
const { WebClient } = require('@slack/web-api');


// Create a new instance of the WebClient class with the token read from your environment variable
const web = new WebClient(process.env.SLACK_TOKEN);
 
const createSlackChannel = async (users,clientName) => {
  console.log("in create slack channel, users coming",users, clientName)
  try {
    const newChannel = await web.groups.create({name:clientName})
    const channelId = await newChannel.group.id
    console.log(channelId,"channel id" , newChannel,"newChannel")
    await users.map(user=> web.groups.invite({channel:channelId, user:user.id}))
    return channelId
  }catch (error) {
     console.log(error)
   }
 };

const getUserbyEmail = async (userEmail)=>{
  try {
    const response = await web.users.lookupByEmail({email:userEmail}); 
    return {id:response.user.id}
  } catch (error) {
    console.log("error gettin user by email from slack",error);
  }
}

const getSlackIds = async (slackObj) =>{
  console.log(slackObj,"slackObj")
  const getUsers = async () => {
    return Promise.all(slackObj.map(email => getUserbyEmail(email)))
   }
  return getUsers()
  .then((data) => {
    console.log("success getting ids for users from slack",data)
    return data
  })
  .catch(err=>console.log("error getting ids for users from slack",err)) 

}

/* const sendClientInvite = async (channelId,clientEmail) =>{
  web.admin.users.invite()
}
 */


const sendWelcomeMessage =async (channelId,team, projectName,clientName,companyAssigned) =>{
  let message = "Welcome"
  if(team === "client"){
    message= `Welcome to project : ${projectName} everyone in ${companyAssigned} are Happy to help!`
  }else if(team === "internal"){
    message = `Welcome to project: ${projectName} for client ${clientName} the company assigned for this project is ${companyAssigned}, this it's a company only channel`
  }else if(team === "internal-only")
  message = `Welcome to project: ${projectName} for client ${clientName} the company assigned for this project is ${companyAssigned}, this it's a company only channel,
  this client selected not to participate on slack`
  await web.chat.postMessage({
    channel: channelId,
    text: message,
  }); 
}



/***************** SLACK CHANNELS CREATION WORKFLOW ******************/

const slackCreationWorkflow = async (clientFirebase)=>{
  console.log("in slack creation workflow",clientFirebase) 
  
  //if only need clinetName and number, and channel is only one per client, not project based
  /*
  -put slack users on client instead of project
  -get slack option from client
  -get users form client
  -get ids from slack
  -if slack true 
                create channels 1 intern-{clientNumer}-{clientName}
                                2 {clientNumber}-{ClientName}
                                 -send Welcome Messages
            else
                2 {clientNumber}-{ClientName}
                 -send Welcome Messages
 

  /*  Now we will create our slack channels, using the users stored in the mondayObj and the client's preference to use it or not  */
    
      //if the mondayObj.slack is true (meaning that the client prefers to use slack) we will create 2 private channels
      //both channels will have all the users selected in the monday board, but we will add the client (by sendinv and invite form slack) to one of the channels
      

      // first we retrieve list of users from firestore (emails)
      let slackUsers = ""
      
      //then we send the emails to our slack function to get back the ids from slack for those users, to later create the channels
      let slackIds = await getSlackIds(slackUsers)


      // then we retrieve the slack option from firestore to know the client's preference
      const slackOption = await firebase.getSlackOption(clientFirebase.idNumber)
      let projectObj =""
      if(!!projectFirebase){
        console.log("projectFirebase exists, old client") 
        projectObj = await firebase.getProjectObjByInternal(projectFirebase.internalProjectId)
          // first we retrieve list of users from firestore (emails)
          slackUsers = await firebase.getSlackUsersByInternal(projectObj.internalProjectId)
          slackIds = await getSlackIds(slackUsers)
      }else{
        console.log("projectFirebase does not exists, new client") 
        projectObj = await firebase.getProjectObjByClientId(clientFirebase.idNumber)
        slackUsers = await firebase.getSlackUsersByClientId(clientFirebase.idNumber)
        slackIds = await getSlackIds(slackUsers)
      }

      console.log(projectObj,"projectObj returned from lookup")
       if(slackOption){
          //create 2 channel add slackUsers to both and invite client to 1 
            
          const companyChannelId = await createSlackChannel(slackIds,`TEST5-${projectObj.name}-Company`)
          const clientChannelId = await createSlackChannel(slackIds,`TEST5-${projectObj.name}-Client`)
          console.log(companyChannelId,"companyChannelId",clientChannelId,"clientChannelId") 
          // invite the client to clientChannel just created via email  
            /* pending admin status on slack  
          await slack.sendClientInvite(submissionObj.contactEmail) 
          */
          await sendWelcomeMessage(companyChannelId,"internal", projectObj.name,clientFirebase.name,projectObj.companyAssigned)
          await sendWelcomeMessage(clientChannelId,"client", projectObj.name,clientFirebase.name,projectObj.companyAssigned)
      }else{
          //create one private channel add slackUsers
          const companyChannelId = await createSlackChannel(slackIds,`TEST5-${projectObj.name}-Company`)
          await sendWelcomeMessage(companyChannelId,"internal-only", projectObj.name,clientFirebase.name,projectObj.companyAssigned)
          console.log(companyChannelId,"companyChannelId",)
        } 
}








module.exports.createSlackChannel = createSlackChannel
module.exports.getUserbyEmail = getUserbyEmail
module.exports.getSlackIds = getSlackIds
/* module.exports.sendClientInvite = sendClientInvite */
module.exports.sendWelcomeMessage = sendWelcomeMessage
module.exports.slackCreationWorkflow = slackCreationWorkflow

