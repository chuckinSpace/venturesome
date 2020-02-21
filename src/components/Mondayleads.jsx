import React, { useEffect, useState } from "react"
import { mondayCall } from "./mondaycall"
import Card from "@material-ui/core/Card"
import Grid from "@material-ui/core/Grid"
import CardActions from "@material-ui/core/CardActions"
import CardContent from "@material-ui/core/CardContent"
import Button from "@material-ui/core/Button"
import { Typography } from "@material-ui/core"
import { Progress } from "react-sweet-progress"
import "react-sweet-progress/lib/style.css"

function Mondayleads({ history, client }) {
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
				<CardActions>
					<Grid container justify="space-between">
						<Button variant="outlined" color="primary" size="small">
							Aquired
						</Button>
						<Button variant="outlined" color="secondary" size="small">
							Lost
						</Button>
					</Grid>
				</CardActions>
			</Card>
		</Grid>
	))

	if (loading) {
		return <h1>Loading...</h1>
	} else {
		return (
			<Card
				style={{
					minHeight: 525,
					paddingLeft: 10,
					paddingRight: 10
				}}
			>
				<Grid container>
					<Grid item xs={6}>
						<Typography variant="h4">Leads</Typography>
					</Grid>
					<Grid item container justify="flex-end" xs={6}>
						<Button variant="outlined" color="primary">
							Leads Archive
						</Button>
					</Grid>
				</Grid>
				<Card>
					<Grid
						style={{
							maxHeight: 350,
							overflow: "auto",
							marginBottom: 10
						}}
						container
					>
						{leadmap}
					</Grid>
				</Card>
				<Grid
					container
					justify="center"
					alignItems="center"
					alignContent="center"
					spacing={1}
					style={{ marginLeft: 0.5, marginRight: 0.5, marginTop: 10 }}
				>
					<Grid item xs={3}>
						<Typography>Amount of Leads: {leadmap.length} </Typography>
					</Grid>
					<Grid item xs={2}>
						<Typography>Won: 20 </Typography>
					</Grid>
					<Grid item xs={1}>
						<Typography>Lost: 5 </Typography>
					</Grid>
					<Grid
						item
						xs={4}
						container
						justify="flex-end"
						alignItems="flex-end"
						alignContent="flex-end"
					>
						<Typography>Your Guarantee amount of Leads!</Typography>
					</Grid>
					<Grid
						item
						xs={2}
						container
						justify="center"
						alignItems="center"
						alignContent="center"
					>
						<Progress type="circle" width={80} percent={70} />
					</Grid>
				</Grid>
			</Card>
		)
	}
}

export default Mondayleads
