import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import Divider from "@material-ui/core/Divider"
import ListItemText from "@material-ui/core/ListItemText"
import ListItemAvatar from "@material-ui/core/ListItemAvatar"
import Avatar from "@material-ui/core/Avatar"
import Typography from "@material-ui/core/Typography"
import Checkbox from "@material-ui/core/Checkbox"
import Rating from "react-rating"
import { Grid } from "@material-ui/core"
const useStyles = makeStyles(theme => ({
	root: {
		width: "100%",
		maxWidth: 360,
		backgroundColor: theme.palette.background.paper
	},
	inline: {
		display: "inline"
	}
}))

const NotificationList = ({ sm }) => {
	const classes = useStyles()

	return (
		<List className={classes.root}>
			<ListItem alignItems="flex-start">
				<ListItemAvatar>
					<Avatar alt={sm.name} src={sm.photo} />
				</ListItemAvatar>
				<ListItemText
					primary="Missing Information"
					secondary={
						<React.Fragment>
							<Typography
								component="span"
								variant="body2"
								className={classes.inline}
								color="textPrimary"
							>
								{sm.name}
							</Typography>
							{
								" —Please send us the signed contract, use the Contact Us button"
							}
						</React.Fragment>
					}
				/>
			</ListItem>
			<Divider variant="inset" component="li" />
			<ListItem alignItems="flex-start">
				<ListItemAvatar>
					<Avatar alt={sm.name} src={sm.photo} />
				</ListItemAvatar>
				<ListItemText
					primary="Goal achieved!"
					secondary={
						<React.Fragment>
							<Typography
								component="span"
								variant="body2"
								className={classes.inline}
								color="textPrimary"
							>
								{sm.name}
							</Typography>
							{" — Congrats we achieved our goal of 100 closed leads!"}
						</React.Fragment>
					}
				/>
			</ListItem>
			<Divider variant="inset" component="li" />
			<ListItem alignItems="flex-start">
				<ListItemAvatar>
					<Avatar alt={sm.name} src={sm.photo} />
				</ListItemAvatar>
				<ListItemText
					primary="Welcome to our Team"
					secondary={
						<React.Fragment>
							<Typography
								component="span"
								variant="body2"
								className={classes.inline}
								color="textPrimary"
							>
								{sm.name}
							</Typography>
							{" — Thank you for joining our family! great things are coming"}
						</React.Fragment>
					}
				/>
			</ListItem>
		</List>
	)
}
export default NotificationList
