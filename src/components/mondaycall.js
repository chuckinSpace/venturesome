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
	console.log(token)

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
