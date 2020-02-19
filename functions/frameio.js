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
			console.log(`sucess ${action}`, res.data)
			monday.changeMondayStatus(
				constants.FRAMEIO_FORM_STATUS,
				"Completed",
				itemId
			)
		})
		.catch(err => {
			console.log(`error ${action}`, err.response.data)
			monday.changeMondayStatus(constants.FRAMEIO_FORM_STATUS, "Error", itemId)
			sendGrid.sendErrorEmail(
				`/freameIo/createFrameIoProject-${projectName}-itemId${itemId}`,
				action,
				err.response.data
			)
		})
}
const test = async () => {
	await createFrameIoProject("test", 413267104, "creating frame")
}
/* test() */

module.exports.createFrameIoProject = createFrameIoProject
