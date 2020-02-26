require("dotenv").config()
var request = require("request")
const { WebClient } = require("@slack/web-api")
const monday = require("./monday")
const constants = require("./constants")
const sendGrid = require("./sendGrid")

// Create a new instance of the WebClient class with the token read from your environment variable
/* const web = new WebClient(process.env.SLACK_TOKEN) */
const web = new WebClient(process.env.SLACK_NICK_TOKEN)
const createSlackChannel = async (users, clientName, itemId, action) => {
	console.log("in create slack channel, users coming", users, clientName)
	try {
		const newChannel = await web.groups.create({ name: clientName })
		const channelId = await newChannel.group.id
		//adding me for testing period
		users.push({ id: "URR2P0WTX" })
		console.log(channelId, "channel id")

		await users.map(user => {
			if (user.id !== "UL4CCS4AE") {
				web.groups.invite({ channel: channelId, user: user.id })
			}
		})

		await monday.changeMondayStatus(
			constants.SLACK_FORM_STATUS,
			"Completed",
			itemId,
			"slack"
		)
		return channelId
	} catch (err) {
		console.log(err)
		monday.changeMondayStatus(
			constants.SLACK_FORM_STATUS,
			"Error",
			itemId,
			"error in slack"
		)
		sendGrid.sendErrorEmail(
			`/slack/createSlackChannel - clientName ${clientName}-itemId${itemId}`,
			action,
			err.data.error
		)
	}
}
const test = async () => {
	try {
		await createSlackChannel(
			[{ id: "UL4CCS4AE" }],
			"TEST-Carlos",
			473132564,
			"creating channel"
		)
	} catch (error) {
		console.log(error)
	}
}
/* test() */
const sendClientInvite = async (clientEmail, channelId, itemId, action) => {
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
		request(options, async function(err, response) {
			if (!JSON.parse(response.body).ok) {
				console.log("error trying to send invite to client", err)
				monday.changeMondayStatus(
					constants.SLACK_FORM_STATUS,
					"Error",
					itemId,
					"eror in slack"
				)
				sendGrid.sendErrorEmail(
					`/slack/sendClientInvite - clientEmail ${clientEmail}-itemId${itemId}`,
					action,
					err
				)
			} else {
				console.log(
					`sucess sending invitation to channel ${channelId} to user for slack`,
					JSON.parse(response.body)
				)
				await monday.changeMondayStatus(
					constants.SLACK_FORM_STATUS,
					"Completed",
					itemId,
					"slack"
				)
			}
		})
	} catch (err) {
		console.log("error trying to send invite to client", err)
	}
}

const getUserbyEmail = async (userEmail, itemId, action) => {
	console.log("in users email", userEmail, action)
	try {
		const response = await web.users.lookupByEmail({ email: userEmail })
		await monday.changeMondayStatus(
			constants.SLACK_FORM_STATUS,
			"Completed",
			itemId,
			"slack"
		)
		return { id: response.user.id }
	} catch (err) {
		console.log("error gettin user by email from slack", err.data.ok)
		throw err
	}
}

const getSlackIds = async (slackObj, itemId, action) => {
	console.log(slackObj, "slackObj")
	const getUsers = async () => {
		try {
			return Promise.all(
				slackObj.map(email =>
					getUserbyEmail(email, itemId, "getting Users by email")
				)
			)
		} catch (err) {
			console.log(err)
			monday.changeMondayStatus(
				constants.SLACK_FORM_STATUS,
				"Error",
				itemId,
				"error in slack"
			)
			sendGrid.sendErrorEmail(
				`/slack/sendClientInvite - slackObj ${slackObj}-itemId ${itemId}`,
				action,
				err
			)
		}
	}
	return getUsers()
		.then(data => {
			console.log("success getting ids for users from slack", data)
			return data
		})
		.catch(err => {
			console.log(err)
			monday.changeMondayStatus(
				constants.SLACK_FORM_STATUS,
				"Error",
				itemId,
				"error in slack"
			)
		})
}

const sendWelcomeMessage = async (
	channelId,
	team,
	clientName,
	itemId,
	action
) => {
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
	} catch (err) {
		console.log(err)
		monday.changeMondayStatus(
			constants.SLACK_FORM_STATUS,
			"Error",
			itemId,
			"error in slack"
		)
		sendGrid.sendErrorEmail(
			`/slack/sendClientInvite - clientName ${clientName}-itemId ${itemId}`,
			action,
			err
		)
	}
}

/***************** SLACK CHANNELS CREATION WORKFLOW ******************/

const slackCreationWorkflow = async (clientFirebase, itemId) => {
	console.log("in slack creation workflow", clientFirebase)

	//if the mondayObj.slack is true (meaning that the client prefers to use slack) we will create 2 private channels
	//both channels will have all the users selected in the monday board, but we will add the client (by sending and invite from slack) to one of the channels
	try {
		// first we retrieve list of users and slack option form clientComing from firestore (emails)
		let slackUsers = clientFirebase.slackUsers
		let slackOption = clientFirebase.slack
		//then we send the emails to our slack function to get back the ids from slack for those users, to later create the channels
		let slackIds = await getSlackIds(slackUsers, itemId, "get slack Ids")

		if (slackOption) {
			//create 2 channel add slackUsers to both and invite client to 1
			const companyChannelId = await createSlackChannel(
				slackIds,
				`intern-${clientFirebase.idNumber}-${clientFirebase.name}`,
				itemId,
				"creating Internal Channel"
			)
			const clientChannelId = await createSlackChannel(
				slackIds,
				`${clientFirebase.idNumber}-${clientFirebase.name}`,
				itemId,
				"creating Client channel"
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
				clientFirebase.name,
				itemId,
				"sending messages slack"
			)

			await sendClientInvite(
				clientFirebase.slackEmail,
				clientChannelId.toString(),
				itemId,
				"sending client invite to slack channel"
			)
		} else {
			//create one private channel add slackUsers
			const companyChannelId = await createSlackChannel(
				slackIds,
				`intern-${clientFirebase.idNumber}-${clientFirebase.name}`,
				itemId,
				"creating Intern channel"
			)
			await sendWelcomeMessage(
				companyChannelId,
				"internal-only",
				clientFirebase.name
			)
			console.log(companyChannelId, "companyChannelId")
		}
	} catch (err) {
		console.log(err)
		monday.changeMondayStatus(
			constants.SLACK_FORM_STATUS,
			"Error",
			itemId,
			"error in slack"
		)
		sendGrid.sendErrorEmail(
			`/slack/sendClientInvite - clientFirebase ${clientFirebase}-itemId ${itemId}`,
			"creating slack channels",
			err
		)
	}
}

module.exports.createSlackChannel = createSlackChannel
module.exports.getUserbyEmail = getUserbyEmail
module.exports.getSlackIds = getSlackIds
module.exports.sendClientInvite = sendClientInvite
module.exports.sendWelcomeMessage = sendWelcomeMessage
module.exports.slackCreationWorkflow = slackCreationWorkflow
