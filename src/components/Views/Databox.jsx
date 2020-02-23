import React from "react"
import { Grid } from "@material-ui/core"
import Iframe from "react-iframe"

function Databox() {
	return (
		<Grid container>
			<Grid item xs={12}>
				<Iframe
					url="https://app.databox.com/datawall/0cc7f99d86bfff12c806201da8be970405e4934b3"
					width="100%"
					height="900"
					id="myId"
					className="myClassname"
					display="initial"
					position="relative"
				/>
			</Grid>
		</Grid>
	)
}

export default Databox
