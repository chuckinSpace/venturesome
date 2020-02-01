//firebase authentication
const admin = require("firebase-admin")
require("dotenv").config()
let serviceAccount = require("./serviceAccountKey.json")
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: process.env.DATABASE_URL
})

const db = admin.firestore()

//get last id from firebase and return the next id
const getClientId = async () => {
	console.log("in firebase functions getClient")
	try {
		let lastId = 1
		const querySnapshot = await db
			.collection("clients")
			.orderBy("idNumber", "desc")
			.limit(1)
			.get()
		querySnapshot.forEach(doc => (lastId = doc.data().idNumber + 1))

		return lastId
	} catch (err) {
		return console.log(err)
	}
}

//get the number of project for the company overall
const getInternalProjectId = async () => {
	try {
		let counter = 0
		const querySnapshot = await db.collection("projects").get()
		querySnapshot.forEach(doc => (counter += 1))
		return counter + 1
	} catch (err) {
		return console.log(err)
	}
}

//when client is not new, get the last client project number and return the next client project number for this client

const getClientProjectNumber = async clientId => {
	try {
		let counter = 0
		const querySnapshot = await db
			.collection("projects")
			.where("clientId", "==", clientId)
			.get()
		querySnapshot.forEach(doc => (counter += 1))
		return counter + 1
	} catch (err) {
		return console.log(err)
	}
}

//creates the client on firebase "clients" collection using the client Obj
const createClient = async client => {
	db.collection("clients")
		.add({
			idNumber: client.idNumber,
			name: client.name,
			email: client.email,
			phone: client.phone,
			clientProjectNumber: client.clientProjectNumber,
			street: client.street,
			zipCode: client.zipCode,
			city: client.city,
			mondayItemIdDeal: client.mondayItemIdDeal,
			formLink: client.formLink,
			createdAt: client.createdAt,
			slackUsers: client.slackUsers
		})
		.then(doc => console.log("success creating client on firebase", doc.id))
		.catch(err => console.log("error creating client on firebase"))
}

//temp func for new client format
const createNewClient = async client => {
	db.collection("clients")
		.add(client)
		.then(doc => console.log("success creating client on firebase", doc.id))
		.catch(err => console.log("error creating client on firebase"))
}

//creates the project on firebase "projects" collection using the project obj
const createProject = async project => {
	console.log("project obj going to firebase", project)
	db.collection("projects")
		.add({
			clientId: project.clientId,
			clientEmail: project.clientEmail,
			clientName: project.clientName,
			createdAt: project.createdAt,
			idNumber: project.idNumber,
			pmEmail: project.pmEmail,
			pmName: project.pmName,
			pmId: project.pmId,
			companyAssigned: project.companyAssigned,
			name: project.name,
			clientPhone: project.clientPhone,
			clientProjectNumber: project.clientProjectNumber,
			internalProjectId: project.internalProjectId,
			smId: project.smId
		})
		.then(doc => console.log("success creating project on firebase", doc.id))
		.catch(err => console.log("error creating project on firebase", err))
}

//saves the client id on "staging" collection on firebase
const saveIdstaging = async clientId => {
	console.log("stagin client id in firebase", clientId)
	try {
		const doc = await db.collection("staging").add({
			clientId: clientId,
			createdAt: new Date()
		})
		const docId = doc.id
		return docId
	} catch (error) {
		console.log("Error when stagind client id ", error)
	}
}

// retrieves the client id from "staging"
const getStagedClientId = async () => {
	let clientId = ""
	const querySnapshot = await db
		.collection("staging")
		.orderBy("createdAt", "asc")
		.limit(1)
		.get()
	querySnapshot.forEach(doc => (clientId = doc.data().clientId))
	// delete staged client
	return clientId
}
// deletes the client id from staging
const deleteStagedClient = async clientId => {
	let stagedClient = db.collection("staging").where("clientId", "==", clientId)
	stagedClient
		.get()
		.then(function(querySnapshot) {
			querySnapshot.forEach(function(doc) {
				doc.ref.delete()
			})
		})
		.then(() => console.log("item succesfully removed"))
		.catch(err => console.log("error removing staged client", err))
}

const updateFirebase = async (
	collection,
	whereParam,
	whereIqualTo,
	objectToStore,
	consoleText
) => {
	console.log(collection, whereParam, whereIqualTo, objectToStore, consoleText)
	try {
		const getSnapshot = db
			.collection(collection)
			.where(whereParam, "==", whereIqualTo)
		const snapObj = await getSnapshot.get()
		snapObj.forEach(doc => doc.ref.update(objectToStore))
	} catch (error) {
		throw new Error(`Error when ${consoleText} `, error)
	}
}

const getClient = async clientId => {
	console.log("getClient starting with client Id", clientId)
	let clientObj = ""
	try {
		const getClientSnap = db
			.collection("clients")
			.where("idNumber", "==", clientId)
		const clientSnap = await getClientSnap.get()
		clientSnap.forEach(doc => {
			clientObj = doc.data()
		})
		return clientObj
	} catch (error) {
		console.log(error)
	}
}

//exports
module.exports.getClientId = getClientId
module.exports.getInternalProjectId = getInternalProjectId
module.exports.getClientProjectNumber = getClientProjectNumber
module.exports.createClient = createClient
module.exports.createProject = createProject
module.exports.saveIdstaging = saveIdstaging
module.exports.getStagedClientId = getStagedClientId
module.exports.deleteStagedClient = deleteStagedClient
module.exports.updateFirebase = updateFirebase
module.exports.getClient = getClient
module.exports.createNewClient = createNewClient
