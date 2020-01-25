require('dotenv').config()

const { WebClient } = require('@slack/web-api');
// Create a new instance of the WebClient class with the token read from your environment variable

const web = new WebClient(process.env.SLACK_TOKEN);

/* const getVenturesomeUsers = async () => {

 console.log("running get users from slack")
 const venturesomeTeamChannel = process.env.SLACK_TEAM_CHANNEL 
 const users = await web.channels.info({
     channel: venturesomeTeamChannel
 }); 
  const venturesomeUsers = users.channel.members

  return venturesomeUsers
};

const getAllUsersSlack = async () => {
  console.log("running get venturesome from slack")
  const users = await web.users.list(); 

   return users
 };
 */
 
 const createSlackChannel = async (users,clientName) => {
  
  /* const users = [{id:"ULFRMKSG5"},{id:"UL4CK7010"}]
  const clientName = "testClient" */
  console.log("in create slack channel, users coming",users, clientName)
  try {
    const newChannel = await web.groups.create({name:clientName})
    const channelId = await newChannel.group.id
    console.log(channelId,"channel id" , newChannel,"newChannel")
    await users.map(user=> web.groups.invite({channel:channelId, user:user.id}).then((data)=> console.log("success creating channel", data)))
   } catch (error) {
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

/* module.exports.getVenturesomeUsers = getVenturesomeUsers
module.exports.getAllUsersSlack = getAllUsersSlack */
module.exports.createSlackChannel = createSlackChannel
module.exports.getUserbyEmail = getUserbyEmail
module.exports.getSlackIds = getSlackIds
/*ULFRMKSG5    andres*/ 





/* createSlackChannel() */


/*
send a message

await web.chat.postMessage({
    channel: "URR2P0WTX",
    text: `This message is generated by our app`,
  }); */


    // Use the `auth.test` method to find information about the installing user
/*   const res = await web.auth.test() */

  // Find your user id to know where to send messages to
 /*  const userId = res.user_id */
