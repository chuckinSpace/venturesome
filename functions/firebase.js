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
			await client.ref
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
const getContactId = async itemId => {
	let contactId = ""
	console.log("about to get contact id with", itemId)
	try {
		const getClientsSnap = await db
			.collection("contacts")
			.where("itemId", "==", itemId)
			.get()
		getClientsSnap.forEach(data => (contactId = data.id))
		return contactId
	} catch (error) {
		console.error(error)
	}
}

//exports
module.exports.getClientId = getClientId
module.exports.getInternalProjectId = getInternalProjectId
module.exports.getClientProjectNumber = getClientProjectNumber
module.exports.createDocument = createDocument
module.exports.updateFirebase = updateFirebase
module.exports.getClientInfo = getClientInfo
module.exports.getAllClients = getAllClients
module.exports.getContactInfo = getContactInfo
module.exports.getPrimaryContactId = getPrimaryContactId
module.exports.updateContact = updateContact
module.exports.getContactId = getContactId
