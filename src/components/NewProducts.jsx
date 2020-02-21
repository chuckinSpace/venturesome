import React from "react"
import { Grid, Typography } from "@material-ui/core"
import ai from "./ai.png"
import box from "./box.png"
import Rating from "react-rating"
function NewProducts() {
	return (
		<Grid container>
			<Grid container alignItems="center">
				<Grid item xs={2}>
					<img src={box} alt="box" width="60" height="60" />
				</Grid>
				<Grid item xs={10}>
					<Typography>You want to improve you revenue?</Typography>
				</Grid>
			</Grid>

			<Grid container alignItems="center">
				<Grid item xs={2}>
					<img src={ai} alt="box" width="60" height="60" />
				</Grid>
				<Grid item xs={10}>
					<Typography>Try our new AI algorithm</Typography>
				</Grid>
			</Grid>
			<Grid
				container
				alignItems="center"
				justify="center"
				alignContent="center"
			>
				<Grid
					item
					container
					alignItems="center"
					justify="center"
					alignContent="center"
					xs={12}
				>
					<Typography>Rate our company</Typography>
				</Grid>
				<Grid
					item
					xs={12}
					container
					alignItems="center"
					justify="center"
					alignContent="center"
				>
					<Rating
						emptySymbol="fa fa-star-o fa-2x"
						fullSymbol="fa fa-star fa-2x"
					/>
				</Grid>
			</Grid>
		</Grid>
	)
}

export default NewProducts
