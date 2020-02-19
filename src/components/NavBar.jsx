import React from "react"
import { useSelector } from "react-redux"
import { useFirebase, isLoaded, isEmpty } from "react-redux-firebase"
import { Redirect } from "react-router"
import { withRouter } from "react-router-dom"
const NavBar = ({ history }) => {
	const firebase = useFirebase()
	const auth = useSelector(state => state.firebase.auth)

	const handleHome = () => {}

	if (isLoaded(auth) && isEmpty(auth)) {
		return <Redirect to="/" />
	} else {
		return (
			<div>
				<button onClick={() => history.push("/home")}>Home</button>
				<button onClick={() => history.push("/onboarding")}>Onboarding</button>
				<button onClick={() => firebase.logout()}>Logout</button>
			</div>
		)
	}
}
export default withRouter(NavBar)
