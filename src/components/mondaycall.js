import axios from "axios"

const token = process.env.REACT_APP_MONDAY_TOKEN

const postMonday = (body, action) => {
	return axios
		.post(`https://api.monday.com/v2`, body, {
			headers: {
				Authorization: token
			}
		})

		.then(res => {
			console.log(`sucess ${action}`, res.data)
			return res.data
		})
		.catch(err => {
			console.log(`error ${action}`, err)
		})
}

export const mondayCall = async () => {
	const body = {
		query: ` query {
            boards(ids: 215370890) {
                groups (ids:"new_group") {
                  title
                  id
                  items(limit: 120) {
                    id
                    name
                    column_values {
                      id
                      title
                      value
                    }
                  }
                }
              }
            }`
	}
	const response = await postMonday(body, "getting leads")
	return response.data.boards[0].groups[0].items
}
export const getPmMondayInfo = async pmId => {
	const body = {
		query: `
			query {
				users (ids: ${pmId}) {
					name
					phone
					photo_original
					mobile_phone
					email
				title
					 }
				}`
	}
	const response = await postMonday(body, `getting Sm info`)
	const pmInfo = response.data.users[0]

	const pmInfoObj = {
		name: pmInfo.name,
		//phone contains the gender String
		phone: pmInfo.phone,
		photo: pmInfo.photo_original,
		mobile: pmInfo.mobile_phone,
		email: pmInfo.email,
		title: pmInfo.title
	}
	return pmInfoObj
}
