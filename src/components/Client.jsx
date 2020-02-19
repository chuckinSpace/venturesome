import React, { useEffect } from "react"
import axios from "axios"
import { useSelector } from "react-redux"
import { useFirestoreConnect, isLoaded, isEmpty } from "react-redux-firebase"
import { Link } from "react-router-dom"
import Card from "@material-ui/core/Card"
import Typography from "@material-ui/core/Typography"
const Client = ({ match }) => {
	const clientId = match.params.id
	useFirestoreConnect([
		{
			collection: "clients",
			where: ["idNumber", "==", clientId],
			storeAs: "client"
		},
		{
			collection: "contacts",
			where: ["clientId", "==", clientId],
			storeAs: "contacts"
		}
	])

	// Get todos from redux state
	const clientQuery = useSelector(state => state.firestore.ordered.client)
	const contacts = useSelector(state => state.firestore.ordered.contacts)
	useEffect(() => {
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
	}, [clientQuery])

	if (!isLoaded(clientQuery) || !isLoaded(contacts)) {
		return <div>Loading...</div>
	} else {
		const client = clientQuery[0]
		return (
			<Card
				style={{
					width: "30%",
					margin: "auto",
					marginTop: "10%"
				}}
			>
				<Typography variant="h5">Client View</Typography>
				<Typography>Number: {client.idNumber}</Typography>
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
			</Card>
		)
	}
}

export default Client
