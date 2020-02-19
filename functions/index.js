/*
 TODO:   -add category to onboarding and database
		- position and categoryu make mandatory
		- position from onboardgin not copying to monday DB
		- start date and gift on second projects? from what date
		- add error to monday board and email to me	
		- google drive on old project ?

*/
const functions = require("firebase-functions")
const googleDrive = require("./google")
const slack = require("./slack")
const monday = require("./monday")
const typeForm = require("./typeForm")
const firebase = require("./firebase")
const sendGrid = require("./sendGrid")
const toggl = require("./toggl")
const frameio = require("./frameio")
const constants = require("./constants")

//designated format for first project number
const FIRST_PROJECT_NUMBER = 1

//webhook for monday.com triggered on new item (new form submission) on boardId 411284598 (form submissions)
//https://us-central1-{FIREBASE_PROJECT_ID}.cloudfunctions.net/fetchForms

exports.fetchForms = functions.https.onRequest(async (req, res) => {
	console.log("submission received starting script")

	try {
		//save board and itemId from webhook req
		const boardId = req.body.event.boardId
		const itemId = req.body.event.pulseId

		//call function that fetch all forms form typeform and return array of objects {formId: "",formName: "", formLink: ""} to send to monday
		const forms = await typeForm.getFormsData()

		// call monday function that will up{date} the forms board 415921614 (Onboarding Codes) with all the forms on typeForm, we do this every time there its a submission
		// to keep new forms from typeform up to {date} on our mondays sales pipeline
		monday.updateForms(forms)

		// this section only will be hit by NEW CLIENTS, data coming from typeform data through monday board
		try {
			const submissionObj = await monday.getSubmissionData(boardId, itemId)

			console.log("submission obj before going to firebase", submissionObj)
			const contactId = await firebase.getPrimaryContactId(
				submissionObj.clientId
			)
			console.log("contact", contactId)

			await firebase.updateContact(
				contactId,
				{
					birthday: submissionObj.birthday,
					mobilePhone: {
						number: submissionObj.phone
					}
				},
				"storing contact info from form"
			)
			await firebase.updateFirebase(
				"clients",
				"idNumber",
				submissionObj.clientId,
				{
					slackEmail: submissionObj.email,
					slack: submissionObj.slack,
					onboardingCompletedOn: new Date()
				},
				"storing client info from form"
			)

			// save the client to Mondays database
			const clientFirebase = await firebase.getClientInfo(
				submissionObj.clientId
			)
			await monday.changeMondayStatus(
				constants.ONBOARDING_FORM_STATUS,
				"Completed",
				clientFirebase.mondayItemIdDeal
			)
			if (!!clientFirebase) {
				console.log("about to run save client to database on monday")
				const contactInfo = await firebase.getContactInfo(
					submissionObj.clientId
				)
				const itemId = await monday.saveClientToMondayDatabase(
					clientFirebase,
					contactInfo
				)
				const primaryContactId = await firebase.getPrimaryContactId(
					submissionObj.clientId
				)
				console.log("primary contact id", primaryContactId)
				await firebase.updateContact(
					primaryContactId,
					{ itemId: itemId },
					"storing itemid on primary contact after submission"
				)

				await monday.changeMondayStatus(
					constants.MONDAY_DB_FORM_STATUS,
					"Completed",
					clientFirebase.mondayItemIdDeal
				)
			} else {
				console.log("client not found on firebase ", submissionObj.clientId)
				sendGrid.sendErrorEmail(
					"firebase.getClientInfo",
					`getting client from firebase after receiving submission form clientId =${submissionObj.clientId}`,
					"client not found"
				)
			}

			//after onboarding from the client is complete we create slack channels

			await slack.slackCreationWorkflow(
				clientFirebase,
				clientFirebase.mondayItemIdDeal
			)

			await monday.changeMondayStatus(
				constants.SLACK_FORM_STATUS,
				"Completed",
				clientFirebase.mondayItemIdDeal
			)
		} catch (e) {
			throw new Error("Error the completing onboarding process")
		}
		res.send({ message: "success" })
	} catch (error) {
		throw new Error("Error the completing onboarding process")
	}
})
const test = async () => {}
/* test() */

const createClientObj = async (
	clientId,
	mondayObj,
	clientProjectNumber,
	tag
) => {
	const clientObj = {
		idNumber: clientId,
		name: mondayObj.clientName,
		clientProjectNumber: clientProjectNumber,
		address: {
			street: mondayObj.streetAddress,
			zip: mondayObj.zipCode,
			city: mondayObj.city,
			country: {
				countryCode: mondayObj.country.countryCode,
				countryName: mondayObj.country.countryName
			}
		},
		mondayItemIdDeal: mondayObj.itemId,
		formLink: mondayObj.formLink,
		createdAt: new Date(),
		slackUsers: mondayObj.slackUsers,
		tag: tag,
		isAutomaticGift: mondayObj.companyAssigned === "moneytree",
		smId: parseInt(mondayObj.smId)
	}

	return clientObj
}
const createContactObj = async (mondayObj, clientId) => {
	const contactObj = {
		clientId: clientId,
		firstName: mondayObj.contactFirstName,
		lastName: mondayObj.contactLastName,
		position: mondayObj.contactPosition,
		email: {
			email: mondayObj.email,
			text: `${mondayObj.contactFirstName} ${mondayObj.contactLastName}`
		},
		mobilePhone: {
			countryShortName: mondayObj.country.countryCode,
			number: mondayObj.phone
		},
		officePhone: {
			countryShortName: "",
			number: ""
		},
		isPrimary: true,
		itemId: ""
	}
	return contactObj
}

const createProjectObj = async (
	clientId,
	mondayObj,
	clientProjectNumber,
	tag
) => {
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

		tag: tag
	}

	return projectObj
}

//webhook for monday.com triggered on status change to "Signed" on boardId 413267102
//https://us-central1-{FIREBASE_PROJECT_ID}.cloudfunctions.net/onClientSigned
exports.onClientSigned = functions.https.onRequest(async (req, res) => {
	const boardId = req.body.event.boardId
	const itemId = req.body.event.pulseId
	try {
		console.log("on client Signed function")
		// get ids for the board and item that sent the webhook in this case sales pipeline, triggered by status change to "Signed"

		// variables tu maipulate and save trought the script
		let clientProjectNumber = ""
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
					await monday.changeMondayStatus(
						constants.START_FORM_STATUS,
						"Client Not Found",
						itemId
					)
					throw new Error("client not found")
				}

				//if it does we assign our global clientId param to the mondayObj client id
				clientId = mondayObj.clientId
			} else {
				//if client its a new client,we generate a new client number from firestore
				clientProjectNumber = FIRST_PROJECT_NUMBER
				const firebaseClientId = await firebase.getClientId()
				clientId = firebaseClientId

				//We append the client id to the form link to send the email, making sure we format the URL correctly with encodeURIComponent
				const urlName = encodeURIComponent(mondayObj.clientName.trim())
				mondayObj.formLink = `${mondayObj.formLink}?clientid=${firebaseClientId}&clientname=${urlName}`
			}
			const tag = await monday.createTag(mondayObj.clientName, clientId)
			console.log(tag, "tag just created", typeof tag)
			// create project and client
			const clientObj = await createClientObj(
				clientId,
				mondayObj,
				clientProjectNumber,
				tag
			)
			const projectObj = await createProjectObj(
				clientId,
				mondayObj,
				clientProjectNumber,
				tag
			)
			const yearCreated = projectObj.createdAt
				.getFullYear()
				.toString()
				.slice(2, 4)

			const contactObj = await createContactObj(mondayObj, clientId)
			//if the client is new, we create the client, then the project for that client, we send the onboarding email,we change the status on the board on monday
			// to onboarding sent (on sucesss only), we already handled the error scenario of missing information inside the monday.js file, after we send back the
			// recently generated clientId to the monday Sales board, else (client is not new) we only create the project and change the status of the board to "Project Created"

			if (mondayObj.isNewClient) {
				//set status to Waiting for client for those that need to wait for onboarding form

				await monday.changeMondayStatus(
					constants.SLACK_FORM_STATUS,
					"Waiting For Client",
					itemId
				)
				await monday.changeMondayStatus(
					constants.MONDAY_DB_FORM_STATUS,
					"Waiting For Client",
					itemId
				)

				await firebase.createDocument("clients", clientObj, "creating client")
				await firebase.createDocument(
					"contacts",
					contactObj,
					"creating contact"
				)
				await firebase.createDocument(
					"projects",
					projectObj,
					"creating project"
				)
				const pmObj = await monday.getPmMondayInfo(projectObj.pmId)
				const smObj = await monday.getPmMondayInfo(clientObj.smId)

				await sendGrid.sendOnboardingEmail(
					mondayObj.email,
					contactObj.firstName,
					clientObj.formLink,
					projectObj.companyAssigned,
					pmObj,
					smObj
				)

				await monday.changeMondayStatus(
					constants.START_FORM_STATUS,
					"Onboarding Started",
					itemId
				)
				await monday.changeMondayStatus(
					constants.ONBOARDING_FORM_STATUS,
					"Waiting For Client",
					itemId
				)

				await monday.setMondayClientId(boardId, itemId, clientObj.idNumber)
				// create google drive entire tree
				projectObj.isNewClient = true

				await googleDrive.createFolderTree(projectObj)

				await monday.changeMondayStatus(
					constants.GOOGLE_DRIVE_FORM_STATUS,
					"Completed",
					itemId
				)

				if (projectObj.companyAssigned === "VENTURESOME") {
					//add task "send welcome card" with address on up{date}
					await monday.sendWelcome(
						clientObj,
						"VENTURESOME",
						projectObj.pmId,
						contactObj
					)
					//add to Video project Overview
					await monday.addVideoProjectBoard(
						clientObj.idNumber,
						yearCreated,
						projectObj.clientProjectNumber,
						clientObj.name,
						projectObj.name,
						projectObj.pmId,
						clientObj.tag
					)
					//create frameio project
					await frameio.createFrameIoProject(
						`${
							clientObj.idNumber
						}_${yearCreated}_${projectObj.clientProjectNumber
							.toString()
							.padStart(2, "0")} | ${clientObj.name} | ${projectObj.name} `,
						itemId,
						"creating frame io project"
					)
					//create toggle client
					const togglClientId = await toggl.createClient(
						clientObj.name,
						clientObj.idNumber,
						itemId,
						"creating toggl client"
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
						projectObj.clientProjectNumber,
						itemId,
						"creating toggl Project"
					)
				} else if (projectObj.companyAssigned === "moneytree") {
					await monday.sendWelcome(
						clientObj,
						"moneytree",
						projectObj.pmId,
						contactObj
					)
					await monday.addMoneyTreeAccount(
						clientObj.idNumber,
						yearCreated,
						projectObj.clientProjectNumber,
						clientObj.name,
						projectObj.name,
						projectObj.pmId,
						clientObj.tag
					)
					console.log("new client money tree before setting tlg to completed")

					await monday.changeMondayStatus(
						constants.TOGGL_FORM_STATUS,
						"Not Needed",
						itemId
					)
					await monday.changeMondayStatus(
						constants.FRAMEIO_FORM_STATUS,
						"Not Needed",
						itemId
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
					clientObj.smId,
					projectObj.companyAssigned,
					clientObj.tag
				)

				await monday.changeMondayStatus(
					constants.MONDAY_BOARDS_FORM_STATUS,
					"Completed",
					itemId
				)
			} else {
				//old client

				//set all not needed items to completed first for existing clients
				await monday.changeMondayStatus(
					constants.ONBOARDING_FORM_STATUS,
					"Not Needed",
					itemId
				)
				await monday.changeMondayStatus(
					constants.SLACK_FORM_STATUS,
					"Not Needed",
					itemId
				)
				await monday.changeMondayStatus(
					constants.MONDAY_DB_FORM_STATUS,
					"Not Needed",
					itemId
				)

				await firebase.createDocument("projects", projectObj, "create project")
				await monday.changeMondayStatus(
					constants.START_FORM_STATUS,
					"Project Created",
					itemId
				)

				if (projectObj.companyAssigned === "VENTURESOME") {
					await monday.addVideoProjectBoard(
						clientObj.idNumber,
						yearCreated,
						projectObj.clientProjectNumber,
						clientObj.name,
						projectObj.name,
						projectObj.pmId,
						clientObj.tag
					)

					//create toggle project
					const firebaseClient = await firebase.getClientInfo(
						clientObj.idNumber
					)
					const togglClientId = firebaseClient.togglClientId
					console.log("object from firebase", firebaseClient, togglClientId)
					await toggl.createProject(
						togglClientId,
						clientObj.idNumber,
						projectObj.name,
						yearCreated,
						projectObj.clientProjectNumber
					)
					await monday.changeMondayStatus(
						constants.TOGGL_FORM_STATUS,
						"Completed",
						itemId
					)
					await frameio.createFrameIoProject(
						`${
							clientObj.idNumber
						}_${yearCreated}_${projectObj.clientProjectNumber
							.toString()
							.padStart(2, "0")} | ${clientObj.name} | ${projectObj.name} `,
						itemId,
						"creating frame io project"
					)
					await monday.changeMondayStatus(
						constants.FRAMEIO_FORM_STATUS,
						"Completed",
						itemId
					)

					// slack to not needed, onboarding not needed, monday db
					await monday.changeMondayStatus(
						constants.SLACK_FORM_STATUS,
						"Not Needed",
						itemId
					)
					await monday.changeMondayStatus(
						constants.ONBOARDING_FORM_STATUS,
						"Not Needed",
						itemId
					)
					await monday.changeMondayStatus(
						constants.MONDAY_DB_FORM_STATUS,
						"Not Needed",
						itemId
					)
				} else if (projectObj.companyAssigned === "moneytree") {
					await monday.changeMondayStatus(
						constants.TOGGL_FORM_STATUS,
						"Not Needed",
						itemId
					)
					await monday.changeMondayStatus(
						constants.FRAMEIO_FORM_STATUS,
						"Not Needed",
						itemId
					)
					await monday.changeMondayStatus(
						constants.SLACK_FORM_STATUS,
						"Not Needed",
						itemId
					)
					await monday.changeMondayStatus(
						constants.ONBOARDING_FORM_STATUS,
						"Not Needed",
						itemId
					)
					await monday.changeMondayStatus(
						constants.MONDAY_DB_FORM_STATUS,
						"Not Needed",
						itemId
					)

					await monday.addMoneyTreeAccount(
						clientObj.idNumber,
						yearCreated,
						projectObj.clientProjectNumber,
						clientObj.name,
						projectObj.name,
						projectObj.pmId,
						clientObj.tag
					)
				}

				// add to Project overview Inbox always
				const firebaseClient = await firebase.getClientInfo(projectObj.clientId)
				projectObj.projectsFolderId = firebaseClient.projectsFolderId
				projectObj.isNewClient = false

				await googleDrive.createFolderTree(projectObj)

				await monday.changeMondayStatus(
					constants.GOOGLE_DRIVE_FORM_STATUS,
					"Completed",
					itemId
				)
				await monday.addProjectOverview(
					clientObj.idNumber,
					yearCreated,
					projectObj.clientProjectNumber,
					clientObj.name,
					projectObj.name,
					projectObj.pmId,
					clientObj.createdAt,
					clientObj.smId,
					projectObj.companyAssigned,
					clientObj.tag
				)
				await monday.changeMondayStatus(
					constants.MONDAY_BOARDS_FORM_STATUS,
					"Completed",
					itemId
				)
			}
			console.log("reached end of script with success")
			res.send({ message: "success" })
		}
	} catch (error) {
		console.log("Error in main script", error)
		await monday.changeMondayStatus(
			constants.START_FORM_STATUS,
			"Error",
			itemId
		)
		res.send({ message: "error" })
	}
})

//webhook from Typeform trigered on submission, sending clientid

/* exports.getClientIdTypeForm = functions.https.onRequest(async (req, res) => {
	console.log("staging client id", req.body.form_response.hidden.clientid)
	//assign id from submission webhook, hidden param clientid to assign to firebase client
	try {
		const clientId = req.body.form_response.hidden.clientid
		console.log("client is stored", clientId)
		await firebase.saveIdstaging(clientId)
	} catch (error) {
		console.log("error staging client id")
	}
	res.send({ message: "success" })
}) */

/*   
    challenge for monday.com to activate new Wehbhook  
        if (!!req) {
      const challenge = req.body
      res.send(challenge)
      console.log(challenge);     
    } 
  */
exports.resendOnboarding = functions.https.onRequest(async (req, res) => {
	const itemId = req.body.event.pulseId
	const boardId = req.body.event.boardId
	const mondayObj = await monday.getResult(boardId, itemId)

	console.log(itemId, "item id from hook")
	const clientId = await monday.getClientOnboarding(itemId)
	console.log(clientId)
	const firebaseClient = await firebase.getClientInfo(clientId)
	const pmObj = await monday.getPmMondayInfo(mondayObj.pmId)
	const smObj = await monday.getPmMondayInfo(mondayObj.smId)
	let companyAssigned = ""
	if (firebaseClient.isAutomaticGift) {
		companyAssigned = "moneytree"
	} else {
		companyAssigned = "VENTURESOME"
	}
	console.log(companyAssigned)
	await sendGrid.sendOnboardingEmail(
		mondayObj.email,
		mondayObj.contactFirstName,
		firebaseClient.formLink,
		companyAssigned,
		pmObj,
		smObj
	)
	res.send({ message: "success" })
})

//triggered when a new item is created on the monday DB = addingnew contact to firestore
exports.newMondayContactDb = functions.https.onRequest(async (req, res) => {
	console.log("new item added = new contact")
	const itemId = req.body.event.pulseId
	const boardId = req.body.event.boardId
	const groupId = req.body.event.groupId
	console.log(itemId, boardId)
	console.log(req.body.event)

	//get first item of that group to retrieve client info

	const firstItemId = await monday.getGroupFirstItem(boardId, groupId)

	//if both are the same mean new group, normal contact workflow, finish script
	console.log("first Item id", firstItemId, "itemId from webhook", itemId)
	if (firstItemId !== itemId) {
		const array = req.body.event.pulseName.split(" ", [2])
		const first = array[0]
		const last = array[1]

		console.log("firstItem exist old client")
		// copy all client info to new item clientName,clientNr,address,ZIP,City,Country, startdatum, SM,Kundennummer
		const clientInfo = await monday.getNewContactInfo(firstItemId)

		console.log("clientInfo", clientInfo)
		// create new contactObj with client id on firestore
		await firebase.createDocument(
			"contacts",
			{
				clientId: clientInfo.clientId,
				itemId: itemId,
				firstName: first,
				lastName: last
			},
			"creating new contact from monday"
		)
		// copy client info to new item on monday
		await monday.copyClientInfo(clientInfo, boardId, itemId)

		res.send({ message: "success" })
	} else {
		console.log("new group, normal contact workflow")
		res.send({ message: "success" })
	}
})

//triggered when a column is changed in monday db = update the contact info on firestore
exports.updateContactDb = functions.https.onRequest(async (req, res) => {
	console.log("column updated = new contact info")
	const itemId = req.body.event.pulseId
	const columnId = req.body.event.columnId
	const value = req.body.event.value
	console.log(req.body.event)
	if (
		columnId === "client_nr_" ||
		columnId === "text" ||
		columnId === "adresse" ||
		columnId === "text12" ||
		columnId === "text3" ||
		columnId === "text6" ||
		columnId === "country" ||
		columnId === "tags7" ||
		columnId === "people" ||
		columnId === "date4"
	) {
		console.log("client Info detected, no changes allowed")
		res.send({ message: "success" })
	} else {
		console.log("contact info detected about to change database")
		// get the contact tuo update by itemId
		const contactId = await firebase.getContactId(itemId)
		console.log("contactid", contactId)
		//use new data coming to update the contacts info
		const objToSend = await monday.parseObjForFirebase(columnId, value)
		console.log("obj to send", objToSend)
		//update firestore
		await firebase.updateContact(
			contactId,
			objToSend,
			`updating contact with ${objToSend}`
		)

		res.send({ message: "success" })
	}
})
exports.consulting = functions.https.onRequest(async (req, res) => {
	console.log("consulting workflow")
	const itemId = req.body.event.pulseId
	const boardId = req.body.event.boardId
	try {
		let clientProjectNumber = ""
		let clientId = ""
		const mondayObj = await monday.getResult(boardId, itemId)
		console.log(mondayObj)
		if (mondayObj === 0) {
			throw new Error("error with mondayObj ending program")
		} else {
			if (!mondayObj.isNewClient) {
				clientProjectNumber = await firebase.getClientProjectNumber(
					mondayObj.clientId
				)

				if (clientProjectNumber === undefined) {
					await monday.changeMondayStatus(
						constants.START_FORM_STATUS,
						"Client Not Found",
						itemId
					)
					throw new Error("client not found")
				}

				//if it does we assign our global clientId param comin from  mondayObj
				clientId = mondayObj.clientId
			} else {
				clientProjectNumber = FIRST_PROJECT_NUMBER
				const firebaseClientId = await firebase.getClientId()
				clientId = firebaseClientId
				const tag = await monday.createTag(mondayObj.clientName, clientId)
				console.log(tag, "tag just created", typeof tag)

				// create project and client
				const clientObj = await createClientObj(
					clientId,
					mondayObj,
					clientProjectNumber,
					tag
				)
				const projectObj = await createProjectObj(
					clientId,
					mondayObj,
					clientProjectNumber,
					tag
				)
				const contactObj = await createContactObj(mondayObj, clientId)
				const yearCreated = projectObj.createdAt
					.getFullYear()
					.toString()
					.slice(2, 4)

				if (mondayObj.isNewClient) {
					//set status to Waiting for client for those that need to wait for onboarding form

					await monday.changeMondayStatus(
						constants.SLACK_FORM_STATUS,
						"Not Needed",
						itemId
					)
					await monday.changeMondayStatus(
						constants.ONBOARDING_FORM_STATUS,
						"Not Needed",
						itemId
					)
					await monday.changeMondayStatus(
						constants.TOGGL_FORM_STATUS,
						"Not Needed",
						itemId
					)
					await monday.changeMondayStatus(
						constants.FRAMEIO_FORM_STATUS,
						"Not Needed",
						itemId
					)

					await firebase.createDocument("clients", clientObj, "creating client")
					await firebase.createDocument(
						"contacts",
						contactObj,
						"creating contact"
					)
					await firebase.createDocument(
						"projects",
						projectObj,
						"creating project"
					)
					const contactInfo = await firebase.getContactInfo(clientObj.idNumber)
					const newItemId = await monday.saveClientToMondayDatabase(
						clientObj,
						contactInfo
					)
					const primaryContactId = await firebase.getPrimaryContactId(
						clientObj.idNumber
					)
					await monday.changeMondayStatus(
						constants.MONDAY_DB_FORM_STATUS,
						"Completed",
						itemId
					)
					console.log("primary contact id", primaryContactId)
					await firebase.updateContact(
						primaryContactId,
						{ itemId: newItemId },
						"storing itemid on primary contact after submission"
					)
					await monday.setMondayClientId(boardId, itemId, clientObj.idNumber)
					// create google drive entire tree
					projectObj.isNewClient = true

					await googleDrive.createFolderTree(projectObj)

					await monday.changeMondayStatus(
						constants.GOOGLE_DRIVE_FORM_STATUS,
						"Completed",
						itemId
					)

					if (projectObj.companyAssigned === "VENTURESOME") {
						//add task "send welcome card" with address on up{date}
						await monday.sendWelcome(
							clientObj,
							"VENTURESOME",
							projectObj.pmId,
							contactObj
						)
						//add to Video project Overview
						/* 	await monday.addVideoProjectBoard(
							clientObj.idNumber,
							yearCreated,
							projectObj.clientProjectNumber,
							clientObj.name,
							projectObj.name,
							projectObj.pmId,
							clientObj.tag
						)  */
						//create frameio project
					} else if (projectObj.companyAssigned === "moneytree") {
						/* await monday.sendWelcome(
							clientObj,
							"moneytree",
							projectObj.pmId,
							contactObj
						) */
						await monday.addMoneyTreeAccount(
							clientObj.idNumber,
							yearCreated,
							projectObj.clientProjectNumber,
							clientObj.name,
							projectObj.name,
							projectObj.pmId,
							clientObj.tag
						)
						console.log("new client money tree before setting tlg to completed")
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
						clientObj.smId,
						projectObj.companyAssigned,
						clientObj.tag
					)

					await monday.changeMondayStatus(
						constants.MONDAY_BOARDS_FORM_STATUS,
						"Completed",
						itemId
					)
				} else {
					//old client

					//set all not needed items to completed first for existing clients
					await monday.changeMondayStatus(
						constants.ONBOARDING_FORM_STATUS,
						"Not Needed",
						itemId
					)
					await monday.changeMondayStatus(
						constants.SLACK_FORM_STATUS,
						"Not Needed",
						itemId
					)
					await monday.changeMondayStatus(
						constants.MONDAY_DB_FORM_STATUS,
						"Not Needed",
						itemId
					)
					await monday.changeMondayStatus(
						constants.FRAMEIO_FORM_STATUS,
						"Completed",
						itemId
					)
					await monday.changeMondayStatus(
						constants.TOGGL_FORM_STATUS,
						"Not Needed",
						itemId
					)

					await firebase.createDocument(
						"projects",
						projectObj,
						"create project"
					)

					if (projectObj.companyAssigned === "VENTURESOME") {
						// slack to not needed, onboarding not needed, monday db
					} else if (projectObj.companyAssigned === "moneytree") {
						await monday.addMoneyTreeAccount(
							clientObj.idNumber,
							yearCreated,
							projectObj.clientProjectNumber,
							clientObj.name,
							projectObj.name,
							projectObj.pmId,
							clientObj.tag
						)
					}

					// add to Project overview Inbox always
					const firebaseClient = await firebase.getClientInfo(
						projectObj.clientId
					)
					projectObj.projectsFolderId = firebaseClient.projectsFolderId
					projectObj.isNewClient = false

					await googleDrive.createFolderTree(projectObj)

					await monday.changeMondayStatus(
						constants.GOOGLE_DRIVE_FORM_STATUS,
						"Completed",
						itemId
					)
					await monday.addProjectOverview(
						clientObj.idNumber,
						yearCreated,
						projectObj.clientProjectNumber,
						clientObj.name,
						projectObj.name,
						projectObj.pmId,
						clientObj.createdAt,
						clientObj.smId,
						projectObj.companyAssigned,
						clientObj.tag
					)
					await monday.changeMondayStatus(
						constants.MONDAY_BOARDS_FORM_STATUS,
						"Completed",
						itemId
					)
				}
				console.log("reached end of script with success")
				res.send({ message: "success" })
			}
		}
	} catch (error) {
		console.error(error)
	}
})
