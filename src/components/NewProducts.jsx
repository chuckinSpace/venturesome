import React from "react"
import {
	Grid,
	Typography,
	Card,
	List,
	ListItem,
	ListItemText
} from "@material-ui/core"
import ai from "./ai.png"
import box from "./box.png"
import sales from "./rebaja.png"
import idea from "./idea.svg"
import Rating from "react-rating"
function NewProducts() {
	return (
		<Grid container style={{ marginLeft: 10, marginTop: 5 }}>
			<Grid container>
				<Grid item xs={2} style={{ padding: 12 }}>
					<img src={idea} alt="box" width="60" height="60" />
				</Grid>
				<Grid item xs={10}>
					<Typography variant="h5" style={{ marginTop: 20 }}>
						NEW FEATURES!
					</Typography>
				</Grid>
			</Grid>

			<List>
				<Grid container alignItems="center">
					<ListItem divider>
						<Grid item xs={2}>
							<img src={sales} alt="box" width="60" height="60" />
						</Grid>

						<Grid item xs={10}>
							<ListItemText>
								Don't miss a sale! Let you customer know when they left
								something on their shopping cart via facebook messenger
							</ListItemText>
						</Grid>
					</ListItem>
				</Grid>
				<ListItem divider>
					<Grid container alignItems="center">
						<Grid item xs={2}>
							<img src={box} alt="box" width="60" height="60" />
						</Grid>
						<Grid item xs={10}>
							<Typography>You want to improve you revenue?</Typography>
						</Grid>
					</Grid>
				</ListItem>

				<ListItem divider>
					<Grid container alignItems="center">
						<Grid item xs={2}>
							<img src={ai} alt="box" width="60" height="60" />
						</Grid>
						<Grid item xs={10}>
							<Typography>Try our new AI algorithm</Typography>
						</Grid>
					</Grid>
				</ListItem>
			</List>
			<Grid container style={{ marginLeft: 20 }}>
				<Grid
					item
					container
					alignItems="flex-start"
					justify="flex-start"
					alignContent="flex-start"
					xs={12}
					style={{ paddingLeft: 20 }}
				>
					<Typography>Rate our company</Typography>
				</Grid>
				<Grid
					item
					xs={12}
					container
					alignItems="flex-start"
					justify="flex-start"
					alignContent="flex-start"
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
