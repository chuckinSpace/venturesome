import React from "react"
import { ViewState } from "@devexpress/dx-react-scheduler"
import {
	Scheduler,
	DayView,
	WeekView,
	Appointments,
	Toolbar,
	ViewSwitcher,
	MonthView
} from "@devexpress/dx-react-scheduler-material-ui"
import Paper from "@material-ui/core/Paper"
import { Typography } from "@material-ui/core"
function Calendar() {
	return (
		<Paper>
			<Typography variant="h4" style={{ marginLeft: 10 }}>
				Next meeting with us
			</Typography>
			<Scheduler
				data={[
					{
						startDate: "2020-02-21 10:00",
						endDate: "2020-02-21 11:00",
						title: "Meeting"
					},
					{
						startDate: "2018-11-01 18:00",
						endDate: "2018-11-01 19:30",
						title: "Go to a gym"
					}
				]}
				height={400}
			>
				<ViewState
					defaultCurrentDate={new Date()}
					defaultCurrentViewName="Week"
				/>

				<DayView startDayHour={9} endDayHour={18} />
				<WeekView startDayHour={10} endDayHour={19} />
				<MonthView />
				<Toolbar />
				<ViewSwitcher />
				<Appointments />
			</Scheduler>
		</Paper>
	)
}

export default Calendar
