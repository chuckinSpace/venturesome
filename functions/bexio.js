const Bexio = require("bexio")
const express = require("express")
const createServer = require("http").createServer
const axios = require("axios")
require("dotenv").config()
// initialize the object
const bexioApi = new Bexio.default(
	process.env.BEXIO_CLIENT_ID,
	process.env.BEXIO_SECRET,
	"http://127.0.0.1/callback",
	[Bexio.Scopes.CONTACT_SHOW]
)

// initialize express and server
const app = express()
const server = createServer(app)

// redirect the user to the Bexio login page
app.get("/", (req, res) => {
	axios
		.get("https://idp.bexio.com/")
		.then(function(response) {
			return response.json()
		})
		.then(function(myJson) {
			console.log(myJson)
		})
		.catch(err => console.log(err.data))
})

// receive the callback of the bexio login page and get the access token
app.get("/callback", (req, res) => {
	console.log("here", req.query)
	bexioApi
		.generateAccessToken(req.query)
		.then(() => {
			res.send("success")
		})
		.catch(err => {
			res.send("error", err)
		})
})

// list all contacts
app.get("/list_contacts", (req, res) => {
	bexioApi.contacts
		.list({ order_by: "name_1" })
		.then(contacts => {
			res.send(contacts)
		})
		.catch(err => {
			res.send(err)
		})
})

// listen on port 3000
server.listen(3000, () => {
	console.log("Listening on port 3000")
})
