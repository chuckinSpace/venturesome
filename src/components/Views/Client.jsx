import React from "react"
import { useSelector } from "react-redux"
import { useFirestoreConnect, isLoaded, isEmpty } from "react-redux-firebase"
import Clientcard from "../Clientcard"
import Databox from "../Databox"
import Grid from "@material-ui/core/Grid"
import Card from "@material-ui/core/Card"
import Mondayleads from "../Mondayleads"
import Rating from "react-rating"
import { Typography } from "@material-ui/core"
function Client({ match, history }) {
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
		console.log(clientQuery[0])
		return (
			<Grid container spacing={3}>
				<Grid container>
					<Grid item xs={3}>
						<Clientcard client={clientQuery[0]} contacts={contacts} />
					</Grid>
					<Grid item xs={3}>
						<Grid container>
							<Card>
								<Databox client={clientQuery[0]} history={history} />
							</Card>
						</Grid>
					</Grid>
					<Grid item xs={6}>
						<Mondayleads />
					</Grid>
				</Grid>
				<Grid container>
					<Grid
						container
						justify="center"
						alignItems="center"
						alignContent="center"
					>
						<Grid item xs={12}>
							<Typography>Rate our company</Typography>
							<Rating
								emptySymbol="fa fa-star-o fa-2x"
								fullSymbol="fa fa-star fa-2x"
							/>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		)
	}
}

export default Client
