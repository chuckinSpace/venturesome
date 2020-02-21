import React from "react"
import { useSelector } from "react-redux"
import { useFirebase, isLoaded, isEmpty } from "react-redux-firebase"
import { Redirect } from "react-router"
import { withRouter } from "react-router-dom"
import Button from "@material-ui/core/Button"
import { Grid } from "@material-ui/core"
import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
const NavBar = ({ history }) => {
	const firebase = useFirebase()
	const auth = useSelector(state => state.firebase.auth)

	if (isLoaded(auth) && isEmpty(auth)) {
		return <Redirect to="/" />
	} else {
		return (
			<div style={{ flexGrow: 1, marginBottom: 20 }}>
				<AppBar position="static">
					<Toolbar style={{ flexGrow: 1 }}>
						<Button
							color="secundary"
							variant="contained"
							onClick={() => history.push("/home")}
						>
							Home
						</Button>
						<Button
							color="secundary"
							variant="contained"
							onClick={() => history.push("/onboarding")}
						>
							Onboarding
						</Button>
						<Button
							color="secundary"
							variant="contained"
							onClick={() => firebase.logout()}
						>
							Logout
						</Button>
					</Toolbar>
				</AppBar>
			</div>
		)
	}
}
export default withRouter(NavBar)
