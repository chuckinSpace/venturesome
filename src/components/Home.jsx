import React, { useEffect } from "react"
import { useSelector } from "react-redux"
import { useFirestoreConnect, isLoaded, isEmpty } from "react-redux-firebase"
import { Link } from "react-router-dom"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import Paper from "@material-ui/core/Paper"

const Home = ({ history }) => {
	useFirestoreConnect([
		{ collection: "clients", orderBy: ["idNumber", "desc"] }
	])
	// Get todos from redux state
	const clients = useSelector(state => state.firestore.ordered.clients)

	if (!isLoaded(clients)) {
		return <div>Loading...</div>
	} else {
		/* const clientCell = clients.map(client => {
			return (
				<List key={client.id}>
					<ListItem>
						<Link
							to={`clients/${client.idNumber}`}
							style={{ textDecoration: "none" }}
						>
							{client.idNumber} {client.name}
						</Link>
					</ListItem>
				</List>
			) 
		})*/

		return (
			/* <div>
				<h1>Dashboard</h1>
				<div>Total Clients : {clients.length}</div>
				<ul>{clientCell}</ul>
			</div> */
			<TableContainer component={Paper}>
				<Table aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell> Number </TableCell>
							<TableCell>Client Name (January 2020)</TableCell>
							<TableCell align="right">
								Interactions (slack,email,phone)
							</TableCell>
							<TableCell align="right">Time Invested (toggle)</TableCell>
							<TableCell align="right">Leads (DataBox) </TableCell>
							<TableCell align="right">Ad performance (DataBox)</TableCell>
							<TableCell align="right">Payment Status (stripe)</TableCell>
							<TableCell align="right">Client Since </TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{clients.map(client => (
							<TableRow
								onClick={() => history.push(`clients/${client.idNumber}`)}
								key={client.id}
								style={{ cursor: "pointer" }}
							>
								<TableCell component="th" scope="client">
									{client.idNumber}
								</TableCell>
								<TableCell component="th" scope="client">
									{client.name}
								</TableCell>
								<TableCell align="right">36%</TableCell>
								<TableCell align="right">21 hrs </TableCell>
								<TableCell align="right">65</TableCell>
								<TableCell align="right">65%</TableCell>
								<TableCell align="right">Late</TableCell>
								<TableCell align="right">2yrs</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		)
	}
}

export default Home
