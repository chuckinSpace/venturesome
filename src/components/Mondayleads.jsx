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
import working from "./working.png"
function Mondayleads({ history, client }) {
	const [leads, setLeads] = useState([])
	const [total, setTotal] = useState(0)
	const [loading, setLoading] = useState(false)
	const [win, setWin] = useState(0)
	const [lost, setLost] = useState(0)
	const [progress, setProgress] = useState(0)
	const [guarantee, setGuarantee] = useState(30)

	useEffect(() => {
		const callMonday = async () => {
			setLoading(true)
			try {
				const response = await mondayCall()
				console.log(response)
				setLoading(false)

				setLeads(response)
				setTotal(response.length)
			} catch (error) {
				console.log(error)
			}
		}
		callMonday()
	}, [])

	const handleWin = id => {
		setWin(prevState => prevState + 1)
		setProgress(parseInt((win / guarantee) * 100))
		setLeads(leads.filter(lead => lead.id !== id))
	}
	const handleLost = id => {
		setLost(prevState => prevState + 1)

		setLeads(leads.filter(lead => lead.id !== id))
	}
	const leadmap =
		leads.length === 0 ? (
			<Grid
				container
				alignContent="center"
				alignItems="center"
				justify="center"
			>
				<Grid container>
					<Grid
						item
						xs={12}
						container
						alignContent="center"
						alignItems="center"
						justify="center"
						style={{ marginTop: 40 }}
					>
						<Typography variant="h5">
							Nothing Else to update here, check the Leads Archive for old
							leads...
						</Typography>
					</Grid>
				</Grid>
				<Grid
					container
					alignContent="center"
					alignItems="center"
					justify="center"
				>
					<Grid
						item
						xs={12}
						container
						alignContent="center"
						alignItems="center"
						justify="center"
					>
						<img src={working} alt="brain" width="200" height="200" />
					</Grid>
					<Typography>
						Our artificial minions are working hard to get you some more leads..
					</Typography>
				</Grid>
			</Grid>
		) : (
			leads.map(lead => (
				<Grid key={lead.id} item xs={3}>
					<Card style={{ height: 220 }}>
						<CardContent>
							<Typography noWrap color="textSecondary" gutterBottom>
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
								<Button
									variant="outlined"
									color="primary"
									size="small"
									onClick={() => handleWin(lead.id)}
								>
									Aquired
								</Button>
								<Button
									variant="outlined"
									color="secondary"
									size="small"
									onClick={() => handleLost(lead.id)}
								>
									Lost
								</Button>
							</Grid>
						</CardActions>
					</Card>
				</Grid>
			))
		)

	if (loading) {
		return <Typography>Loading...</Typography>
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
						<Typography variant="h4">LEADS</Typography>
					</Grid>
					<Grid
						item
						container
						justify="flex-end"
						xs={6}
						style={{ marginBottom: 10 }}
					>
						<Button
							variant="outlined"
							color="primary"
							onClick={() =>
								history.push(`/clients/${client.idNumber}/archives`)
							}
						>
							Leads Archive
						</Button>
					</Grid>
				</Grid>
				<Card style={{ minHeight: 350, maxHeight: 350 }}>
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
				<CardActions>
					<Grid
						container
						justify="center"
						alignItems="center"
						alignContent="center"
						spacing={1}
						style={{ marginLeft: 0.5, marginRight: 0.5, marginTop: 10 }}
					>
						<Grid item xs={3}>
							<Typography>Total Leads: {total} </Typography>
						</Grid>
						<Grid item xs={3}>
							<Typography>Left To Update : {leads.length} </Typography>
						</Grid>
						<Grid item xs={2}>
							<Typography>Won: {win} </Typography>
						</Grid>
						<Grid item xs={1}>
							<Typography>Lost: {lost} </Typography>
						</Grid>
						<Grid
							item
							xs={4}
							container
							justify="flex-end"
							alignItems="flex-end"
							alignContent="flex-end"
						>
							<Typography>
								Your Guarantee amount of Leads is {guarantee}!
							</Typography>
						</Grid>
						<Grid
							item
							xs={2}
							container
							justify="center"
							alignItems="center"
							alignContent="center"
						>
							<Progress type="circle" width={80} percent={progress} />
						</Grid>
					</Grid>
				</CardActions>
			</Card>
		)
	}
}

export default Mondayleads
