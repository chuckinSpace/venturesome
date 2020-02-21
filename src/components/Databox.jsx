import React from "react"
import Iframe from "react-iframe"
import Grid from "@material-ui/core/Grid"
import { Button, Typography } from "@material-ui/core"
const Databox = ({ history, client }) => {
	const handleReport = () => {
		history.push(`/clients/${client.idNumber}/databox`)
	}
	return (
		<Grid container style={{ marginLeft: 20 }}>
			<Grid item xs={8}>
				<Typography variant="h4">Ads Report</Typography>
			</Grid>
			<Grid item xs={4} container justify="center">
				<Button
					variant="outlined"
					color="primary"
					onClick={() => handleReport()}
				>
					Full Report
				</Button>
			</Grid>
			<Grid item xs={12}>
				<Iframe
					url="https://app.databox.com/datawall/0cc7f99d86bfff12c806201da8be970405e4934b3"
					width="440"
					height="480"
					id="myId"
					className="myClassname"
					display="initial"
					position="relative"
					style={{ marginLeft: 20 }}
					allowFullScreen
				/>
			</Grid>
		</Grid>
	)
}

export default Databox
