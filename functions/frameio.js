require("dotenv").config()

const axios = require("axios")
const monday = require("./monday")
const constants = require("./constants")
const sendGrid = require("./sendGrid")
const token = process.env.FRAMEIO_TOKEN
const teamId = process.env.FRAMEIO_TEAM_ID

const createFrameIoProject = (projectName, itemId, action) => {
	const body = {
		name: projectName
	}
	return axios
		.post(`https://api.frame.io/v2/teams/${teamId}/projects`, body, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		})

		.then(res => {
			console.log(` 1 sucess ${action}`, res.data)
		})
		.catch(err => {
			console.log(` 2 error ${action}`, err.response.data)
			monday.changeMondayStatus(constants.FRAMEIO_FORM_STATUS, "Error", itemId)
			sendGrid.sendErrorEmail("createFrameIoProject", action, err.response.data)
		})
}
createFrameIoProject("test", 413267104, "create frame io")
module.exports.createFrameIoProject = createFrameIoProject
