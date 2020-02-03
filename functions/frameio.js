require("dotenv").config()
var request = require("request")

const token = process.env.FRAMEIO_TOKEN
const teamId = process.env.FRAMEIO_TEAM_ID

const createFrameIoProject = async projectName => {
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
		request(options, function(error, response) {
			if (error) throw new Error(error)
			console.log(response.body)
		})
	} catch (error) {
		console.log(error)
	}
}

module.exports.createFrameIoProject = createFrameIoProject
