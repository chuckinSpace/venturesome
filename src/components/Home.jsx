import React, { useEffect } from "react"
import { useSelector } from "react-redux"
import { useFirestoreConnect, isLoaded, isEmpty } from "react-redux-firebase"
import { Link } from "react-router-dom"
import axios from "axios"
const Home = () => {
	useFirestoreConnect([
		{ collection: "clients", orderBy: ["idNumber", "desc"] }
	])
	// Get todos from redux state
	const clients = useSelector(state => state.firestore.ordered.clients)

	if (!isLoaded(clients)) {
		return <div>Loading...</div>
	} else {
		const clientCell = clients.map(client => {
			return (
				<li key={client.id}>
					<Link to={`clients/${client.idNumber}`}>
						{client.idNumber} {client.name}
					</Link>
				</li>
			)
		})

		return (
			<div>
				<h1>Dashboard</h1>
				<div>Total Clients : {clients.length}</div>
				<ul>{clientCell}</ul>
			</div>
		)
	}
}

export default Home
