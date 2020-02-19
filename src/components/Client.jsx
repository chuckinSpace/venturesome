import React, { useEffect } from "react"
import axios from "axios"
import { useSelector } from "react-redux"
import { useFirestoreConnect, isLoaded, isEmpty } from "react-redux-firebase"
import { Link } from "react-router-dom"
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
		callServer()
	}, [])

	if (!isLoaded(clientQuery) || !isLoaded(contacts)) {
		return <div>Loading...</div>
	} else {
		console.log(clientQuery[0])
		const client = clientQuery[0]
		return (
			<div>
				<h1>Client View</h1>
				<div>Number: {client.idNumber}</div>
				<div>Client Name : {client.name}</div>
				<div>
					<h3>Contacts: </h3>
					{contacts.map(contact => {
						return (
							<h5 key={contact.id}>
								<div>
									Name:{" "}
									{!!contact.firstName &&
										`${contact.firstName} ${contact.lastName}`}{" "}
								</div>
								<div>Position: {!!contact.position && contact.position} </div>
								<div>
									Primary Email: {!!contact.email && contact.email.email}
								</div>
								<div>Birthday: {!!contact.birthday && contact.birthday}</div>
							</h5>
						)
					})}
				</div>
			</div>
		)
	}
}

export default Client
