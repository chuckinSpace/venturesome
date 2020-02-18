import React from "react"
import { useSelector } from "react-redux"
import { useFirebase, isLoaded, isEmpty } from "react-redux-firebase"
import { Redirect } from "react-router"
const NavBar = () => {
	const firebase = useFirebase()
	const auth = useSelector(state => state.firebase.auth)

	if (isLoaded(auth) && isEmpty(auth)) {
		return <Redirect to="/" />
	} else {
		return <button onClick={() => firebase.logout()}>Logout</button>
	}
}
export default NavBar
