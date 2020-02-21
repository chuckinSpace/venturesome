import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useFirestoreConnect, isLoaded } from "react-redux-firebase"
import Clientcard from "../Clientcard"
import Databox from "../Databox"
import Grid from "@material-ui/core/Grid"
import Mondayleads from "../Mondayleads"

import { Typography } from "@material-ui/core"
import Calendar from "../Calendar"
import NotificationList from "../NotificationList"
import { getPmMondayInfo } from "../mondaycall"
import NewProducts from "../NewProducts"
function Client({ match, history }) {
	const clientId = match.params.id
	const [sm, setSm] = useState("")
	const [loading, setLoading] = useState(false)

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

	useEffect(() => {
		const getPm = async () => {
			if (isLoaded(clientQuery)) {
				setLoading(true)
				const pmInfo = await getPmMondayInfo(clientQuery[0].smId)

				setSm(pmInfo)
				setLoading(false)
			}
		}

		getPm()
	}, [clientQuery])

	if (!isLoaded(clientQuery) || !isLoaded(contacts)) {
		return (
			<Grid
				container
				justify="center"
				alignItems="center"
				alignContent="center"
			>
				<Typography>Loading...</Typography>
			</Grid>
		)
	} else {
		return (
			<Grid container spacing={3}>
				<Grid container>
					<Grid item xs={3}>
						<Clientcard client={clientQuery[0]} sm={sm} />
					</Grid>
					<Grid item xs={6}>
						<Mondayleads history={history} client={clientQuery[0]} />
					</Grid>
					<Grid item xs={3}>
						<Grid container>
							<Databox client={clientQuery[0]} history={history} />
						</Grid>
					</Grid>
				</Grid>
				<Grid container>
					<Grid item xs={3} style={{ paddingTop: 10, paddingLeft: 10 }}>
						<Typography variant="h5">Team Notifications</Typography>
						<NotificationList sm={sm} />
					</Grid>
					<Grid item xs={6} style={{ maxheight: 50, overflow: "auto" }}>
						<Calendar />
					</Grid>

					<Grid item xs={3}>
						<NewProducts />
					</Grid>
				</Grid>
			</Grid>
		)
	}
}

export default Client
