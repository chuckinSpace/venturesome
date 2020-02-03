/*
TODO: 
     - finished implementation to save data from firbase to monday

    
 BUG: - error when submitting form check cloud funciotns
*/
/* const { GraphQLClient } = require('graphql-request'); */
require("dotenv").config()
const moment = require("moment")
const axios = require("axios")
const util = require("util")
const firebase = require("./firebase")

// const data from MONDAY
const formsDataBoard = 415921614
const SALES_PIPELINE_BOARD_ID = 413267102
//Video Project Overview
const VIDEO_PROJECTS_OVERVIEW_BOARD_ID = 403775339
const GROUP_ID_P_OVER_CURR_VIDEO_PROJ = "duplicate_of_043___bruno_s_bes10603"
//Project Overview
const P_OVER_INBOX_GROUP_ID = "neue_gruppe"
const PROJECT_OVERVIEW_ID = 162013046
const WITH_US_SINCE_ID = "geschenksdatum"
// contant id in sales pipeline
const CLIENT_ID_ID = "text86"
const STATUS_ID_SALES_PIPELINE = "status"
// moneyTree accounts
const MONEY_TREE_ACCOUNTS_BOARD_ID = 416324914
const MONEY_TREE_ACCOUNTS_GROUP_ID = "duplicate_of_043___bruno_s_bes10603"
//client dabtase
const CLIENT_DATABASE_BOARD_ID = 275842142
const postMonday = (body, action) => {
	return axios
		.post(`https://api.monday.com/v2`, body, {
			headers: {
				Authorization: process.env.MONDAY_TOKEN
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

const setMondayClientId = async (boardId, itemId, clientId) => {
	const stringId = clientId.toString()

	const body = {
		query: `
    mutation ($boardId: Int!, $itemId: Int!,$columnId :String!, $value: JSON!, ) {
      change_column_value(
        board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $value) {
        id
      }
    }
    `,
		variables: {
			boardId: boardId,
			itemId: itemId,
			columnId: CLIENT_ID_ID,
			value: JSON.stringify(stringId)
		}
	}

	await postMonday(body, `returning client Id ${stringId}`)
}

const changeMondayStatus = async (cellId, label, itemId) => {
	const onboardingId = 413267102

	const body = {
		query: `
    mutation ($boardId: Int!, $itemId: Int!, $columnValues: JSON!, $columnId :String!) {
      change_column_value(
        board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $columnValues) {
        id
      }
    }
    `,
		variables: {
			boardId: onboardingId,
			itemId: itemId,
			columnValues: JSON.stringify({ label: label }),
			columnId: cellId
		}
	}

	await postMonday(body, `changing monday status to ${label}`)
}

const getLink = async itemId => {
	const body = {
		query: `query {
     boards (ids:${formsDataBoard}) {
     items (ids:${itemId}) {
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
    `
	}
	try {
		const response = await postMonday(body, "getLink")
		return response.data.boards[0].items[0].column_values[0].value
			.toString()
			.replace(/['"]+/g, "")
	} catch (err) {
		return console.log(err)
	}
}

const getPmInfo = async pmId => {
	// get name too
	const body = {
		query: ` {
      users(ids: [${pmId}] ) {
        email
        name
      }
    }
      `
	}
	try {
		const response = await postMonday(body, `get PM info ID:${pmId}`)
		return response.data.users[0]
	} catch (error) {
		console.log(error)
	}
}

const getValuesFromMonday = async (boardId, itemId) => {
	let mondayObj = {
		email: "",
		clientName: "",
		phone: "",
		companyAssigned: "",
		projectName: "",
		pmId: "",
		itemId: "",
		formLink: "",
		pmEmail: "",
		pmName: "",
		slackUsers: [],
		isNewClient: true,
		clientId: "",
		smId: ""
	}

	//Create query to send to Monday.com's API
	const body = {
		query: ` query {
          boards (ids:${boardId}) {
            items (ids:${itemId}) {
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
          `
	}
	try {
		const response = await postMonday(body, "getValuesFromMonday")
		const values = await response.data.boards[0].items[0].column_values

		mondayObj.itemId = itemId

		const isNewClientItem = values.find(item => item.id === CLIENT_ID_ID)
		const isNewClient = !!isNewClientItem.value ? false : true
		if (!!isNewClientItem.value) {
			mondayObj.clientId = parseInt(isNewClientItem.value.replace(/['"]+/g, ""))
		}
		mondayObj.isNewClient = isNewClient

		const emailObj = values.find(item => item.id === "email")
		mondayObj.email = JSON.parse(emailObj.value).email

		const clientNameObj = values.find(item => item.id === "text")
		mondayObj.clientName = clientNameObj.value.replace(/['"]+/g, "")

		const phoneObj = values.find(item => item.id === "phone_number")
		mondayObj.phone = JSON.parse(phoneObj.value).phone

		const companyAssignedObj = values.find(item => item.id === "dropdown1")

		//check company assigned, if empty error
		const companyAssignedParse = JSON.parse(companyAssignedObj.value)
		const companyAssigned = companyAssignedParse.ids[0]
		console.log(companyAssigned)
		if (!!companyAssigned && companyAssigned === 1) {
			mondayObj.companyAssigned = "Venturesome"
		} else if (!!companyAssigned && companyAssigned === 2) {
			mondayObj.companyAssigned = "MoneyTree"
		} else {
			throw new Error("missing company Assigned")
		}

		const projectNameObj = values.find(item => item.id === "project_name")
		mondayObj.projectName = projectNameObj.value.replace(/['"]+/g, "")

		const managerObj = values.find(item => item.id === "person")
		if (!!JSON.parse(managerObj.value).personsAndTeams[0]) {
			console.log("asiggning manager id", managerObj)
			mondayObj.pmId = JSON.parse(
				managerObj.value
			).personsAndTeams[0].id.toString()
		} else {
			throw new Error("missing Pm info")
		}

		//SM
		const smObj = values.find(item => item.id === "people7")
		if (!!JSON.parse(smObj.value).personsAndTeams[0]) {
			console.log("asiggning SM id", managerObj)
			mondayObj.smId = JSON.parse(smObj.value).personsAndTeams[0].id.toString()
		} else {
			throw new Error("missing sm info")
		}
		//get slackUsers emails array
		const slackItem = values.find(item => item.id === "people")
		const slackObj = JSON.parse(slackItem.value)
		const slackUsers = slackObj.personsAndTeams
		const slackIds = slackUsers.map(user => user.id)
		console.log(slackIds)
		if (slackIds.length === 0) {
			throw new Error("missing Slack Users")
		} else {
			const getUsers = async () => {
				return Promise.all(slackIds.map(id => getPmInfo(id)))
			}

			let slackEmails = []

			getUsers()
				.then(
					data =>
						(slackEmails = data.map(email => {
							return email.email
						}))
				)
				.then(() => (mondayObj.slackUsers = slackEmails))
				.catch(err => console.log(err))
		}

		//getting itemIdfor the correct Form
		const linkItem = values.find(item => item.id === "link_to_item")
		const linkObj = JSON.parse(linkItem.value)
		console.log(linkObj)
		if (mondayObj.isNewClient) {
			if (!linkObj.linkedPulseIds) {
				throw new Error("missing Form Info")
			} else {
				const formItemId = linkObj.linkedPulseIds[0].linkedPulseId
				mondayObj.formLink = await getLink(formItemId)
			}
		}

		const pmInfo = await getPmInfo(mondayObj.pmId.toString())

		mondayObj.pmEmail = pmInfo.email
		mondayObj.pmName = pmInfo.name

		return mondayObj
	} catch (error) {
		console.log("Error when reading mondayObj", error)
		changeMondayStatus(1, boardId, itemId)
		return 0
	}
}

const getResult = async (boardId, itemId) => {
	try {
		console.log("get result ", boardId, itemId)
		return await getValuesFromMonday(boardId, itemId)
	} catch (error) {
		console.log(error)
	}
}

//Update forms from type form functions

const updateForms = async forms => {
	// get current ids for all the forms from form board to avoid duplicates, return an array of strings with ids

	const body = {
		query: `query {
      boards(ids: ${formsDataBoard}) {
        name
        items {
          name
          id
          column_values {
            id
           value
          }
        }
       
      }
    }
      `
	}

	try {
		const response = await postMonday(body, "updateForms")
		//column_value 1 represent form Id column on the board
		const ids = response.data.boards[0].items.map(form =>
			form.column_values[1].value.replace(/['"]+/g, "")
		)

		//filter the forms using ids already on the board, returning only new forms
		forms = forms.filter(item => {
			return !ids.includes(item.id)
		})
	} catch (err) {
		return console.log(err)
	}

	// populate the formsBoard with the forms from typeForm after they were filtered by Id on monday board
	forms.map(async form => {
		const body = {
			query: `
      mutation ($boardId: Int!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
        create_item (
          board_id: $boardId,
          group_id: $groupId,
          item_name: $itemName,
          column_values: $columnValues
        ) {
          id
        }
      }
      `,
			variables: {
				boardId: formsDataBoard,
				groupId: "new_group",
				itemName: form.title,
				columnValues: JSON.stringify({ text: form.link, text4: form.id })
			}
		}

		await postMonday(body, "populating form board")
	})
}

const getSubmissionData = async (boardId, itemId) => {
	const body = {
		query: ` query {
      boards (ids:${boardId}) {
        items (ids:${itemId}) {
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
      `
	}
	const submissionObj = {
		birthday: "",
		email: "",
		slack: false,
		phone: "",
		clientId: 0,
		name: ""
	}

	try {
		const response = await postMonday(body, "getSubmissionData")
		const values = await response.data.boards[0].items[0].column_values
		console.log(values)
		const emailObj = values.find(item => item.id === "email")
		submissionObj.email = JSON.parse(emailObj.value).email

		const contactNameObj = values.find(item => item.id === "text4")
		submissionObj.name = JSON.parse(contactNameObj.value)

		const birthdayObj = values.find(item => item.id === "date4")
		console.log(birthdayObj, typeof birthdayObj)
		submissionObj.birthday = JSON.parse(birthdayObj.value).date

		const slackObj = values.find(item => item.id === "check")
		if (!!slackObj.value) {
			const slackString = JSON.parse(slackObj.value).checked
			if (slackString === "true") {
				submissionObj.slack = true
			}
		} else {
			submissionObj.slack = false
		}

		const phoneObj = values.find(item => item.id === "phone1")
		submissionObj.phone = phoneObj.value.replace(/['"]+/g, "")
		console.log("sucess creating submission obj", submissionObj)

		return submissionObj
	} catch (error) {
		console.log("error when creating submission obj", error)
	}
}

const getBoardByClientId = async clientId => {
	console.log(clientId, typeof clientId)

	const body = {
		query: ` query {
                  boards(ids: ${SALES_PIPELINE_BOARD_ID}) {

                    items{
                      id      
                      name
                      column_values{
                        id
                        value
                      }
                    }
                  }
                }
              
                `
	}
	try {
		const response = await postMonday(body, "get boards")
		const boardItems = await response.data.boards[0].items.map(item => item)
		const boardData = await boardItems.map(item => {
			return {
				id: item.id,
				idCell: item.column_values.find(value => value.id === "text86")
			}
		})
		boardData.map(item => {
			if (item.idCell.value !== null) {
				item.idCell.value = item.idCell.value.replace(/['"]+/g, "")
			}
			return null
		})

		const itemObj = boardData.find(
			item => item.idCell.value === clientId.toString()
		)
		const itemId = itemObj.id

		return { boardId: SALES_PIPELINE_BOARD_ID, itemId: parseInt(itemId) }
	} catch (error) {
		throw new Error(`client Id ${clientId} not found in monday board`, error)
	}
}

const addVideoProjectBoard = async (
	clientNumber,
	year,
	clientProjectNumber,
	clientName,
	projectName,
	pmId,
	tag
) => {
	console.log(
		clientNumber,
		year,
		clientProjectNumber,
		clientName,
		projectName,
		pmId
	)

	const body = {
		query: `
      mutation ($boardId: Int!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
        create_item (
          board_id: $boardId,
          group_id: $groupId,
          item_name: $itemName,
          column_values: $columnValues
        ) {
          id
        }
      }
      `,
		variables: {
			boardId: VIDEO_PROJECTS_OVERVIEW_BOARD_ID,
			groupId: GROUP_ID_P_OVER_CURR_VIDEO_PROJ,
			itemName: `TEST${clientNumber}_${year}_${clientProjectNumber} | ${clientName} | ${projectName}`,
			columnValues: JSON.stringify({
				status: { label: "On it!" },
				person: { personsAndTeams: [{ id: pmId, kind: "person" }] },
				tags: { text: "testTag", tag_ids: [tag] }
			})
		}
	}
	try {
		await postMonday(body, "adding board to Video Project Over")
	} catch (error) {
		throw new Error(
			"error when creating board for Video Project overview",
			error
		)
	}
}

const addProjectOverview = async (
	clientNumber,
	year,
	clientProjectNumber,
	clientName,
	projectName,
	pmId,
	createdAt,
	smId,
	companyAssigned,
	tag
) => {
	let dateTime = moment(createdAt).format("YYYY-MM-DD")
	let giftDate = moment(createdAt)
		.add(3, "M")
		.format("YYYY-MM-DD")

	let columValues = ""
	console.log(
		"bedfore creating project overview",
		clientNumber,
		year,
		clientProjectNumber,
		clientName,
		projectName,
		pmId,
		createdAt,
		smId,
		companyAssigned
	)
	if (companyAssigned === "Venturesome") {
		columValues = JSON.stringify({
			person: { id: pmId },
			datum4: { date: dateTime },
			pm: { id: smId },
			tags: { text: "testTag", tag_ids: [tag] }
		})
	} else if (companyAssigned === "MoneyTree") {
		columValues = JSON.stringify({
			person: { id: pmId },
			datum4: { date: dateTime },
			datum: { date: giftDate },
			pm: { id: smId },
			tags: { text: "testTag", tag_ids: [tag] }
		})
	}

	const body = {
		query: `
      mutation ($boardId: Int!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
        create_item (
          board_id: $boardId,
          group_id: $groupId,
          item_name: $itemName,
          column_values: $columnValues
        ) {
          id
        }
      }
      `,
		variables: {
			boardId: PROJECT_OVERVIEW_ID,
			groupId: P_OVER_INBOX_GROUP_ID,
			itemName: `TEST${clientNumber}_${year}_${clientProjectNumber} | ${clientName} | ${projectName}`,
			columnValues: columValues
		}
	}
	try {
		await postMonday(body, "adding item to Inbox Project Overview")
	} catch (error) {
		throw new Error(
			"error when creating board for Video Project overview",
			error
		)
	}
}

const addMoneyTreeAccount = async (
	clientNumber,
	year,
	clientProjectNumber,
	clientName,
	projectName,
	pmId,
	tag
) => {
	console.log(
		clientNumber,
		year,
		clientProjectNumber,
		clientName,
		projectName,
		pmId
	)

	const body = {
		query: `
      mutation ($boardId: Int!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
        create_item (
          board_id: $boardId,
          group_id: $groupId,
          item_name: $itemName,
          column_values: $columnValues
        ) {
          id
        }
      }
      `,
		variables: {
			boardId: MONEY_TREE_ACCOUNTS_BOARD_ID,
			groupId: MONEY_TREE_ACCOUNTS_GROUP_ID,
			itemName: `TEST${clientNumber}_${year}_${clientProjectNumber} | ${clientName} | ${projectName}`,
			columnValues: JSON.stringify({
				strategie_session: { label: "On it!" },
				person: { personsAndTeams: [{ id: pmId, kind: "person" }] },
				tags: { text: "testTag", tag_ids: [tag] }
			})
		}
	}
	try {
		await postMonday(body, "adding item toMoney Tree account")
	} catch (error) {
		throw new Error("error when creating board for Money Tree Account", error)
	}
}

const saveClientToMondayDatabase = async clientFirebase => {
	console.log(clientFirebase)
	//create group and get back id
	const body = {
		query: `
    mutation ($boardId: Int!, $groupName: String!){
      create_group (board_id: $boardId, group_name: $groupName ) {
        id
      }
    }
    `,
		variables: {
			boardId: CLIENT_DATABASE_BOARD_ID,
			groupName: `TEST${clientFirebase.idNumber} | ${clientFirebase.name}`
		}
	}

	try {
		const obj = await postMonday(body, "saving client to mondaydatabase")
		const newGroupIdid = obj.data.create_group.id

		//query to populate the board
		// id "phone" = {clientFirebase.phone} id: "email" = {clientFirebase.email} id:"due_date" = {birthday}
		const body1 = {
			query: `
      mutation ($boardId: Int!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
        create_item (
          board_id: $boardId,
          group_id: $groupId,
          item_name: $itemName,
          column_values: $columnValues
        ) {
          id
        }
      }
      `,
			variables: {
				boardId: CLIENT_DATABASE_BOARD_ID,
				groupId: newGroupIdid,
				itemName: `${clientFirebase.contactName}`,
				columnValues: JSON.stringify({
					phone: { phone: clientFirebase.phone },
					email: {
						email: clientFirebase.email,
						text: clientFirebase.contactName
					},
					due_date: { date: clientFirebase.birthday },
					client_nr_: clientFirebase.idNumber,
					tags7: { text: "testTag", tag_ids: [clientFirebase.tag] }
				})
			}
		}
		await postMonday(body1, "populating board monday database")
	} catch (error) {
		throw new Error("error when saving client to mondaydatabase", error)
	}
}

const createTag = async (clientName, clientNumber) => {
	const tagText = `#${clientNumber}${clientName.replace(/\s+/g, "")}`
	console.log("tag to create", tagText)
	const body = {
		query: `
		mutation($tagText:String!) {
			create_or_get_tag (tag_name: $tagText) {
				id
			}
		}
    `,
		variables: {
			tagText: tagText
		}
	}
	const response = await postMonday(body, `creating tag ${tagText}`)
	const tagId = response.data.create_or_get_tag.id
	return tagId
}

//function to migrate database from monday to firebase
const databaseMigration = async () => {
	const body = {
		query: ` query {
					boards(ids:446193294) {
						groups {
							title
						items(limit: 120) {
							name
								column_values {
								id
								title
								value
								}
							}
						}
					}
				} 
                `
	}

	try {
		const clientsArray = []
		const result = await postMonday(body, `querying monday database`)
		const clients = result.data.boards[0].groups

		await clients.map(async client => {
			const clientObj = {
				idNumber: "",
				name: "",
				address: "",
				category: "",
				formLink: "",
				mondayItemIdOnboarding: "",
				onboardingCompletedOn: "",
				slack: "",
				slackUsers: "",
				togglClientId: "",
				createdAt: new Date(),
				tag: "",
				contacts: []
			}

			const name = client.title.split(" | ")
			!!name && (clientObj.name = name[1])

			client.items.map(contact => {
				const clientIdObj = contact.column_values.find(
					item => item.id === "client_nr_"
				)
				const clientId =
					!!clientIdObj.value && clientIdObj.value.replace(/['"]+/g, "")
				!!clientId && (clientObj.idNumber = clientId)

				const category = contact.column_values.find(item => item.id === "text1")
				!!category.value &&
					(clientObj.category = category.value.replace(/['"]+/g, ""))

				const oldTag = contact.column_values.find(item => item.id === "tags7")
				!!JSON.parse(oldTag.value) &&
					JSON.parse(oldTag.value).tag_ids.length !== 0 &&
					(clientObj.tag = JSON.parse(oldTag.value).tag_ids[0])
				// creating

				const contactObj = {
					name: "",
					position: "",
					birthday: "",
					email: {
						email: "",
						text: ""
					},
					officePhone: {
						number: "",
						countryShortName: ""
					},
					mobilePhone: {
						number: "",
						countryShortName: ""
					}
				}

				const contactName = contact.name
				!!contactName && (contactObj.name = contactName)

				const positionObj = contact.column_values.find(
					item => item.id === "text17"
				)
				const position =
					!!positionObj.value && positionObj.value.replace(/['"]+/g, "")
				!!position && (contactObj.position = position)

				const officePhoneObj = contact.column_values.find(
					item => item.id === "mobile8"
				)

				const officePhone =
					!!JSON.parse(officePhoneObj.value) &&
					JSON.parse(officePhoneObj.value).phone
				!!officePhone && (contactObj.officePhone.number = officePhone)

				const officePhoneFlag =
					!!JSON.parse(officePhoneObj.value) &&
					JSON.parse(officePhoneObj.value).countryShortName
				!!officePhoneFlag &&
					(contactObj.officePhone.countryShortName = officePhoneFlag)

				const mobilePhoneObj = contact.column_values.find(
					item => item.id === "phone"
				)
				const mobilePhone =
					!!JSON.parse(mobilePhoneObj.value) &&
					JSON.parse(mobilePhoneObj.value).phone
				!!mobilePhone && (contactObj.mobilePhone.number = mobilePhone)

				const mobilePhoneFlag =
					!!JSON.parse(mobilePhoneObj.value) &&
					JSON.parse(mobilePhoneObj.value).countryShortName
				!!mobilePhoneFlag &&
					(contactObj.mobilePhone.countryShortName = mobilePhoneFlag)

				const emailObj = contact.column_values.find(item => item.id === "email")
				const email =
					!!JSON.parse(emailObj.value) && JSON.parse(emailObj.value).email
				!!email && (contactObj.email.email = email)
				!!email && (contactObj.email.text = contactName)

				const addressObj = contact.column_values.find(
					item => item.id === "location"
				)
				const address =
					!!JSON.parse(addressObj.value) && JSON.parse(addressObj.value).address
				!!address && (clientObj.address = address.trim())

				const birthdayObj = contact.column_values.find(
					item => item.id === "due_date"
				)
				const birthday =
					!!JSON.parse(birthdayObj.value) && JSON.parse(birthdayObj.value).date
				!!birthday && (contactObj.birthday = birthday)

				clientObj.contacts.push(contactObj)
				return contactObj
			})
			if (clientObj.tag === "") {
				const tagId = await createTag(clientObj.name, clientObj.idNumber)
				!!tagId && (clientObj.tag = tagId)
			}

			await firebase.createClient(clientObj)
		})
		return clientsArray
	} catch (error) {
		console.log(error)
	}
}

const databaseFirebaseToMonday = async () => {
	// create group
	try {
		const databaseId = 446277111
		const createGroup = async groupTitle => {
			const createGroupQuery = {
				query: `
			mutation($groupTitle:String!) {
				create_group(board_id: ${databaseId}, group_name: $groupTitle) {
				id
				}
			}
			
		`,
				variables: {
					groupTitle: groupTitle
				}
			}
			const response = await postMonday(
				createGroupQuery,
				`creating group ${groupTitle}`
			)
			const groupId = response.data.create_group.id
			return groupId
		}

		const createItem = async (firebaseClient, groupId) => {
			console.log("in create item", firebaseClient, groupId)
			const { idNumber, category, address, tag } = firebaseClient

			const createItemQuery = {
				query: `
		  mutation ($boardId:Int!,$groupId:String!,$itemName:String,$columnValues:JSON!){
			create_item (
			  board_id: $boardId,
			  group_id: $groupId,
			  item_name: $itemName,
			  column_values: $columnValues
			) {
			  id
			}
		  }
		  `,
				variables: {
					boardId: databaseId,
					groupId: groupId,
					itemName: "temp",
					columnValues: JSON.stringify({
						client_nr_: idNumber,
						adresse: address,
						tags7: { text: "testTag", tag_ids: [tag] },
						text1: category
					})
				}
			}

			const response = await postMonday(createItemQuery, `creating item`)
			return parseInt(response.data.create_item.id)
		}

		const createItem2 = async (contact, itemId) => {
			const {
				birthday,
				email,
				mobilePhone,
				officePhone,
				position,
				name
			} = contact

			const createItemQuery2 = {
				query: `
			mutation ($boardId: Int!, $itemId: Int!, $columnValues: JSON!) {
				change_multiple_column_values(
				  board_id: $boardId, 
				  item_id: $itemId, 
				  column_values: $columnValues ) {
				  id
				}
			  }
		  `,
				variables: {
					boardId: databaseId,
					itemId: itemId,
					columnValues: JSON.stringify({
						name: name,
						text17: position,
						mobile8: {
							phone: officePhone.number,
							countryShortName: officePhone.countryShortName
						},
						phone: {
							phone: mobilePhone.number,
							countryShortName: mobilePhone.countryShortName
						},
						email: { email: email.email, text: email.text },
						due_date: { date: birthday }
					})
				}
			}

			const response = await postMonday(createItemQuery2, `creating item 2`)
		}

		const createSecondLevel = async (firebaseClient, groupId) => {
			await firebaseClient.contacts.map(async contact => {
				const itemId = await createItem(firebaseClient, groupId)
				await createItem2(contact, itemId)
			})
		}

		let firebaseClient = ""
		//get Client form firebase
		for (let index = 1; index < 107; index++) {
			let counter = index.toString().padStart(3, "0")
			firebaseClient = await firebase.getClientInfo(counter)
			//create group on monday return group Id
			const groupId = await createGroup(
				`${firebaseClient.idNumber} | ${firebaseClient.name}`
			)

			// create second level insertin contact info on the item created
			await createSecondLevel(firebaseClient, groupId)
		}
	} catch (error) {
		console.log(error)
	}
}

const test = async () => {
	try {
		await databaseFirebaseToMonday()
	} catch (error) {
		console.log(error)
	}
}
/* test() */

module.exports.getResult = getResult
module.exports.updateForms = updateForms
module.exports.getSubmissionData = getSubmissionData
module.exports.changeMondayStatus = changeMondayStatus
module.exports.setMondayClientId = setMondayClientId
module.exports.getBoardByClientId = getBoardByClientId
module.exports.addVideoProjectBoard = addVideoProjectBoard
module.exports.addProjectOverview = addProjectOverview
module.exports.addMoneyTreeAccount = addMoneyTreeAccount
module.exports.saveClientToMondayDatabase = saveClientToMondayDatabase
module.exports.createTag = createTag
