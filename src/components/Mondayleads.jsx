import React, { useEffect, useState } from "react"
import { mondayCall } from "./mondaycall"
import Card from "@material-ui/core/Card"
import Grid from "@material-ui/core/Grid"
import CardActions from "@material-ui/core/CardActions"
import CardContent from "@material-ui/core/CardContent"
import Button from "@material-ui/core/Button"
import { Typography } from "@material-ui/core"
function Mondayleads() {
	const [leads, setLeads] = useState([])
	const [loading, setLoading] = useState(false)
	useEffect(() => {
		const callMonday = async () => {
			setLoading(true)
			try {
				const response = await mondayCall()
				console.log(response)
				setLoading(false)
				setLeads(response)
			} catch (error) {
				console.log(error)
			}
		}
		callMonday()
	}, [])

	const leadmap = leads.map(lead => (
		<Grid key={lead.id} item xs={3}>
			<Card>
				<CardContent>
					<Typography color="textSecondary" gutterBottom>
						Name: {lead.name}
					</Typography>
					<Typography color="textSecondary" gutterBottom>
						Location:{lead.column_values[0].value}
					</Typography>
					<Typography color="textSecondary" gutterBottom>
						Email: example@test.com
					</Typography>
				</CardContent>
				<CardActions style={{ alignItems: "center" }}>
					<Button variant="outlined" color="primary" size="small">
						Aquired
					</Button>
					<Button variant="outlined" color="secondary" size="small">
						Lost
					</Button>
				</CardActions>
			</Card>
		</Grid>
	))

	if (loading) {
		return <h1>Loading...</h1>
	} else {
		return (
			<Grid style={{ maxHeight: 200, overflow: "auto" }} container>
				{leadmap}
			</Grid>
		)
	}
}

export default Mondayleads
