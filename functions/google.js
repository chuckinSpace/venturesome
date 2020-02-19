const fs = require("fs")
const readline = require("readline")
const { google } = require("googleapis")
require("dotenv").config()
/* const request = require("request") */
const firebase = require("./firebase")

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/drive"]
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json"

console.log("in server google")

// Load client secrets from a local file.
let data = {}

const createFolderTree = async info => {
	try {
		newFunction(info)
		console.log("info coming", info)
		fs.readFile("./credentials.json", (err, content) => {
			console.log("running gogle script")
			if (err) return console.log("Error loading client secret file:", err)
			// Authorize a client with credentials, then call the Google Drive API.
			authorize(JSON.parse(content), createFolder)
		})
	} catch (error) {
		console.log(error)
	}
}

function newFunction(info) {
	data = info
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */

function authorize(credentials, callback) {
	const { client_secret, client_id, redirect_uris } = credentials.installed
	const oAuth2Client = new google.auth.OAuth2(
		client_id,
		client_secret,
		redirect_uris[0]
	)
	try {
		// Check if we have previously stored a token.
		fs.readFile(TOKEN_PATH, (err, token) => {
			if (err) {
				console.log(err)
				return getAccessToken(oAuth2Client, callback)
			} else {
				oAuth2Client.setCredentials(JSON.parse(token))
				callback(oAuth2Client)
			}
		})
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
		access_type: "offline",
		scope: SCOPES
	})
	console.log("Authorize this app by visiting this url:", authUrl)
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	})
	rl.question("Enter the code from that page here: ", code => {
		rl.close()
		oAuth2Client.getToken(code, (err, token) => {
			if (err) return console.error("Error retrieving access token", err)
			oAuth2Client.setCredentials(token)
			// Store the token to disk for later program executions
			fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
				if (err) return console.error(err)
				console.log("Token stored to", TOKEN_PATH)
			})
			callback(oAuth2Client)
		})
	})
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

async function createFolder(auth) {
	const teamDriveId = process.env.TEAM_DRIVE_ID

	const fileMetadata = (name, parent) => {
		return {
			name: name,
			mimeType: "application/vnd.google-apps.folder",
			parents: [parent],
			driveId: teamDriveId
		}
	}

	const generateFolder = async fileMetadata => {
		//clientId, clientName, d.getFullYear(createdAt), clientProjectNumber, name
		const drive = google.drive("v3")

		try {
			return await drive.files.create({
				auth: auth,
				resource: fileMetadata,
				fields: "id",
				supportsAllDrives: true
			})
		} catch (error) {
			console.log(error)
		}
	}

	const yearCreated = data.createdAt
		.getFullYear()
		.toString()
		.slice(2, 4)
	try {
		// /mainfolder     Main Folder Sub folders
		if (data.isNewClient) {
			console.log("starting google drive creation in new client", data)

			let mainFolderId = ""
			//Main folder
			const createFolderData = fileMetadata(
				`${data.clientId} ${data.clientName}`,
				teamDriveId
			)
			const mainFolderObj = await generateFolder(createFolderData)
			mainFolderId = mainFolderObj.data.id

			const projekteGewonnen = fileMetadata(
				`00 Projekte Gewonnen`,
				mainFolderId
			)
			const projekteGewonnenId = await generateFolder(projekteGewonnen)

			const corporateDesign = fileMetadata(`01 Corporate Design`, mainFolderId)
			const corporateDesignId = await generateFolder(corporateDesign)

			const adminAllgemein = fileMetadata(`02 Admin Allgemein`, mainFolderId)
			await generateFolder(adminAllgemein)

			// mainfolder/Projekte_Gewonnen/       Subfolder

			const xxProject = fileMetadata(
				`${yearCreated}_${data.clientProjectNumber
					.toString()
					.padStart(2, "0")}_${data.name}`,
				projekteGewonnenId.data.id
			)
			const xxProjectId = await generateFolder(xxProject)

			// mainfolder/Projekte_Gewonnen/xx_xx_project    subfolders
			const meeting = fileMetadata(`00 Meeting Protocols`, xxProjectId.data.id)
			await generateFolder(meeting)

			const pitch = fileMetadata(`01 Pitch`, xxProjectId.data.id)
			await generateFolder(pitch)

			const contracts = fileMetadata(`02 Contracts`, xxProjectId.data.id)
			await generateFolder(contracts)

			const briefing = fileMetadata(`03 Briefing`, xxProjectId.data.id)
			await generateFolder(briefing)

			const content = fileMetadata(`04 Content`, xxProjectId.data.id)
			await generateFolder(content)

			const preprod = fileMetadata(`05 Preprod`, xxProjectId.data.id)
			const preprodId = await generateFolder(preprod)

			const finalContent = fileMetadata(`06 Final Content`, xxProjectId.data.id)
			await generateFolder(finalContent)

			//mainfolder/Projekte_Gewonnen/xx_xxproject/05_Preprod       subfolders
			const script = fileMetadata(`01 Script`, preprodId.data.id)
			await generateFolder(script)

			const storyboard = fileMetadata(`02 Storyboard`, preprodId.data.id)
			await generateFolder(storyboard)

			const scouting = fileMetadata(`03 Scouting`, preprodId.data.id)
			await generateFolder(scouting)

			const shotlist = fileMetadata(`04 Shotlist`, preprodId.data.id)
			await generateFolder(shotlist)

			const callsheet = fileMetadata(`05 Call Sheet`, preprodId.data.id)
			await generateFolder(callsheet)

			// Corporate Design subfolders
			const guidelines = fileMetadata(`Guidelines`, corporateDesignId.data.id)
			await generateFolder(guidelines)

			const logo = fileMetadata(`Logo`, corporateDesignId.data.id)
			await generateFolder(logo)

			console.log(
				"sucess creating google drive tree, Id from Projeckte forlder is",
				projekteGewonnenId.data.id
			)
			await firebase.updateFirebase(
				"clients",
				"idNumber",
				data.clientId,
				{ projectsFolderId: projekteGewonnenId.data.id },
				"saving folderId google drive"
			)
		} else {
			console.log("google drive in old client", data)
			//mainfolder/Projekte_Gewonnen/

			const xxProjectGewonnen1 = fileMetadata(
				`${yearCreated}_${data.clientProjectNumber
					.toString()
					.padStart(2, "0")}_${data.name}`,
				data.projectsFolderId
			)
			const xxProjectGewonnenId1 = await generateFolder(xxProjectGewonnen1)

			const pitch = fileMetadata(`01 Pitch`, xxProjectGewonnenId1.data.id)
			await generateFolder(pitch)

			const contracts = fileMetadata(
				`02 Contracts`,
				xxProjectGewonnenId1.data.id
			)
			await generateFolder(contracts)

			const briefing = fileMetadata(`03 Briefing`, xxProjectGewonnenId1.data.id)
			await generateFolder(briefing)

			const content = fileMetadata(`04 Content`, xxProjectGewonnenId1.data.id)
			await generateFolder(content)

			const preprod = fileMetadata(`05 Preprod`, xxProjectGewonnenId1.data.id)
			const preprodId1 = await generateFolder(preprod)

			const finalContent = fileMetadata(
				`06 Final Content`,
				xxProjectGewonnenId1.data.id
			)
			await generateFolder(finalContent)

			//mainfolder/Projekte_Gewonnen/xx_xxproject/05_Preprod  subfolders
			const script = fileMetadata(`01 Script`, preprodId1.data.id)
			await generateFolder(script)

			const storyboard = fileMetadata(`02 Storyboard`, preprodId1.data.id)
			await generateFolder(storyboard)

			const scouting = fileMetadata(`03 Scouting`, preprodId1.data.id)
			await generateFolder(scouting)

			const shotlist = fileMetadata(`04 Shotlist`, preprodId1.data.id)
			await generateFolder(shotlist)

			const callsheet = fileMetadata(`05 Call Sheet`, preprodId1.data.id)
			await generateFolder(callsheet)

			console.log("sucess creating new project on old client")
		}
	} catch (error) {
		throw new Error(
			"error when trying to create google drive folder tree",
			error,
			data
		)
	}
}

/* function listFiles(auth) {
	const teamDriveId = process.env.TEAM_DRIVE_ID
	const key = auth.credentials.access_token

	var headers = {
		Authorization: `Bearer ${key}`,
		Accept: "application/json"
	}

	var options = {
		url: `https://www.googleapis.com/drive/v2/files/0AGMJwxMDT3DFUk9PVA/children?maxResults=100&key=AIzaSyCk6ISCQmGU7swxw9W-1nRlBBy7X_0Yl6s`,
		headers: headers
	}

	function callback(error, response, body) {
		console.log("here", body, response)
		if (error) console.log("error", error)
		if (!error && response.statusCode == 200) {
			console.log("no error", body)
		}
	}

	request(options, callback)
}
 */

module.exports.createFolderTree = createFolderTree
