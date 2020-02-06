const Bexio = require("bexio")
require("dotenv").config()

const express = require("express")
const createServer = require("http").createServer

// initialize the object
const bexioApi = new Bexio.default(
	process.env.BEXIO_CLIENT_ID,
	process.env.BEXIO_CLIENT_SECRET,
	"http://127.0.0.1/callback",
	[Bexio.Scopes.CONTACT_SHOW]
)
const url = bexioApi.getAuthUrl()
console.log(url)
