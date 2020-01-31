// id  3695043
// workspace 2355444
let rp = require("request-promise")
require("dotenv").config()

const WID = process.env.TOGGL_WID

const createClient = async (clientName, clientNumber) => {
	console.log("creating toggl", clientName)
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
			return response.data.id
		})

		.catch(err => {
			throw new Error("error when creating client on toggl", err)
		})
}

const createProject = async (
	togglClientId,
	clientId,
	projectName,
	year,
	clientProjectNumber
) => {
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
		.then(response => console.log("sucess creating toggl project"))
		.catch(err => {
			throw new Error("error when creating toggl project", err)
		})
}

module.exports.createClient = createClient
module.exports.createProject = createProject
