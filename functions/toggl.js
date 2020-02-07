let rp = require("request-promise")
require("dotenv").config()
const WID = process.env.TOGGL_WID
const monday = require("./monday")
const constants = require("./constants")
const sendGrid = require("./sendGrid")

const createClient = async (clientName, clientNumber, itemId, action) => {
	console.log("creating toggl client", clientName)
	let options = {
		method: "POST",
		url: "https://www.toggl.com/api/v8/clients",
		auth: {
			user: process.env.TOGGL_USER,
			pass: "api_token"
		},
		body: {
			client: {
				name: `${clientNumber.toString().padStart(3, "0")} ${clientName}`,
				wid: WID
			}
		},
		json: true
	}

	return rp(options)
		.then(response => {
			monday.changeMondayStatus(
				constants.TOGGL_FORM_STATUS,
				"Completed",
				itemId
			)
			return response.data.id
		})
		.catch(err => {
			console.log("error when creating client on toggl", err.message)
			monday.changeMondayStatus(constants.TOGGL_FORM_STATUS, "Error", itemId)
			sendGrid.sendErrorEmail(
				`toggl/createClient client Name: ${clientName} itemId ${itemId}`,
				action,
				err.message
			)
		})
}

const createProject = async (
	togglClientId,
	clientId,
	projectName,
	year,
	clientProjectNumber,
	itemId,
	action
) => {
	console.log("creating toggle project", projectName)
	let options = {
		method: "POST",
		url: "https://www.toggl.com/api/v8/projects",
		auth: {
			user: process.env.TOGGL_USER,
			pass: "api_token"
		},
		body: {
			project: {
				name: `${clientId
					.toString()
					.padStart(3, "0")}_${year}_${clientProjectNumber
					.toString()
					.padStart(2, "0")} | ${projectName}`,
				wid: WID,
				is_private: false,
				cid: togglClientId
			}
		},
		json: true
	}

	rp(options)
		.then(response => {
			console.log("sucess creating toggl project")
			monday.changeMondayStatus(
				constants.TOGGL_FORM_STATUS,
				"Completed",
				itemId
			)
		})
		.catch(err => {
			console.log("error when creating toggl project", err.message)
			monday.changeMondayStatus(constants.TOGGL_FORM_STATUS, "Error", itemId)
			sendGrid.sendErrorEmail(
				`toggl/createProject- projectname ${projectName} clientid ${clientId}-itemId${itemId}`,
				action,
				err.message
			)
		})
}

module.exports.createClient = createClient
module.exports.createProject = createProject
