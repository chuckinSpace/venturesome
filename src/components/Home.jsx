import React from "react"
import { useSelector } from "react-redux"
import { useFirestoreConnect, isLoaded, isEmpty } from "react-redux-firebase"
import { Link } from "react-router-dom"
const Home = () => {
	useFirestoreConnect([
		{ collection: "clients", orderBy: ["idNumber", "desc"] }
	])
	// Get todos from redux state
	const clients = useSelector(state => state.firestore.ordered.clients)
	if (!isLoaded(clients)) {
		return <div>Loading...</div>
	}
	if (isEmpty(clients)) {
		return <div>Todos List Is Empty</div>
	}
	const clientCell = clients.map(client =>
		console.log(client)
		/*  <li key={client.id}>
			
            <Link to={`client/${client.id}`}>
				{client.idNumber} {client.name} {client.email}
			</Link>
		</li> */
	)
	return (
		<div>
			<h1>Dashboard</h1>
			<div>Total Clients : {clients.length}</div>
			<ul>{clientCell}</ul>
		</div>
	)
}

export default Home
