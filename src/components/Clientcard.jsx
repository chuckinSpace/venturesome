import React, { useEffect } from "react"
import axios from "axios"

import { Link } from "react-router-dom"
import Databox from "./Databox"
import Card from "@material-ui/core/Card"
import Typography from "@material-ui/core/Typography"

const Clientcard = ({ client, contacts }) => {
	// Get todos from redux state

	return (
		<div>
			<Typography style={{ marginTop: 20 }} variant="h5">
				Master Company
			</Typography>
			<Typography>Client Name : {client.name}</Typography>
			<Typography variant="h5">Contacts: </Typography>

			{contacts.map(contact => {
				return (
					<h5 key={contact.id}>
						<Typography>
							Name:
							{!!contact.firstName &&
								`${contact.firstName} ${contact.lastName}`}{" "}
						</Typography>
						<Typography>
							Position: {!!contact.position && contact.position}{" "}
						</Typography>
						<Typography>
							Primary Email: {!!contact.email && contact.email.email}
						</Typography>
						<Typography>
							Birthday: {!!contact.birthday && contact.birthday}
						</Typography>
						<Typography>
							Mobile:
							{!!contact.mobilePhone && contact.mobilePhone.number}
						</Typography>
					</h5>
				)
			})}
		</div>
	)
}

export default Clientcard

/* 	useEffect(() => {
		const callServer = async () => {
			await axios
				.post("http://localhost:9000/clockIn", {
					description: `Working on client TEST`,
					pid: 157340331
				})
				.then(res => console.log(res.data))
				.catch(err => console.error(err))
		} 

		if (isLoaded(clientQuery)) {
			if (clientQuery[0].idNumber === "112") {
				console.log("in call server", clientQuery[0].idNumber)
				callServer()
			}
		}
	}, [clientQuery])*/
