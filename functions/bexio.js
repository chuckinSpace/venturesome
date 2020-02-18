const Bexio = require("bexio")
const express = require("express")
const createServer = require("http").createServer
const { Issuer } = require("openid-client")
const { generators } = require("openid-client")
const code_verifier = generators.codeVerifier()
require("dotenv").config()
// initialize the object
/* 
const issuer = Issuer.discover(
	"https://idp.bexio.com/.well-known/openid-configuration"
) // => Promise
	.then(function(googleIssuer) {
		const client = new googleIssuer.Client({
			client_id: process.env.BEXIO_CLIENT_ID,
			client_secret: process.env.BEXIO_SECRET,
			redirect_uris: ["http://localhost:3000/cb"],
			response_types: ["code"]
			// id_token_signed_response_alg (default "RS256")
			// token_endpoint_auth_method (default "client_secret_basic")
		})
		const code_challenge = generators.codeChallenge(code_verifier)

		client.authorizationUrl({
			scope: "openid email profile",
			resource: "https://idp.bexio.com/authorize",
			code_challenge,
			code_challenge_method: "S256"
		})
		console.log(client)
	})
 */
/* const client = new googleIssuer.Client({
	client_id: 
	client_secret:
	
	redirect_uris: ["http://localhost:3000/cb"],
	response_types: ["code"]
	// id_token_signed_response_alg (default "RS256")
	// token_endpoint_auth_method (default "client_secret_basic")
}) */

const bexioApi = new Bexio.default(
	process.env.BEXIO_CLIENT_ID,
	process.env.BEXIO_SECRET,
	"http://127.0.0.1/callback",
	[Bexio.Scopes.CONTACT_SHOW]
)

console.log(process.env.BEXIO_USER, process.env.BEXIO_PASS)
bexioApi
	.fakeLogin(process.env.BEXIO_USER, process.env.BEXIO_PASS)
	.then(res => {
		if (res) {
			console.log(res)
		} else {
			console.log("Failed")
		}
	})
	.catch(err => {
		console.log("Failed")
		console.log(err)
	}) /* 
// initialize express and server
const app = express()
const server = createServer(app)

//https://idp.bexio.com/authorize?response_type=code&client_id={...}&client_secret={...}&redirect_uri={...}&scope={...}
// redirect the user to the Bexio login page
app.get("/", (req, res) => {
	if (!bexioApi.isInitialized()) {
		res.redirect(
			`https://idp.bexio.com/authorize?response_type=code&client_id=${process.env.BEXIO_CLIENT_ID}&client_secret=${process.env.BEXIO_SECRET}&redirect_uri=http://localhost:3000/callback&scope=contact_show`
		)
	} else {
		console.log("in contact list")
		res.redirect("/list_contacts")
	}
})

// receive the callback of the bexio login page and get the access token
app.get("/callback", (req, res) => {
	console.log("here", req.query)

	try {
		bexioApi
			.generateAccessToken(req.query)
			.then(() => {
				res.send("success")
			})
			.catch(err => {
				throw err
			})
	} catch (error) {
		console.log(error)
	}
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
 */
