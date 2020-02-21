import React from "react"
import Iframe from "react-iframe"
import Grid from "@material-ui/core/Grid"
const Databox = () => {
	return (
		<Grid item>
			<Iframe
				url="https://app.databox.com/datawall/cb01a1e471342f0ff2f7c359367693eb05a9fdda8?i"
				width="100%"
				height="400px"
				id="myId"
				className="myClassname"
				display="initial"
				position="relative"
			/>
		</Grid>
	)
}

export default Databox
