/* import React from "react"
import { useSelector } from "react-redux"
import { useFirebase, isLoaded, isEmpty } from "react-redux-firebase"
import { Redirect } from "react-router"

// import GoogleButton from 'react-google-button' // optional

function LoginPage() {
	const firebase = useFirebase()
	const auth = useSelector(state => state.firebase.auth)

	function loginWithGoogle() {
		return firebase.login({ provider: "google", type: "popup" })
	}

	return (
		<div>
			<div>
				<h2>Login</h2>
				{!isLoaded(auth) ? (
					<span>Loading...</span>
				) : isEmpty(auth) ? (
					<button onClick={loginWithGoogle}>Login With Google</button>
				) : (
					<Redirect to="/home" />
				)}
			</div>
		</div>
	)
}

export default LoginPage */

import React from "react"
import Avatar from "@material-ui/core/Avatar"
import Button from "@material-ui/core/Button"
import CssBaseline from "@material-ui/core/CssBaseline"
import TextField from "@material-ui/core/TextField"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import Checkbox from "@material-ui/core/Checkbox"
import Link from "@material-ui/core/Link"
import Grid from "@material-ui/core/Grid"
import Box from "@material-ui/core/Box"
import LockOutlinedIcon from "@material-ui/icons/LockOutlined"
import Typography from "@material-ui/core/Typography"
import { makeStyles } from "@material-ui/core/styles"
import Container from "@material-ui/core/Container"
import { useFirebase, isLoaded, isEmpty } from "react-redux-firebase"
import { useSelector } from "react-redux"
import { Redirect } from "react-router-dom"
function Copyright() {
	return (
		<Typography variant="body2" color="textSecondary" align="center">
			{"Copyright © "}
			<Link color="inherit" href="https://material-ui.com/">
				Carlos Moyano
			</Link>{" "}
			{new Date().getFullYear()}
			{"."}
		</Typography>
	)
}

const useStyles = makeStyles(theme => ({
	paper: {
		marginTop: theme.spacing(8),
		display: "flex",
		flexDirection: "column",
		alignItems: "center"
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main
	},
	form: {
		width: "100%", // Fix IE 11 issue.
		marginTop: theme.spacing(1)
	},
	submit: {
		margin: theme.spacing(3, 0, 2)
	}
}))

export default function Login() {
	const classes = useStyles()
	const firebase = useFirebase()
	const auth = useSelector(state => state.firebase.auth)

	function loginWithGoogle() {
		return firebase.login({ provider: "google", type: "popup" })
	}

	if (isLoaded(auth) && isEmpty(auth)) {
		return (
			<Container component="main" maxWidth="xs">
				<CssBaseline />
				<div className={classes.paper}>
					<Avatar className={classes.avatar}>
						<LockOutlinedIcon />
					</Avatar>
					<Typography component="h1" variant="h5">
						Sign in
					</Typography>
					<Typography>
						<Button
							variant="outlined"
							color="primary"
							onClick={loginWithGoogle}
						>
							Login With Google
						</Button>
					</Typography>
				</div>
				<Box mt={8}>
					<Copyright />
				</Box>
			</Container>
		)
	} else {
		return <Redirect to="/home" />
	}
}
