import React from "react"
import { useSelector } from "react-redux"
import { useFirebase, isLoaded, isEmpty } from "react-redux-firebase"
import { Redirect } from "react-router"
import { withRouter } from "react-router-dom"
import Button from "@material-ui/core/Button"
const NavBar = ({ history }) => {
	const firebase = useFirebase()
	const auth = useSelector(state => state.firebase.auth)

	if (isLoaded(auth) && isEmpty(auth)) {
		return <Redirect to="/" />
	} else {
		return (
			<div>
				<Button
					color="primary"
					variant="contained"
					onClick={() => history.push("/home")}
				>
					Home
				</Button>
				<Button
					color="primary"
					variant="contained"
					onClick={() => history.push("/onboarding")}
				>
					Onboarding
				</Button>
				<Button
					color="primary"
					variant="contained"
					onClick={() => firebase.logout()}
				>
					Logout
				</Button>
			</div>
		)
	}
}
export default withRouter(NavBar)
