const functions = require("firebase-functions")
const googleDrive = require("./google")
const slack = require("./slack")
const monday = require("./monday")
const typeForm = require("./typeForm")
const firebase = require("./firebase")
const sendGrid = require("./sendGrid")
const toggl = require("./toggl")
//designated format for first project number
const FIRST_PROJECT_NUMBER = 1

//webhook for monday.com triggered on new item (new form submission) on boardId 411284598 (form submissions)
//https://us-central1-{FIREBASE_PROJECT_ID}.cloudfunctions.net/fetchForms

exports.fetchForms = functions.https.onRequest(async (req, res) => {
	console.log("on Fetch Forms")

	try {
		//save board and itemId from webhook req
		const boardId = req.body.event.boardId
		const itemId = req.body.event.pulseId

		//call function that fetch all forms form typeform and return array of objects {formId: "",formName: "", formLink: ""} to send to monday
		const forms = await typeForm.getFormsData()

		// call monday function that will update the forms board 415921614 (Onboarding Codes) with all the forms on typeForm, we do this every time there its a submission
		// to keep new forms from typeform up to date on our mondays sales pipeline
		monday.updateForms(forms)

		setTimeout(async () => {
			// this section only will be hit by NEW CLIENTS
			try {
				const clientId = await firebase.getStagedClientId()
				await firebase.deleteStagedClient(clientId)
				/* 
          we retrieve the information coming from typeForm from client onboarding, that will add 
          {birthday,contactEmail,onboardingCompletedOn,slack,contactPhone, contactName} to that client on firestore
          */
				const submissionObj = await monday.getSubmissionData(boardId, itemId)
				/* submissionObj.clientId = clientId */
				await firebase.updateFirebase(
					"clients",
					"idNumber",
					clientId,
					{
						birthday: submissionObj.birthday,
						contactEmail: submissionObj.email,
						onboardingCompletedOn: new Date(),
						slack: submissionObj.slack,
						contactPhone: submissionObj.phone,
						contactName: submissionObj.name
					},
					"storing submission obj"
				)

				/*we look for the board where the clientId coming is and change status on monday where clientId to Onboarding Complete*/
				const boardObj = await monday.getBoardByClientId(clientId)
				await monday.changeMondayStatus(4, boardObj.boardId, boardObj.itemId)

				// save the client to Mondays database
				const clientFirebase = await firebase.getClient(clientId)
				console.log("about to run save client to database on monday")
				await monday.saveClientToMondayDatabase(clientFirebase)

				//after onboarding from the client is complete we create slack channels
				await slack.slackCreationWorkflow(clientFirebase)
			} catch (e) {
				throw new Error("Error the completing onboarding process")
			}
			res.send({ message: "success" })
		}, 7000)
	} catch (error) {
		throw new Error("Error the completing onboarding process")
	}
})

const createClientObj = (clientId, mondayObj, clientProjectNumber) => {
	const clientObj = {
		idNumber: clientId,
		name: mondayObj.clientName,
		email: mondayObj.email,
		phone: mondayObj.phone,
		clientProjectNumber: clientProjectNumber,
		street: "",
		zipCode: "",
		city: "",
		mondayItemIdDeal: mondayObj.itemId,
		formLink: mondayObj.formLink,
		createdAt: new Date(),
		slackUsers: mondayObj.slackUsers
	}
	return clientObj
}

const createProjectObj = async (clientId, mondayObj, clientProjectNumber) => {
	const internalProjectId = await firebase.getInternalProjectId()

	let projectObj = {
		clientId: clientId,
		clientEmail: mondayObj.email,
		clientName: mondayObj.clientName,
		createdAt: new Date(),
		idNumber: clientProjectNumber,
		pmEmail: mondayObj.pmEmail,
		pmName: mondayObj.pmName,
		pmId: parseInt(mondayObj.pmId),
		companyAssigned: mondayObj.companyAssigned,
		name: mondayObj.projectName,
		clientPhone: mondayObj.phone,
		clientProjectNumber: clientProjectNumber,
		internalProjectId: internalProjectId,
		smId: parseInt(mondayObj.smId)
	}
	return projectObj
}

//webhook for monday.com triggered on status change to "Signed" on boardId 413267102
//https://us-central1-{FIREBASE_PROJECT_ID}.cloudfunctions.net/onClientSigned
exports.onClientSigned = functions.https.onRequest(async (req, res) => {
	try {
		console.log("on client Signed function")
		// get ids for the board and item that sent the webhook in this case sales pipeline, triggered by status change to "Signed"
		const boardId = req.body.event.boardId
		const itemId = req.body.event.pulseId

		// variables tu maipulate and save trought the script
		let clientProjectNumber = 1
		let clientId = ""

		// 1st step get the data from the board using getResults from monday file, store it into mondayObj,
		//if there is any error retrieving these field form the board the program will throw an error to be handled
		const mondayObj = await monday.getResult(boardId, itemId)
		console.log("Monday Obj", mondayObj)

		if (mondayObj === 0) {
			throw new Error("error with mondayObj ending program")
		} else {
			// if client is old, client Id woulb be taken from mondayObj, else, client Id will be from firebase

			/* We first have our tasks depending on if the client its new or already exists on the database */

			if (!mondayObj.isNewClient) {
				clientProjectNumber = await firebase.getClientProjectNumber(
					mondayObj.clientId
				)

				if (clientProjectNumber === undefined) {
					await monday.changeMondayStatus(3, boardId, itemId)
					throw new Error("client not found")
				}

				//if it does we assign our global clientId param to the mondayObj client id
				clientId = mondayObj.clientId
			} else {
				//if client its a new client, client Id will come from firebase Id
				clientProjectNumber = FIRST_PROJECT_NUMBER
				const firebaseClientId = await firebase.getClientId()
				clientId = firebaseClientId

				//We append the client id to the form link to send the email, making sure we format the URL correctly with encodeURIComponent
				const urlName = encodeURIComponent(mondayObj.clientName.trim())
				mondayObj.formLink = `${mondayObj.formLink}?clientid=${firebaseClientId}&clientname=${urlName}`
			}
			// create project and client
			const clientObj = createClientObj(
				clientId,
				mondayObj,
				clientProjectNumber
			)
			const projectObj = await createProjectObj(
				clientId,
				mondayObj,
				clientProjectNumber
			)
			const yearCreated = projectObj.createdAt
				.getFullYear()
				.toString()
				.slice(2, 4)
			//if the client is new, we create the client, then the project for that client, we send the onboarding email,we change the status on the board on monday
			// to onboarding sent (on sucesss only), we already handled the error scenario of missing information inside the monday.js file, after we send back the
			// recently generated clientId to the monday Sales board, else (client is not new) we only create the project and change the status of the board to "Project Created"

			if (mondayObj.isNewClient) {
				await firebase.createClient(clientObj)
				await firebase.createProject(projectObj)
				await sendGrid.sendOnboardingEmail(
					clientObj.email,
					clientObj.name,
					clientObj.formLink,
					projectObj.companyAssigned
				)
				await monday.changeMondayStatus(0, boardId, itemId)
				await monday.setMondayClientId(boardId, itemId, clientObj.idNumber)
				// create google drive entire tree
				projectObj.isNewClient = true
				await googleDrive.createFolderTree(projectObj)
				if (projectObj.companyAssigned === "Venturesome") {
					//add to Video project Overview
					await monday.addVideoProjectBoard(
						clientObj.idNumber,
						yearCreated,
						projectObj.clientProjectNumber,
						clientObj.name,
						projectObj.name,
						projectObj.pmId
					)
					//create frameio client
					//create toggle client
					const togglClientId = await toggl.createClient(
						clientObj.name,
						clientObj.idNumber
					)
					await firebase.updateFirebase(
						"clients",
						"idNumber",
						clientObj.idNumber,
						{ togglClientId: togglClientId },
						"saving toggl id to firebase client"
					)
					//create toggle project
					await toggl.createProject(
						togglClientId,
						clientObj.idNumber,
						projectObj.name,
						yearCreated,
						projectObj.clientProjectNumber
					)
				} else if (projectObj.companyAssigned === "MoneyTree") {
					await monday.addMoneyTreeAccount(
						clientObj.idNumber,
						yearCreated,
						projectObj.clientProjectNumber,
						clientObj.name,
						projectObj.name,
						projectObj.pmId
					)
				}

				// add to Project overview Inbox always

				await monday.addProjectOverview(
					clientObj.idNumber,
					yearCreated,
					projectObj.clientProjectNumber,
					clientObj.name,
					projectObj.name,
					projectObj.pmId,
					clientObj.createdAt,
					projectObj.smId,
					projectObj.companyAssigned
				)
			} else {
				await firebase.createProject(projectObj)
				await monday.changeMondayStatus(2, boardId, itemId)
				// googe drive create only Prejectke genwonned and subfolders on the client

				if (projectObj.companyAssigned === "Venturesome") {
					await monday.addVideoProjectBoard(
						clientObj.idNumber,
						yearCreated,
						projectObj.clientProjectNumber,
						clientObj.name,
						projectObj.name,
						projectObj.pmId
					)

					//create toggle project
					const firebaseClient = await firebase.getClient(clientObj.idNumber)
					const togglClientId = firebaseClient.togglClientId
					console.log("object from firebase", firebaseClient, togglClientId)
					await toggl.createProject(
						togglClientId,
						clientObj.idNumber,
						projectObj.name,
						yearCreated,
						projectObj.clientProjectNumber
					)
				} else if (projectObj.companyAssigned === "MoneyTree") {
					await monday.addMoneyTreeAccount(
						clientObj.idNumber,
						yearCreated,
						projectObj.clientProjectNumber,
						clientObj.name,
						projectObj.name,
						projectObj.pmId
					)
				}

				// add to Project overview Inbox always
				const firebaseClient = await firebase.getClient(projectObj.clientId)
				projectObj.projectsFolderId = firebaseClient.projectsFolderId
				projectObj.isNewClient = false
				await googleDrive.createFolderTree(projectObj)
				await monday.addProjectOverview(
					clientObj.idNumber,
					yearCreated,
					projectObj.clientProjectNumber,
					clientObj.name,
					projectObj.name,
					projectObj.pmId,
					clientObj.createdAt,
					projectObj.smId,
					projectObj.companyAssigned
				)
			}
			res.send({ message: "success" })
		}
	} catch (error) {
		console.log("Error in main script", error)
		res.send({ message: "error" })
	}
})

//webhook from Typeform trigered on submission, sending clientid

exports.getClientIdTypeForm = functions.https.onRequest(async (req, res) => {
	console.log("staging client id", req.body.form_response.hidden.clientid)
	//assign id from submission webhook, hidden param clientid to assign to firebase client
	try {
		const clientId = req.body.form_response.hidden.clientid
		console.log("client is stored", clientId)
		await firebase.saveIdstaging(parseInt(clientId))
	} catch (error) {
		console.log("error staging client id")
	}
	res.send({ message: "success" })
})

/*   
    challenge for monday.com to activate new Wehbhook  
        if (!!req) {
      const challenge = req.body
      res.send(challenge)
      console.log(challenge);     
    } 
  */
