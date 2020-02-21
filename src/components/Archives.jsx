import React, { useEffect, useState } from "react"
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
import { mondayCall } from "./mondaycall"

const Archives = ({ history }) => {
	const [loading, setLoading] = useState(false)
	const [leads, setLeads] = useState(0)

	useEffect(() => {
		const callMonday = async () => {
			setLoading(true)
			try {
				const response = await mondayCall()
				console.log("in archive", response)
				setLeads(response)
				setLoading(false)
			} catch (error) {
				console.log(error)
			}
		}
		callMonday()
	}, [])

	if (loading) {
		return <div>Loading...</div>
	} else {
		return (
			<TableContainer component={Paper}>
				<Table aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell> Leads </TableCell>
							<TableCell>Client Name (January 2020)</TableCell>
							<TableCell align="right">Name</TableCell>
							<TableCell align="right">Email</TableCell>
							<TableCell align="right">Location </TableCell>
							<TableCell align="right">Source</TableCell>
							<TableCell align="right">Date</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{!!leads &&
							leads.map(client => (
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
									<TableCell align="right">{client.name}</TableCell>
									<TableCell align="right">email@test.com </TableCell>
									<TableCell align="right">
										{client.column_values[0].value}
									</TableCell>
									<TableCell align="right">Facebook</TableCell>
									<TableCell align="right">12 Feb 1986</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</TableContainer>
		)
	}
}

export default Archives
