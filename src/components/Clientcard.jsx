import React, { useEffect, useState } from "react"

import Card from "@material-ui/core/Card"
import Typography from "@material-ui/core/Typography"
import { getPmMondayInfo } from "./mondaycall"
import Avatar from "@material-ui/core/Avatar"
import { Grid } from "@material-ui/core"

const Clientcard = ({ client, contacts }) => {
	const [sm, setSm] = useState("")
	const [loading, setLoading] = useState(false)
	useEffect(() => {
		const getPm = async () => {
			setLoading(true)
			const pmInfo = await getPmMondayInfo(client.smId)
			setSm(pmInfo)
			setLoading(false)
		}

		getPm()
	}, [])

	if (!loading) {
		console.log(sm)
		return (
			<Card style={{ height: "100%", textAlign: "center" }}>
				<Typography style={{ marginTop: 20 }} variant="h5">
					Master Company
				</Typography>
				<Typography>Client Name : {client.name}</Typography>

				<Typography variant="subtitle1" style={{ marginTop: 5 }}>
					Project Manager: {sm.name}
				</Typography>

				<Grid
					item
					container
					justify="center"
					alignContent="center"
					alignItems="center"
				>
					<Avatar
						style={{ width: 200, height: 200, marginTop: 30 }}
						alt={sm.name}
						src={sm.photo}
					/>
				</Grid>
				<Typography variant="subtitle1" style={{ marginTop: 5 }}>
					Phone Number: {sm.mobile}
				</Typography>
				<Typography variant="subtitle1" style={{ marginTop: 5 }}>
					Email: {sm.email}
				</Typography>
			</Card>
		)
	} else {
		return <Typography>Loading...</Typography>
	}
}

export default Clientcard

/* 	useEffect(() => {
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
	}, [clientQuery])*/
