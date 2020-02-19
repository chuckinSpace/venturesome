var express = require("express")
var router = express.Router()
const toggl = require("../scripts/toggl.js")
const firebase = require("../scripts/firebase.js")
/* GET home page. */
router.get("/", function(req, res, next) {
	res.send("server connected")
})
router.post("/", async (req, res, next) => {
	const clientName = req.body.clientName
	const clientNumber = req.body.clientNumber

	await toggl.createClient(clientName, clientNumber)
	res.send("ok")
})
router.post("/clockIn", async (req, res, next) => {
	const description = req.body.description
	const pid = req.body.pid

	await toggl.clockIn(description, pid)
	res.send("ok")
})
module.exports = router
