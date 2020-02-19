let rp = require("request-promise")
require("dotenv").config()
const WID = process.env.TOGGL_WID

const createClient = async (clientName, clientNumber) => {
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
			console.log(response)
			return response
		})
		.then(response => createProject(response.data.id))
		.catch(err => console.log(err))
}

const createProject = async togglClientId => {
	console.log("creating toggle project", togglClientId)
	let options = {
		method: "POST",
		url: "https://www.toggl.com/api/v8/projects",
		auth: {
			user: process.env.TOGGL_USER,
			pass: "api_token"
		},
		body: {
			project: {
				name: `TEST PROJECT`,
				wid: WID,
				is_private: false,
				cid: togglClientId
			}
		},
		json: true
	}

	rp(options)
		.then(response => {
			console.log(response)
			return response.data
		})
		.catch(err => {
			console.error("error when creating toggl project", err.message)
		})
}

const clockIn = async (description, pid) => {
	console.log("creating toggle project", description, pid)
	let options = {
		method: "POST",
		url: "https://www.toggl.com/api/v8/time_entries/start",
		auth: {
			user: process.env.TOGGL_USER,
			pass: "api_token"
		},
		body: {
			time_entry: {
				description: description,
				pid: pid,
				created_with: "curl"
			}
		},
		json: true
	}

	rp(options)
		.then(response => {
			console.log(response)
			return response.data
		})
		.catch(err => {
			console.error("error when starting time entry", err.message)
		})
}

module.exports.createClient = createClient
module.exports.clockIn = clockIn
