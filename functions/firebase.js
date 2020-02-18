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
		querySnapshot.forEach(doc => (lastId = parseInt(doc.data().idNumber) + 1))

		return lastId.toString()
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
const createDocument = async (collection, object, action) => {
	console.log("client going to firabase", collection, object, action)

	try {
		return db
			.collection(collection)
			.add(object)
			.then(doc => {
				console.log(`success ${action} on firebase`, doc.id)
				return doc.id
			})
			.catch(err => console.log(`error ${action}on firebase`, err))
	} catch (error) {
		console.error(
			"error creating document in firebase",
			error,
			object,
			collection
		)
	}
}
const test = async () => {
	console.log(
		await createDocument("contacts", { clientId: 1 }, "creating contact")
	)
}
/* test()
 */
const getPrimaryContactId = async clientId => {
	console.log("getPrimaryContact")

	try {
		let contact = ""
		const contactSnap = await db
			.collection("contacts")
			.where("clientId", "==", clientId)
			.where("isPrimary", "==", true)
			.get()
		contactSnap.forEach(doc => (contact = doc.id))

		return contact
	} catch (error) {
		console.error("error creating document in firebase", error, clientId)
	}
}
const updateContact = async (itemId, objectToStore, action) => {
	try {
		const contact = db.collection("contacts").doc(itemId)
		await contact.update(objectToStore)
	} catch (error) {
		console.error(error, action)
	}
}

//creates the project on firebase "projects" collection using the project obj
/* const createProject = async project => {
	console.log("project obj going to firebase", project)
	db.collection("projects")
		.add(project)
		.then(doc => console.log("success creating project on firebase", doc.id))
		.catch(err => console.log("error creating project on firebase", err))
} */

//saves the client id on "staging" collection on firebase
/* const saveIdstaging = async clientId => {
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
} */

// retrieves the client id from "staging"
/* const getStagedClientId = async () => {
	let clientId = ""
	const querySnapshot = await db
		.collection("staging")
		.orderBy("createdAt", "asc")
		.limit(1)
		.get()
	querySnapshot.forEach(doc => (clientId = doc.data().clientId))
	// delete staged client
	return clientId
} */
// deletes the client id from staging
/* const deleteStagedClient = async clientId => {
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
} */

const updateFirebase = async (
	collection,
	whereParam,
	whereIqualTo,
	objectToStore,
	consoleText
) => {
	console.log(collection, whereParam, whereIqualTo, objectToStore, consoleText)

	const task = async () => {
		const getSnapshot = db
			.collection(collection)
			.where(whereParam, "==", whereIqualTo)
		const snapObj = await getSnapshot.get()
		for (let client of snapObj.docs) {
			let clients = await client.ref
				.update(objectToStore)
				.then(data => console.log("update finished", data))
		}
	}
	try {
		await task()
	} catch (error) {
		throw new Error(`Error when ${consoleText} `, error)
	}
}

const getClientInfo = async clientId => {
	console.log("getClient starting with client Id", clientId, typeof clientId)
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

const getAllClients = async () => {
	let clients = []
	const getClientsSnap = db.collection("clients").orderBy("idNumber", "asc")
	const clientSnap = await getClientsSnap.get()
	clientSnap.forEach(doc => {
		clients.push(doc.data())
	})
	return clients
}
const getContactInfo = async clientId => {
	let contactInfo = ""
	const contactSnap = await db
		.collection("contacts")
		.where("clientId", "==", clientId)
		.get()
	contactSnap.forEach(contact => (contactInfo = contact.data()))
	return contactInfo
}
/* const test = async () => {
	console.log(await getContactInfo("112"))
}
test() */

//exports
module.exports.getClientId = getClientId
module.exports.getInternalProjectId = getInternalProjectId
module.exports.getClientProjectNumber = getClientProjectNumber
module.exports.createDocument = createDocument
/* module.exports.createProject = createProject
module.exports.saveIdstaging = saveIdstaging
module.exports.getStagedClientId = getStagedClientId
module.exports.deleteStagedClient = deleteStagedClient */
module.exports.updateFirebase = updateFirebase
module.exports.getClientInfo = getClientInfo
module.exports.getAllClients = getAllClients
module.exports.getContactInfo = getContactInfo
module.exports.getPrimaryContactId = getPrimaryContactId
module.exports.updateContact = updateContact
