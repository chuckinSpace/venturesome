const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
require('dotenv').config()
const firebase = require("./firebase")

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/drive"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

console.log("in server google")

// Load client secrets from a local file.
let data = {}


  const createFolderTree = async (info) => {
    try {
      newFunction(info);
      console.log("info coming", info)
      fs.readFile('./credentials.json', (err, content) => {
      console.log("running gogle script")
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Drive API.
      authorize(JSON.parse(content), createFolder);
     })
    } catch (error) {
      console.log(error)
    }
    
  }



function newFunction(info) {
  data= info
  
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */



function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);
 try {
    // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
   
    if (err) {
      console.log(err)
      return getAccessToken(oAuth2Client, callback);
    }else{
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client).then((data)=>console.log("sucess")).catch(err=>console.log(err));
    }
    
  
  });
 } catch (error) {
   console.log(error)
 }
 
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */


async function createFolder(auth) {

  const teamDriveId = process.env.TEAM_DRIVE_ID
  
  const fileMetadata = (name,parent)=>{
  
    return {
      'name': name,
      'mimeType': 'application/vnd.google-apps.folder',
      "parents": [parent],
      "driveId": teamDriveId
    }

}

const generateFolder= async (fileMetadata)=>{
  //clientId, clientName, d.getFullYear(createdAt), clientProjectNumber, name
  const drive = google.drive('v3'); 
  
  try {
    return await drive.files.create({
      auth: auth,
      resource: fileMetadata,
      fields: 'id',
      "supportsAllDrives": true,
    })
  } catch (error) {
    console.log(error)
  }
}  


try {



 
    const yearCreated = data.createdAt.getFullYear().toString().slice(2,4)
    let mainFolderId = ""  
    //Main folder
    const createFolderData = fileMetadata( `${data.clientId}_${data.clientName}`,teamDriveId)
    const mainFolderObj = await generateFolder(createFolderData)
   
    mainFolderId = mainFolderObj.data.id

    // /mainfolder     Main Folder Sub folders
     if(data.isNewClient){ 
      console.log("starting google drive creation in new client", data)
      const angebote = fileMetadata( `00 Angebote`,mainFolderId)
      const angeboteId = await generateFolder(angebote) 
  
      const projekteGewonnen = fileMetadata( `01 Projekte Gewonnen`,mainFolderId)
      const projekteGewonnenId = await generateFolder(projekteGewonnen) 
  
      const projekteVerloren = fileMetadata( `02 Projekte Verloren`,mainFolderId)
      await generateFolder(projekteVerloren) 
  
      const corporateDesign = fileMetadata( `03 Corporate Design`,mainFolderId)
      const corporateDesignId = await generateFolder(corporateDesign) 
  
      const adminAllgemein = fileMetadata( `04 Admin Allgemein`,mainFolderId)
      await generateFolder(adminAllgemein) 
  
      // mainfolder/angebote       Subfolder
  
      const xxProject = fileMetadata( `${yearCreated}_${data.clientProjectNumber}_${data.name}`,angeboteId.data.id)
      const xxProjectId = await generateFolder(xxProject) 
  
      // mainfolder/angebote/xx_xx_project    subfolders
      const meeting = fileMetadata( `00 Meeting Protocols`,xxProjectId.data.id)
      await generateFolder(meeting) 
  
      const pitch1 = fileMetadata( `01 Pitch`,xxProjectId.data.id)
      await generateFolder(pitch1) 
  
      const contracts1 = fileMetadata( `02 Contracts`,xxProjectId.data.id)
      await generateFolder(contracts1) 
  
      const briefing1 = fileMetadata( `03 Briefing`,xxProjectId.data.id)
      await generateFolder(briefing1) 
  
      const content1 = fileMetadata( `04 Content`,xxProjectId.data.id)
      await generateFolder(content1) 
  
      const preprod1 = fileMetadata( `05 Preprod`,xxProjectId.data.id)
      const preprodId1 = await generateFolder(preprod1) 
  
      const finalContent1 = fileMetadata( `06 Final Content`,xxProjectId.data.id)
      await generateFolder(finalContent1) 
      
      //mainfolder/angenote/xx_xxproject/05_Preprod       subfolders
      const script = fileMetadata( `01 Script`,preprodId1.data.id)
      await generateFolder(script) 
  
      const storyboard = fileMetadata( `02 Storyboard`,preprodId1.data.id)
      await generateFolder(storyboard) 
  
      const scouting = fileMetadata( `03 Scouting`,preprodId1.data.id)
      await generateFolder(scouting) 
  
      const shotlist = fileMetadata( `04 Shotlist`,preprodId1.data.id)
      await generateFolder(shotlist) 
  
      const callsheet = fileMetadata( `05 Call Sheet`,preprodId1.data.id)
      await generateFolder(callsheet)
  
      //mainfolder/01_Projecte_gewennen
      const xxProjectGewonnen = fileMetadata( `${yearCreated}_${data.clientProjectNumber}_${data.name}`,projekteGewonnenId.data.id)
      const xxProjectGewonnenId = await generateFolder(xxProjectGewonnen) 
  
  
  
      //mainfolder/01_Projecte_gewennen/xx_xxProject/    subfolders
      const pitch = fileMetadata( `01 Pitch`,xxProjectGewonnenId.data.id)
      await generateFolder(pitch) 
  
      const contracts = fileMetadata( `02 Contracts`,xxProjectGewonnenId.data.id)
      await generateFolder(contracts) 
  
      const briefing = fileMetadata( `03 Briefing`,xxProjectGewonnenId.data.id)
      await generateFolder(briefing) 
  
      const content = fileMetadata( `04 Content`,xxProjectGewonnenId.data.id)
      await generateFolder(content) 
  
      const preprod = fileMetadata( `05 Preprod`,xxProjectGewonnenId.data.id)
      await generateFolder(preprod) 
  
      const finalContent = fileMetadata( `06 Final Content`,xxProjectGewonnenId.data.id)
      await generateFolder(finalContent) 
  
  
      // Corporate Design subfolders
      const guidelines = fileMetadata( `Guidelines`,corporateDesignId.data.id)
      await generateFolder(guidelines) 
  
      const logo = fileMetadata( `Logo`,corporateDesignId.data.id)
      await generateFolder(logo) 
          
      console.log("sucess creating google drive tree")
      await firebase.updateFirebase("clients","idNumber",data.clientId,{clientFolderId:mainFolderId,projectsFolderId:xxProjectGewonnenId.data.id},"saving folderId google drive") 
    }else{
      console.log("google drive in old client")

    } 
    


  } catch (error) {
    throw new Error("error when trying to create google drive folder tree", error, data)
  }

}

const test = async () =>{
     //createdAt,clientProjectNumber,name(project),clientId,clientName
 try {
  let projectObj = {
    createdAt: new Date(),
    clientProjectNumber:1,
    name:"AwesomeProject",
    clientId:1,
    clientName:"Coca Cola"
 }
  projectObj.isNewClient = false
  await createFolderTree(projectObj)
 } catch (error) {
   console.log(error)
 }
   
} 
 const getTest= async ()=>{
  const result = await test()
  console.log(result)
 }
getTest()

module.exports.createFolderTree = createFolderTree