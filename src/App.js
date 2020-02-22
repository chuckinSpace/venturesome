import React from "react"
import "./App.css"
import Grid from "@material-ui/core/Grid"
import SignUp from "./Auth/SignUp"
import Home from "./components/Home"
import Login from "./Auth/Login"
import {
	BrowserRouter as Router,
	Route,
	Switch,
	Redirect
} from "react-router-dom"
import NavBar from "./components/NavBar"
import Client from "./components/Views/Client"
import Onboarding from "./components/Onboarding"
import Databox from "./components/Views/Databox"
import Archives from "./components/Archives"
require("dotenv").config()
function App() {
	return (
		<Router>
			<Grid container>
				<NavBar />
				<Switch>
					<Route exact path="/createUser" component={SignUp} />
					<Route exact path="/login" component={Login} />
					<Route exact path="/home" component={Home} />
					<Route exact path="/clients/:id" component={Client} />
					<Route exact path="/onboarding" component={Onboarding} />
					<Route exact path="/clients/:id/archives" component={Archives} />
					<Route exact path="/clients/:id/databox" component={Databox} />
					<Redirect strict from="/" to="/login" />
				</Switch>
			</Grid>
		</Router>
	)
}

export default App
