const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');


// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/drive"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
console.log("in server google")
// Load client secrets from a local file.
var data = {}

module.exports = {
  runFolder: function runFolder(info) {
    newFunction(info);
    console.log("info coming", info)
    fs.readFile('./credentials.json', (err, content) => {
      console.log("running gogle script")
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Drive API.
      authorize(JSON.parse(content), createFolder);
    })
  }
}




function newFunction(info) {
  data = info;
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

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
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
  const teamDriveId = "0AL55Wodbq-0HUk9PVA"
  /*    const folderId = "1x3PWWbqwPprWScO_qlVh5oFGHJ05OAFW" */
  console.log("on create folder", data)
  const drive = google.drive('v3');
  console.log('auth:', auth);
  console.log("text to insert on folder", data.clientName, data.internalProjectNumber, data.clientProjectNumber)


  // Main Folder //
  var mainFolderMetadata = {
    'name': `${data.internalProjectNumber}_${data.clientName}_${data.clientProjectNumber}`,
    'mimeType': 'application/vnd.google-apps.folder',
    "parents": [teamDriveId],
    "driveId": teamDriveId
  };

  const mainFolderId = await drive.files.create({
    auth: auth,
    resource: mainFolderMetadata,
    fields: 'id',
    "supportsAllDrives": true,
  })

  // Main folder subfolder 00 Angebote
  var mainFolderSub1MetaData = {
    'name': "00 Angebote",
    'mimeType': 'application/vnd.google-apps.folder',
    "parents": [mainFolderId.data.id],
    "driveId": teamDriveId
  };

  const mainFolderSub1Id = await drive.files.create({
    auth: auth,
    resource: mainFolderSub1MetaData,
    fields: 'id',
    "supportsAllDrives": true,
  })
  //Main folder subfolder 2 01 Projekte gewonnen
  var mainFolderSub2MetaData = {
    'name': "01 Projekte gewonnen",
    'mimeType': 'application/vnd.google-apps.folder',
    "parents": [mainFolderId.data.id],
    "driveId": teamDriveId
  };

  const mainFolderSub2Id = await drive.files.create({
    auth: auth,
    resource: mainFolderSub2MetaData,
    fields: 'id',
    "supportsAllDrives": true,
  })

  //Main Folder sub folder 3 02 Projekte verloren
  var mainFolderSub3MetaData = {
    'name': "02 Projekte verloren",
    'mimeType': 'application/vnd.google-apps.folder',
    "parents": [mainFolderId.data.id],
    "driveId": teamDriveId
  };

  const mainFolderSub3Id = await drive.files.create({
    auth: auth,
    resource: mainFolderSub3MetaData,
    fields: 'id',
    "supportsAllDrives": true,
  })
  //Main Folder sub folder 4 03 Corporate Design
  var mainFolderSub4MetaData = {
    'name': "03 Corporate Design",
    'mimeType': 'application/vnd.google-apps.folder',
    "parents": [mainFolderId.data.id],
    "driveId": teamDriveId
  };

  const mainFolderSub4Id = await drive.files.create({
    auth: auth,
    resource: mainFolderSub4MetaData,
    fields: 'id',
    "supportsAllDrives": true,
  })

  //Main Folder sub folder 5 04 Admin Allgemein
  var mainFolderSub5MetaData = {
    'name': "04 Admin Allgemein",
    'mimeType': 'application/vnd.google-apps.folder',
    "parents": [mainFolderId.data.id],
    "driveId": teamDriveId
  };

  const mainFolderSub5Id = await drive.files.create({
    auth: auth,
    resource: mainFolderSub5MetaData,
    fields: 'id',
    "supportsAllDrives": true,
  })
  //Subfolder for 00 Angebote xx_xx_project
  var angeboteSubFolderMetaData = {
    'name': "xx_xx_project",
    'mimeType': 'application/vnd.google-apps.folder',
    "parents": [mainFolderSub1Id],
    "driveId": teamDriveId
  };

  const mainFolderSub5Id = await drive.files.create({
    auth: auth,
    resource: mainFolderSub5MetaData,
    fields: 'id',
    "supportsAllDrives": true,
  })
  // Subfolder 1 for 03 Corporate Design
  // SubFOlder 2 for 03 Corporate Design
}





