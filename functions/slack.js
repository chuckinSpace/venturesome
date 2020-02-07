require("dotenv").config()
var request = require("request")
const { WebClient } = require("@slack/web-api")

// Create a new instance of the WebClient class with the token read from your environment variable
const web = new WebClient(process.env.SLACK_TOKEN)

const createSlackChannel = async (users, clientName) => {
	console.log("in create slack channel, users coming", users, clientName)
	try {
		const newChannel = await web.groups.create({ name: clientName })
		const channelId = await newChannel.group.id
		console.log(channelId, "channel id", newChannel, "newChannel")
		await users.map(user =>
			web.groups.invite({ channel: channelId, user: user.id })
		)
		return channelId
	} catch (error) {
		console.log(error)
	}
}

const sendClientInvite = async (clientEmail, channelId) => {
	try {
		var options = {
			method: "POST",
			url: "https://slack.com/api/users.admin.invite",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${process.env.SLACK_LEGACY_TOKEN}`
			},
			formData: {
				email: clientEmail,
				channels: channelId,
				ultra_restricted: "true"
			}
		}
		request(options, function(error, response) {
			if (error) throw new Error("error trying to send invite to client", error)
			console.log(
				`sucess sending invitation to channel ${channelId} to user for slack`,
				response.body
			)
		})
	} catch (err) {
		throw new Error("error trying to send invite to client")
	}
}

const getUserbyEmail = async userEmail => {
	try {
		const response = await web.users.lookupByEmail({ email: userEmail })
		return { id: response.user.id }
	} catch (error) {
		console.log("error gettin user by email from slack", error)
	}
}

const getSlackIds = async slackObj => {
	console.log(slackObj, "slackObj")
	const getUsers = async () => {
		return Promise.all(slackObj.map(email => getUserbyEmail(email)))
	}
	return getUsers()
		.then(data => {
			console.log("success getting ids for users from slack", data)
			return data
		})
		.catch(err => {
			throw new Error("error getting ids for users from slack", err)
		})
}

const sendWelcomeMessage = async (channelId, team, clientName) => {
	console.log("sending messages", channelId, team, clientName)
	try {
		let message = "Welcome"
		if (team === "client") {
			message = `Willkommen bei, ${clientName}! Wir freuen uns auf die bevorstehende Zusammenarbeit.:handshake:`
		} else if (team === "internal") {
			message = `:fire: New client awesome work!!, this is an internal channel for the client ${clientName}:fire:`
		} else if (team === "internal-only")
			message = `:fire: New client awesome work!!, client ${clientName} selected not to participate on slack :fire:`
		await web.chat.postMessage({
			channel: channelId,
			text: message
		})
	} catch (error) {
		throw new Error(
			"error sending messages to slack",
			error,
			channelId,
			team,
			clientName
		)
	}
}

/***************** SLACK CHANNELS CREATION WORKFLOW ******************/

const slackCreationWorkflow = async clientFirebase => {
	console.log("in slack creation workflow", clientFirebase)

	//if the mondayObj.slack is true (meaning that the client prefers to use slack) we will create 2 private channels
	//both channels will have all the users selected in the monday board, but we will add the client (by sending and invite from slack) to one of the channels
	try {
		// first we retrieve list of users and slack option form clientComing from firestore (emails)
		let slackUsers = clientFirebase.slackUsers
		let slackOption = clientFirebase.slack
		//then we send the emails to our slack function to get back the ids from slack for those users, to later create the channels
		let slackIds = await getSlackIds(slackUsers)

		if (slackOption) {
			//create 2 channel add slackUsers to both and invite client to 1
			const companyChannelId = await createSlackChannel(
				slackIds,
				`TEST-intern-${clientFirebase.idNumber}-${clientFirebase.name}`
			)
			const clientChannelId = await createSlackChannel(
				slackIds,
				`TEST-${clientFirebase.idNumber}-${clientFirebase.name}`
			)
			console.log(
				companyChannelId,
				"companyChannelId",
				clientChannelId,
				"clientChannelId"
			)
			// invite the client to clientChannel just created via email

			await sendWelcomeMessage(
				companyChannelId,
				"internal",
				clientFirebase.name
			)
			/* await sendWelcomeMessage(clientChannelId, "client", clientFirebase.name) */
			await sendClientInvite(
				clientFirebase.contactEmail,
				clientChannelId.toString()
			)
		} else {
			//create one private channel add slackUsers
			const companyChannelId = await createSlackChannel(
				slackIds,
				`TEST-intern-${clientFirebase.idNumber}-${clientFirebase.name}`
			)
			await sendWelcomeMessage(
				companyChannelId,
				"internal-only",
				clientFirebase.name
			)
			console.log(companyChannelId, "companyChannelId")
		}
	} catch (error) {
		throw new Error("error when crating slack channels", error, clientFirebase)
	}
}

module.exports.createSlackChannel = createSlackChannel
module.exports.getUserbyEmail = getUserbyEmail
module.exports.getSlackIds = getSlackIds
module.exports.sendClientInvite = sendClientInvite
module.exports.sendWelcomeMessage = sendWelcomeMessage
module.exports.slackCreationWorkflow = slackCreationWorkflow
