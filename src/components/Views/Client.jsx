import React from "react"
import { useSelector } from "react-redux"
import { useFirestoreConnect, isLoaded, isEmpty } from "react-redux-firebase"
import Clientcard from "../Clientcard"
import Databox from "../Databox"
import Grid from "@material-ui/core/Grid"
import Card from "@material-ui/core/Card"
import Mondayleads from "../Mondayleads"
function Client({ match }) {
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
	const clientQuery = useSelector(state => state.firestore.ordered.client)
	const contacts = useSelector(state => state.firestore.ordered.contacts)

	if (!isLoaded(clientQuery) || !isLoaded(contacts)) {
		return <div>Loading...</div>
	} else {
		return (
			<Grid container spacing={3}>
				<Grid container>
					<Grid item xs={3}>
						<Card
							style={{
								height: "100%",
								textAlign: "center"
							}}
						>
							<Clientcard client={clientQuery[0]} contacts={contacts} />
						</Card>
					</Grid>
					<Grid item xs={9} style={{}}>
						<Databox />
					</Grid>
				</Grid>
				<Grid container>
					<Grid item xs={12} style={{ border: "solid grey" }}>
						<Mondayleads />
					</Grid>
				</Grid>
			</Grid>
		)
	}
}

export default Client
