import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useFirestoreConnect, isLoaded, isEmpty } from "react-redux-firebase"
import { Link } from "react-router-dom"
import axios from "axios"
const Onboarding = () => {
	// Get todos from redux state
	const [server, setServer] = useState()
	useEffect(() => {
		const callServer = async () => {
			await axios
				.get("http://localhost:9000/")
				.then(res => setServer(res.data))
				.catch(err => console.error(err))
		}
		callServer()
	}, [])

	const handleToggl = async () => {
		await axios
			.post("http://localhost:9000/", {
				clientName: "testClient",
				clientNumber: "002"
			})
			.then(res => console.log(res))
			.catch(err => console.error(err))
	}

	return (
		<div>
			<div>Server Connection : {server}</div>
			<h1>Onboarding</h1>
			<button onClick={() => handleToggl()}>Create Toggl</button>
		</div>
	)
}

export default Onboarding
