import React, { useEffect, useState } from "react"
import Button from "@material-ui/core/Button"
import Typography from "@material-ui/core/Typography"
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
				clientNumber: "003"
			})
			.then(res => console.log(res))
			.catch(err => console.error(err))
	}

	return (
		<div>
			<Typography variant="h6">Server Connection : {server}</Typography>
			<Typography variant="h1">Onboarding</Typography>
			<Button
				color="secondary"
				variant="outlined"
				onClick={() => handleToggl()}
			>
				Create Toggl
			</Button>
		</div>
	)
}

export default Onboarding
