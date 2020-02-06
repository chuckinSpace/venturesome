require("dotenv").config()
var request = require("request")
const monday = require("./monday")
const constants = require("./constants")
const token = process.env.FRAMEIO_TOKEN
const teamId = process.env.FRAMEIO_TEAM_ID

const createFrameIoProject = async (projectName, itemId) => {
	try {
		var options = {
			method: "POST",
			url: `https://api.frame.io/v2/teams/${teamId}/projects`,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`
			},
			formData: {
				name: `${projectName}`
			}
		}
		return request(options, async function(error, response) {
			if (error) {
				throw new Error(error)
			} else {
				const json = JSON.parse(response.body)
				if (json.code !== 200) {
					await monday.changeMondayStatus(
						constants.FRAMEIO_FORM_STATUS,
						"Error",
						itemId
					)
					return Error("Error on frameIo process", error)
				}
			}
		})
	} catch (error) {
		console.log("in error final")
	}
}

module.exports.createFrameIoProject = createFrameIoProject
const test = async () => {
	createFrameIoProject("test", 413267104)
}
/* test() */
