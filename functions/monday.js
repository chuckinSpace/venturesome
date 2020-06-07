require("dotenv").config();
const moment = require("moment");
const axios = require("axios");
const constants = require("./constants");
const firebase = require("./firebase");

// const data from MONDAY
const formsDataBoard = 415921614;
const SALES_PIPELINE_BOARD_ID = 413267102;
//Video Project Overview
const VIDEO_PROJECTS_OVERVIEW_BOARD_ID = 403775339;
const GROUP_ID_P_OVER_CURR_VIDEO_PROJ = "duplicate_of_043___bruno_s_bes10603";
//Project Overview
const P_OVER_INBOX_GROUP_ID = "neue_gruppe";
const PROJECT_OVERVIEW_ID = 162013046;

// contant id in sales pipeline
const CLIENT_ID_ID = "text86";

// moneyTree accounts
const MONEY_TREE_ACCOUNTS_BOARD_ID = 416324914;
const MONEY_TREE_ACCOUNTS_GROUP_ID = "duplicate_of_043___bruno_s_bes10603";
//client dabtase
const CLIENT_DATABASE_BOARD_ID = 463586872;

// onboardin status  codes

const postMonday = (body, action) => {
  return axios
    .post(`https://api.monday.com/v2`, body, {
      headers: {
        Authorization: process.env.MONDAY_TOKEN,
      },
    })

    .then((res) => {
      console.log(`sucess ${action}`, res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(`error ${action}`, err);
    });
};

const setMondayClientId = async (boardId, itemId, clientId) => {
  const stringId = clientId.toString();

  const body = {
    query: `
    		mutation ($boardId: Int!, $itemId: Int!,$columnId :String!, $value: JSON!, ) {
     			 change_column_value(
						board_id: $boardId, 
						item_id: $itemId, 
						column_id: $columnId, 
						value: $value
						) {
       					   id
     				      }
   				       }
    		`,
    variables: {
      boardId: boardId,
      itemId: itemId,
      columnId: CLIENT_ID_ID,
      value: JSON.stringify(stringId),
    },
  };

  await postMonday(body, `returning client Id ${stringId}`);
};

const changeMondayStatus = async (cellId, label, itemId, action) => {
  const onboardingId = 413267102;

  const body = {
    query: `
    		mutation ($boardId: Int!, $itemId: Int!, $columnValues: JSON!, $columnId :String!) {
      			change_column_value(
					board_id: $boardId, 
					item_id: $itemId, 
					column_id: $columnId, 
					value: $columnValues) 
					{
        				id
      				}
    		}
    		`,
    variables: {
      boardId: onboardingId,
      itemId: itemId,
      columnValues: JSON.stringify({ label: label }),
      columnId: cellId,
    },
  };

  await postMonday(body, `changing monday status to ${label} ${action} `);
};

const getLink = async (itemId) => {
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
    `,
  };
  try {
    const response = await postMonday(body, "getLink");
    return response.data.boards[0].items[0].column_values[0].value
      .toString()
      .replace(/['"]+/g, "");
  } catch (err) {
    return console.log(err);
  }
};

const getPmInfo = async (pmId) => {
  // get name too
  const body = {
    query: ` {
      users(ids: [${pmId}] ) {
        email
        name
      }
    }
      `,
  };
  try {
    const response = await postMonday(body, `get PM info ID:${pmId}`);
    return response.data.users[0];
  } catch (error) {
    console.log(error);
  }
};

const getValuesFromMonday = async (boardId, itemId, consulting = false) => {
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
    smId: "",
    contactFirstName: "",
    contactLastName: "",
    streetAddress: "",
    zipCode: "",
    city: "",
    country: { countryCode: "", countryName: "" },
    contactPosition: "",
  };

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
          `,
  };
  try {
    const response = await postMonday(body, "getValuesFromMonday");

    const values = await response.data.boards[0].items[0].column_values;

    const name = response.data.boards[0].items[0].name;
    mondayObj.itemId = itemId;

    const isNewClientItem = values.find((item) => item.id === CLIENT_ID_ID);
    const isNewClient = !!isNewClientItem.value ? false : true;
    if (!!isNewClientItem.value) {
      mondayObj.clientId = isNewClientItem.value.replace(/['"]+/g, "");
    }
    mondayObj.isNewClient = isNewClient;

    if (mondayObj.isNewClient) {
      console.log("in new client setting mname", name);
      /* const clientNameObj = values.find(item => item.id === "text") */
      mondayObj.clientName = name.replace(/['"]+/g, "");
    } else {
      console.log("in old client setting name", mondayObj.clientId);
      const firebaseClient = await firebase.getClientInfo(mondayObj.clientId);
      if (!!firebaseClient) {
        console.log(firebaseClient, "firebaseClient on old client");
        mondayObj.clientName = firebaseClient.name;
      } else {
        changeMondayStatus(
          constants.START_FORM_STATUS,
          "Client Not Found",
          itemId,
          "client not found"
        );
        throw new Error("client not found ending program");
      }
    }

    const emailObj = values.find((item) => item.id === "email");
    if (!!emailObj.value) {
      mondayObj.email = JSON.parse(emailObj.value).email;
    } else {
      if (mondayObj.isNewClient) throw new Error("missing email");
    }

    const phoneObj = values.find((item) => item.id === "phone_number");

    if (!!JSON.parse(phoneObj.value)) {
      mondayObj.phone = JSON.parse(phoneObj.value).phone;
    } else {
      if (mondayObj.isNewClient) throw new Error("missing phone number");
    }

    const contactFirstNameObj = values.find((item) => item.id === "text52");
    if (!!contactFirstNameObj.value) {
      mondayObj.contactFirstName = contactFirstNameObj.value.replace(
        /['"]+/g,
        ""
      );
    } else {
      if (mondayObj.isNewClient) throw new Error("missing contact Name ");
    }

    const contactLastNameObj = values.find((item) => item.id === "text524");
    if (!!contactLastNameObj.value) {
      mondayObj.contactLastName = contactLastNameObj.value.replace(
        /['"]+/g,
        ""
      );
    } else {
      if (mondayObj.isNewClient) throw new Error("missing contact Last Name ");
    }

    const streetAddressObj = values.find((item) => item.id === "text4");
    if (!!streetAddressObj.value) {
      mondayObj.streetAddress = streetAddressObj.value.replace(/['"]+/g, "");
    } else {
      if (mondayObj.isNewClient) throw new Error("missing street");
    }

    const zipCodeObj = values.find((item) => item.id === "text42");
    if (!!zipCodeObj.value) {
      mondayObj.zipCode = zipCodeObj.value.replace(/['"]+/g, "");
    } else {
      if (mondayObj.isNewClient) throw new Error("missing zip code");
    }

    const cityObj = values.find((item) => item.id === "text88");
    if (!!cityObj.value) {
      mondayObj.city = cityObj.value.replace(/['"]+/g, "");
    } else {
      if (mondayObj.isNewClient) throw new Error("missing city");
    }

    const countryObj = values.find((item) => item.id === "country");
    if (!!JSON.parse(countryObj.value)) {
      mondayObj.country.countryCode = JSON.parse(countryObj.value).countryCode;
      mondayObj.country.countryName = JSON.parse(countryObj.value).countryName;
    } else {
      if (mondayObj.isNewClient) throw new Error("missing country");
    }

    const companyAssignedObj = values.find((item) => item.id === "dropdown1");
    if (!!JSON.parse(companyAssignedObj.value)) {
      const companyAssignedParse = JSON.parse(companyAssignedObj.value);
      const companyAssigned = companyAssignedParse.ids[0];

      if (!!companyAssigned && companyAssigned === 1) {
        mondayObj.companyAssigned = "VENTURESOME";
      } else if (!!companyAssigned && companyAssigned === 2) {
        mondayObj.companyAssigned = "moneytree";
      } else {
        if (!consulting) throw new Error("missing company Assigned");
      }
    }
    const projectNameObj = values.find((item) => item.id === "project_name");
    if (!!projectNameObj.value) {
      mondayObj.projectName = projectNameObj.value.replace(/['"]+/g, "");
    } else {
      throw new Error("missing project name");
    }

    const positionObj = values.find((item) => item.id === "text2");
    if (!!positionObj.value) {
      mondayObj.contactPosition = positionObj.value.replace(/['"]+/g, "");
    } else {
      if (mondayObj.isNewClient) throw new Error("missing position");
    }

    const managerObj = values.find((item) => item.id === "person");
    if (!!JSON.parse(managerObj.value).personsAndTeams[0]) {
      mondayObj.pmId = JSON.parse(
        managerObj.value
      ).personsAndTeams[0].id.toString();
    } else {
      throw new Error("missing Pm info");
    }

    //SM
    const smObj = values.find((item) => item.id === "people7");
    if (!!JSON.parse(smObj.value).personsAndTeams[0]) {
      console.log("asiggning SM id", managerObj);
      mondayObj.smId = JSON.parse(smObj.value).personsAndTeams[0].id.toString();
    } else {
      throw new Error("missing sm info");
    }

    //get slackUsers emails array
    const slackItem = values.find((item) => item.id === "people");
    if (!!JSON.parse(slackItem.value)) {
      const slackObj = JSON.parse(slackItem.value);
      const slackUsers = slackObj.personsAndTeams;
      const slackIds = slackUsers.map((user) => user.id);
      if (slackIds.length === 0) {
        if (!consulting && !isNewClient) throw new Error("missing Slack Users");
      } else {
        const getUsers = async () => {
          return Promise.all(slackIds.map((id) => getPmInfo(id)));
        };

        let slackEmails = [];

        getUsers()
          .then(
            (data) =>
              (slackEmails = data.map((email) => {
                return email.email;
              }))
          )
          .then(() => (mondayObj.slackUsers = slackEmails))
          .catch((err) => console.log(err));
      }
    }

    //getting itemIdfor the correct Form
    const linkItem = values.find((item) => item.id === "link_to_item");
    console.log(linkItem);
    if (!!linkItem.value && !!JSON.parse(linkItem.value).linkedPulseIds) {
      console.log("passed");
      const linkObj = JSON.parse(linkItem.value);
      const formItemId = linkObj.linkedPulseIds[0].linkedPulseId;
      mondayObj.formLink = await getLink(formItemId);
    } else {
      if (mondayObj.isNewClient && !consulting) {
        throw new Error("missing Form Info");
      }
    }

    const pmInfo = await getPmInfo(mondayObj.pmId.toString());

    mondayObj.pmEmail = pmInfo.email;
    mondayObj.pmName = pmInfo.name;

    return mondayObj;
  } catch (error) {
    console.log("Error when reading mondayObj", error);
    changeMondayStatus(
      constants.START_FORM_STATUS,
      "Missing Info",
      itemId,
      "missing info"
    );
    return 0;
  }
};
const test = async () => {
  console.log(await getValuesFromMonday(413267102, 477550694, false));
};

/* test() */
//Update forms from type form functions

const updateForms = async (forms) => {
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
      `,
  };

  try {
    const response = await postMonday(body, "updateForms");
    //column_value 1 represent form Id column on the board
    const ids = response.data.boards[0].items.map((form) =>
      form.column_values[1].value.replace(/['"]+/g, "")
    );

    //filter the forms using ids already on the board, returning only new forms
    forms = forms.filter((item) => {
      return !ids.includes(item.id);
    });
  } catch (err) {
    return console.log(err);
  }

  // populate the formsBoard with the forms from typeForm after they were filtered by Id on monday board
  forms.map(async (form) => {
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
        columnValues: JSON.stringify({ text: form.link, text4: form.id }),
      },
    };

    await postMonday(body, "populating form board");
  });
};

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
      `,
  };
  const submissionObj = {
    birthday: "",
    email: "",
    slack: false,
    phone: "",
    clientId: "",
    name: "",
    aditional: "",
    questions: "",
    iban: "",
    backstage: "",
  };

  try {
    const response = await postMonday(body, "getSubmissionData");
    const values = await response.data.boards[0].items[0].column_values;
    console.log(values);

    const clientId = values.find((item) => item.id === "text08");
    submissionObj.clientId = clientId.value.replace(/['"]+/g, "");

    const emailObj = values.find((item) => item.id === "email");
    submissionObj.email = JSON.parse(emailObj.value).email;

    const contactNameObj = values.find((item) => item.id === "text4");
    submissionObj.name = JSON.parse(contactNameObj.value);

    const birthdayObj = values.find((item) => item.id === "date4");
    console.log("birthday obj", birthdayObj, typeof birthdayObj);
    const dateTime = moment(JSON.parse(birthdayObj.value).date).format(
      "YYYY-MM-DD"
    );
    console.log("birthday converted", dateTime);
    submissionObj.birthday = dateTime;

    const slackObj = values.find((item) => item.id === "check");
    if (!!slackObj.value) {
      const slackString = JSON.parse(slackObj.value).checked;
      if (slackString === "true") {
        submissionObj.slack = true;
      }
    } else {
      submissionObj.slack = false;
    }
    const additionalObj = values.find((item) => item.id === "text40");
    !!additionalObj.value &&
      (submissionObj.aditional = additionalObj.value.replace(/['"]+/g, ""));

    const importantObj = values.find((item) => item.id === "text3");
    !!importantObj.value &&
      (submissionObj.important = importantObj.value.replace(/['"]+/g, ""));

    const ibanObj = values.find((item) => item.id === "text5");
    !!ibanObj.value &&
      (submissionObj.iban = ibanObj.value.replace(/['"]+/g, ""));

    const backstageObj = values.find((item) => item.id === "text00");
    !!backstageObj.value &&
      (submissionObj.backstage = backstageObj.value.replace(/['"]+/g, ""));

    const phoneObj = values.find((item) => item.id === "phone1");
    submissionObj.phone = phoneObj.value.replace(/['"]+/g, "");
    console.log("sucess creating submission obj", submissionObj);

    return submissionObj;
  } catch (error) {
    console.log("error when creating submission obj", error);
  }
};

const getBoardByClientId = async (clientId) => {
  console.log(clientId, typeof clientId);

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
              
                `,
  };
  try {
    const response = await postMonday(body, "get boards");
    const boardItems = await response.data.boards[0].items.map((item) => item);
    const boardData = await boardItems.map((item) => {
      return {
        id: item.id,
        idCell: item.column_values.find((value) => value.id === "text86"),
      };
    });
    boardData.map((item) => {
      if (item.idCell.value !== null) {
        item.idCell.value = item.idCell.value.replace(/['"]+/g, "");
      }
      return null;
    });

    const itemObj = boardData.find(
      (item) => item.idCell.value === clientId.toString()
    );
    const itemId = itemObj.id;

    return { boardId: SALES_PIPELINE_BOARD_ID, itemId: parseInt(itemId) };
  } catch (error) {
    throw new Error(`client Id ${clientId} not found in monday board`, error);
  }
};

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
  );

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
      itemName: `${clientNumber}_${year}_${clientProjectNumber
        .toString()
        .padStart(2, "0")} | ${clientName} | ${projectName}`,
      columnValues: JSON.stringify({
        status: { label: "On it!" },
        person: { personsAndTeams: [{ id: pmId, kind: "person" }] },
        tags: { text: "testTag", tag_ids: [tag] },
      }),
    },
  };
  try {
    await postMonday(body, "adding board to Video Project Over");
  } catch (error) {
    throw new Error(
      "error when creating board for Video Project overview",
      error
    );
  }
};

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
  let dateTime = moment(createdAt).format("YYYY-MM-DD");
  let giftDate = moment(createdAt).add(3, "M").format("YYYY-MM-DD");

  let columValues = "";
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
  );
  if (companyAssigned === "VENTURESOME") {
    columValues = JSON.stringify({
      person: { id: pmId },
      datum4: { date: dateTime },
      pm: { id: smId },
      tags: { text: "testTag", tag_ids: [tag] },
    });
  } else if (companyAssigned === "moneytree") {
    columValues = JSON.stringify({
      person: { id: pmId },
      datum4: { date: dateTime },
      datum: { date: giftDate },
      pm: { id: smId },
      tags: { text: "testTag", tag_ids: [tag] },
    });
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
      itemName: `${clientNumber}_${year}_${clientProjectNumber
        .toString()
        .padStart(2, "0")} | ${clientName} | ${projectName}`,
      columnValues: columValues,
    },
  };
  try {
    const response = await postMonday(
      body,
      "adding item to Inbox Project Overview"
    );
    const overviewId = response.data.create_item.id;
    return parseInt(overviewId);
  } catch (error) {
    throw new Error(
      "error when creating board for Video Project overview",
      error
    );
  }
};

const addProjectOverviewConsulting = async (
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
  let dateTime = moment(createdAt).format("YYYY-MM-DD");

  let columValues = "";
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
  );

  columValues = JSON.stringify({
    person: { id: pmId },
    datum4: { date: dateTime },
    pm: { id: smId },
    tags: { text: "testTag", tag_ids: [tag] },
    status5: { label: "Consulting" },
  });

  const body = {
    query: `
      		mutation ($boardId: Int!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
       			 create_item (
        			  board_id: $boardId,
        			  group_id: $groupId,
        			  item_name: $itemName,
       				  column_values: $columnValues
     				  ){
     				     id
						}
					}
				`,
    variables: {
      boardId: PROJECT_OVERVIEW_ID,
      groupId: "new_group2147",
      itemName: `${clientNumber} | ${clientName} | Consulting`,
      columnValues: columValues,
    },
  };
  try {
    const response = await postMonday(
      body,
      "adding item to Inbox Project Overview"
    );
    const overviewId = response.data.create_item.id;
    return parseInt(overviewId);
  } catch (error) {
    throw new Error(
      "error when creating board for Video Project overview",
      error
    );
  }
};

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
  );

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
      itemName: `${clientNumber}_${year}_${clientProjectNumber
        .toString()
        .padStart(2, "0")} | ${clientName} | ${projectName}`,
      columnValues: JSON.stringify({
        strategie_session: { label: "On it!" },
        person: { personsAndTeams: [{ id: pmId, kind: "person" }] },
        tags: { text: "testTag", tag_ids: [tag] },
      }),
    },
  };
  try {
    await postMonday(body, "adding item toMoney Tree account");
  } catch (error) {
    throw new Error("error when creating board for Money Tree Account", error);
  }
};

const saveClientToMondayDatabase = async (clientFirebase, contactObj) => {
  console.log("data going to monday DB", clientFirebase, contactObj);
  //create group and get back id

  let dateTime = moment(clientFirebase.createdAt).format("YYYY-MM-DD");
  let giftDate = moment(clientFirebase.createdAt)
    .add(3, "M")
    .format("YYYY-MM-DD");

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
      groupName: `${clientFirebase.idNumber} | ${clientFirebase.name}`,
    },
  };

  try {
    const obj = await postMonday(body, "saving client to mondaydatabase");
    const newGroupIdid = obj.data.create_group.id;

    let columnValues = "";
    if (clientFirebase.isAutomaticGift) {
      columnValues = JSON.stringify({
        phone: {
          phone: contactObj.mobilePhone.number,
          countryShortName: contactObj.mobilePhone.countryShortName,
        },
        email: {
          email: contactObj.email.email,
          text: contactObj.email.text,
        },
        due_date: { date: contactObj.birthday },
        client_nr_: contactObj.clientId,
        tags7: { text: "testTag", tag_ids: [clientFirebase.tag] },
        date4: { date: dateTime },
        date: { date: giftDate },
        text: clientFirebase.name,
        people: {
          personsAndTeams: [{ id: clientFirebase.smId, kind: "person" }],
        },
        adresse: `${clientFirebase.address.street} ${clientFirebase.address.zip} ${clientFirebase.address.city} `,
        text12: clientFirebase.address.street,
        text3: clientFirebase.address.zip,
        text6: clientFirebase.address.city,
        country: {
          countryCode: clientFirebase.address.country.countryCode,
          countryName: clientFirebase.address.country.countryName,
        },
        text17: contactObj.position,
      });
    } else {
      columnValues = JSON.stringify({
        phone: {
          phone: contactObj.mobilePhone.number,
          countryShortName: contactObj.mobilePhone.countryShortName,
        },
        email: {
          email: contactObj.email.email,
          text: contactObj.email.text,
        },
        due_date: { date: contactObj.birthday },
        client_nr_: contactObj.clientId,
        tags7: { text: "testTag", tag_ids: [clientFirebase.tag] },
        date4: { date: dateTime },
        text: clientFirebase.name,
        people: {
          personsAndTeams: [{ id: clientFirebase.smId, kind: "person" }],
        },
        adresse: `${clientFirebase.address.street} ${clientFirebase.address.zip} ${clientFirebase.address.city}`,
        text12: clientFirebase.address.street,
        text3: clientFirebase.address.zip,
        text6: clientFirebase.address.city,
        country: {
          countryCode: clientFirebase.address.country.countryCode,
          countryName: clientFirebase.address.country.countryName,
        },
        text17: contactObj.position,
      });
    }
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
        itemName: `${contactObj.firstName} ${contactObj.lastName}`,
        columnValues: columnValues,
      },
    };
    const response = await postMonday(
      body1,
      "populating board monday database"
    );

    const itemId = parseInt(response.data.create_item.id);
    return itemId;
  } catch (error) {
    throw new Error("error when saving client to mondaydatabase", error);
  }
};

const createTag = async (clientName, clientNumber) => {
  const tagText = `#${clientNumber}${clientName.replace(/\s+/g, "")}`;
  console.log("tag to create", tagText);
  const body = {
    query: `
		mutation($tagText:String!) {
			create_or_get_tag (tag_name: $tagText) {
				id
			}
		}
    `,
    variables: {
      tagText: tagText,
    },
  };
  const response = await postMonday(body, `creating tag ${tagText}`);
  const tagId = response.data.create_or_get_tag.id;
  return tagId;
};

//function to migrate database from monday to firebase
const databaseMigration = async () => {
  const body = {
    query: ` query {
					boards(ids:463586872) {
						groups {
							title
						items(limit: 130) {
							name
							id
								column_values {
								id
							
								value
								}
							}
						}
					}
				} 
                `,
  };

  try {
    const clientsArray = [];
    const result = await postMonday(body, `querying monday database`);
    const clients = result.data.boards[0].groups;

    let globalItemId = "";
    await clients.map(async (client) => {
      const clientObj = {
        idNumber: "",
        firstName: "",
        lastName: "",
        isPrimary: false,
        address: {
          street: "",
          zip: "",
          city: "",
          country: {
            countryCode: "",
            countryName: "",
          },
        },
        category: "",
        formLink: "",
        mondayItemIdOnboarding: "",
        onboardingCompletedOn: "",
        slack: "",
        slackUsers: "",
        togglClientId: "",
        createdAt: new Date(),
        tag: "",
        smId: "",
      };

      const name = client.title.split(" | ");
      !!name && (clientObj.name = name[1]);

      client.items.map(async (contact) => {
        const clientIdObj = contact.column_values.find(
          (item) => item.id === "client_nr_"
        );

        const id = contact.id;
        !!id && (globalItemId = parseInt(id));

        const smObj = contact.column_values.find(
          (item) => item.id === "people"
        );
        const smId =
          !!JSON.parse(smObj.value) &&
          JSON.parse(smObj.value).personsAndTeams[0].id;
        !!smId && (clientObj.smId = smId);

        const clientId =
          !!clientIdObj.value && clientIdObj.value.replace(/['"]+/g, "");
        !!clientId && (clientObj.idNumber = clientId);
        console.log(clientId);
        const category = contact.column_values.find(
          (item) => item.id === "text1"
        );
        !!category.value &&
          (clientObj.category = category.value.replace(/['"]+/g, ""));

        const oldTag = contact.column_values.find(
          (item) => item.id === "tags7"
        );
        !!JSON.parse(oldTag.value) &&
          JSON.parse(oldTag.value).tag_ids.length !== 0 &&
          (clientObj.tag = JSON.parse(oldTag.value).tag_ids[0]);
        // creating

        const contactObj = {
          clientId: clientId,
          name: "",
          position: "",
          birthday: "",
          email: {
            email: "",
            text: "",
          },
          officePhone: {
            number: "",
            countryShortName: "",
          },
          mobilePhone: {
            number: "",
            countryShortName: "",
          },
          itemId: globalItemId,
        };

        const contactName = contact.name;
        const array = contactName.split(" ", [2]);
        const first = array[0];
        const last = array[1];
        !!contactName && (contactObj.firstName = first);
        !!contactName && (contactObj.lastName = last);

        const positionObj = contact.column_values.find(
          (item) => item.id === "text17"
        );
        const position =
          !!positionObj.value && positionObj.value.replace(/['"]+/g, "");
        !!position && (contactObj.position = position);

        const officePhoneObj = contact.column_values.find(
          (item) => item.id === "mobile8"
        );

        const officePhone =
          !!JSON.parse(officePhoneObj.value) &&
          JSON.parse(officePhoneObj.value).phone;
        !!officePhone && (contactObj.officePhone.number = officePhone);

        const officePhoneFlag =
          !!JSON.parse(officePhoneObj.value) &&
          JSON.parse(officePhoneObj.value).countryShortName;
        !!officePhoneFlag &&
          (contactObj.officePhone.countryShortName = officePhoneFlag);

        const mobilePhoneObj = contact.column_values.find(
          (item) => item.id === "phone"
        );
        const mobilePhone =
          !!JSON.parse(mobilePhoneObj.value) &&
          JSON.parse(mobilePhoneObj.value).phone;
        !!mobilePhone && (contactObj.mobilePhone.number = mobilePhone);

        const mobilePhoneFlag =
          !!JSON.parse(mobilePhoneObj.value) &&
          JSON.parse(mobilePhoneObj.value).countryShortName;
        !!mobilePhoneFlag &&
          (contactObj.mobilePhone.countryShortName = mobilePhoneFlag);

        const emailObj = contact.column_values.find(
          (item) => item.id === "email"
        );
        const email =
          !!JSON.parse(emailObj.value) && JSON.parse(emailObj.value).email;
        !!email && (contactObj.email.email = email);
        !!email && (contactObj.email.text = contactName);

        //separated address obj
        const streetObj = contact.column_values.find(
          (item) => item.id === "text12"
        );
        !!streetObj.value &&
          (clientObj.address.street = streetObj.value.replace(/['"]+/g, ""));

        const ZIPobj = contact.column_values.find(
          (item) => item.id === "text3"
        );
        !!ZIPobj.value &&
          (clientObj.address.zip = ZIPobj.value.replace(/['"]+/g, ""));

        const cityObj = contact.column_values.find(
          (item) => item.id === "text6"
        );
        !!cityObj.value &&
          (clientObj.address.city = cityObj.value.replace(/['"]+/g, ""));

        const countryObj = contact.column_values.find(
          (item) => item.id === "country"
        );
        !!JSON.parse(countryObj.value) &&
          (clientObj.address.country.countryCode = JSON.parse(
            countryObj.value
          ).countryCode);
        !!JSON.parse(countryObj.value) &&
          (clientObj.address.country.countryName = JSON.parse(
            countryObj.value
          ).countryName);

        //full adress from old db
        const addressOb = contact.column_values.find(
          (item) => item.id === "adresse"
        );
        const address =
          !!JSON.parse(addressOb.value) && JSON.parse(addressOb.value).address;
        !!address && (clientObj.address = address.trim());

        const birthdayObj = contact.column_values.find(
          (item) => item.id === "due_date"
        );
        const birthday =
          !!JSON.parse(birthdayObj.value) && JSON.parse(birthdayObj.value).date;
        !!birthday && (contactObj.birthday = birthday);

        await firebase.createDocument(
          "contacts",
          contactObj,
          "creating contact firebase"
        );

        return contactObj;
      });
      if (clientObj.tag === "") {
        const tagId = await createTag(clientObj.name, clientObj.idNumber);
        !!tagId && (clientObj.tag = tagId);
      }

      await firebase.createDocument("clients", clientObj, "create client");
    });
    // call google ids to firebase
    // call toggl ids to firebase
    return clientsArray;
  } catch (error) {
    console.log(error);
  }
};

const databaseFirebaseToMonday = async () => {
  // create group
  try {
    const databaseId = CLIENT_DATABASE_BOARD_ID;
    const createGroup = async (groupTitle) => {
      const createGroupQuery = {
        query: `
			mutation($groupTitle:String!) {
				create_group(board_id: ${databaseId}, group_name: $groupTitle) {
				id
				}
			}
		`,
        variables: {
          groupTitle: groupTitle,
        },
      };
      const response = await postMonday(
        createGroupQuery,
        `creating group ${groupTitle}`
      );
      const groupId = response.data.create_group.id;
      return groupId;
    };

    const createItem = async (firebaseClient, groupId) => {
      console.log("in create item", firebaseClient, groupId);
      const { idNumber, category, address, tag } = firebaseClient;

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
            adresse: `${address.street} ${address.zip} ${address.city}`,
            text12: address.street,
            text3: address.zip,
            text6: address.city,
            country: {
              countryCode: address.country.countryCode,
              countryName: address.country.countryName,
            },
            tags7: { text: "testTag", tag_ids: [tag] },
            text1: category,
            people: {
              personsAndTeams: [{ id: 8109061, kind: "person" }],
            },
          }),
        },
      };

      const response = await postMonday(createItemQuery, `creating item`);
      return parseInt(response.data.create_item.id);
    };

    const createItem2 = async (contact, itemId, clientName) => {
      const {
        birthday,
        email,
        mobilePhone,
        officePhone,
        position,
        name,
      } = contact;

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
              countryShortName: officePhone.countryShortName,
            },
            phone: {
              phone: mobilePhone.number,
              countryShortName: mobilePhone.countryShortName,
            },
            email: { email: email.email, text: email.text },
            due_date: { date: birthday },
            text: clientName,
          }),
        },
      };

      await postMonday(createItemQuery2, `creating item 2`);
    };

    const createSecondLevel = async (firebaseClient, groupId) => {
      await firebaseClient.contacts.map(async (contact) => {
        const itemId = await createItem(firebaseClient, groupId);
        await createItem2(contact, itemId, firebaseClient.name);
      });
    };

    let firebaseClient = "";
    //get Client form firebase
    for (let index = 2; index <= 111; index++) {
      let counter = index.toString().padStart(3, "0");
      firebaseClient = await firebase.getClientInfo(counter);
      //create group on monday return group Id
      const groupId = await createGroup(
        `${firebaseClient.idNumber} | ${firebaseClient.name}`
      );

      // create second level insertin contact info on the item created
      await createSecondLevel(firebaseClient, groupId);
    }
  } catch (error) {
    console.log(error);
  }
};

const getClientOnboarding = async (itemId) => {
  console.log("item id on function", itemId);
  const intId = parseInt(itemId);
  const body = {
    query: `
		query { 
			items (ids: [${intId}]) {
			name
			  column_values{
				id
				value
			  }
			}
		}
    `,
  };
  const response = await postMonday(body, `getting client Id for onboarding`);
  console.log("repsonse", response.data.items);
  const idItem = response.data.items[0].column_values.find(
    (item) => item.id === "text86"
  );
  const id = idItem.value.replace(/['"]+/g, "");
  console.log("id returning", id);
  return id;
};

const getPmMondayInfo = async (pmId) => {
  console.log(pmId, "pmId");
  const body = {
    query: `
			query {
				users (ids: ${pmId}) {
					name
					phone
					photo_original
					mobile_phone
					email
					id
				title
					 }
				}`,
  };
  const response = await postMonday(body, `getting client Id for onboarding`);
  const pmInfo = response.data.users[0];
  console.log(pmInfo);
  const pmInfoObj = {
    name: pmInfo.name,
    //phone contains the gender String
    phone: pmInfo.phone,
    photo: pmInfo.photo_original,
    mobile: pmInfo.mobile_phone,
    email: pmInfo.email,
    title: pmInfo.title,
    id: pmInfo.id,
  };
  return pmInfoObj;
};

const sendWelcome = async (
  clientObj,
  companyAssigned,
  pmId,
  smId,
  contactObj
) => {
  let name = "";
  let personAssigned = "";
  let deadline = moment(clientObj.createdAt).add(1, "d").format("YYYY-MM-DD");
  if (companyAssigned === "VENTURESOME") {
    name = `Send Welcome card to ${clientObj.name}`;
    personAssigned = pmId;
  } else if (companyAssigned === "moneytree") {
    name = `Send Bonsai to ${clientObj.name}`;
    personAssigned = smId;
  }

  //on project overview
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
      boardId: 168787053,
      groupId: "new_group",
      itemName: name,
      columnValues: JSON.stringify({
        tags: { text: "testTag", tag_ids: [clientObj.tag] },
        person3: { id: personAssigned },
        date: { date: deadline },
        status1: { label: "Urgent and Important" },
        priorit_t: { label: "Task" },
      }),
    },
  };

  const response = await postMonday(createItemQuery, `creating item`);
  const id = parseInt(response.data.create_item.id);
  console.log(id, typeof id);
  const createUpdate = {
    query: `
			mutation ($itemId : Int!, $body: String!) {
				create_update (item_id: $itemId, body:$body ) {
						id
					}
				}`,
    variables: {
      itemId: id,
      body: `${clientObj.name}'s Address : 
			${clientObj.name}
			${contactObj.firstName} ${contactObj.lastName}
			${clientObj.address.street}
			${clientObj.address.zip} ${clientObj.address.city}`,
    },
  };

  await postMonday(createUpdate, `creating update`);
};

const getNewContactInfo = async (itemId) => {
  const getInfo = {
    query: `
		{
			items(ids: ${itemId}) {
			  column_values {
				id
				title
				value
			  }
			}
		  }`,
  };

  const response = await postMonday(getInfo, `retrieving client Info to copy`);
  const clientInfo = response.data.items[0];
  /* 	console.log(clientInfo) */
  //clientName,clientNr,address,ZIP,City,Country, startdatum, SM,Kundennummer
  const clientObj = {
    name: "",
    clientId: "",
    address: "",
    street: "",
    zip: "",
    city: "",
    country: {
      countryCode: "",
      countryName: "",
    },
    startDate: "",
    smId: "",
    tag: "",
  };
  //clientName
  const clientNameObj = clientInfo.column_values.find(
    (item) => item.id === "text"
  );
  const clientName =
    !!clientNameObj.value && clientNameObj.value.replace(/['"]+/g, "");
  !!clientName && (clientObj.name = clientName);
  //clientNr
  const clientNumberObj = clientInfo.column_values.find(
    (item) => item.id === "client_nr_"
  );
  const clientNumber =
    !!clientNumberObj.value && clientNumberObj.value.replace(/['"]+/g, "");
  !!clientNumber && (clientObj.clientId = clientNumber);
  //address
  const addressObj = clientInfo.column_values.find(
    (item) => item.id === "adresse"
  );
  const address = !!addressObj.value && addressObj.value.replace(/['"]+/g, "");
  !!address && (clientObj.address = address);
  //street
  const streetObj = clientInfo.column_values.find(
    (item) => item.id === "text12"
  );
  const street = !!streetObj.value && streetObj.value.replace(/['"]+/g, "");
  !!street && (clientObj.street = street);
  //ZIP
  const zipObj = clientInfo.column_values.find((item) => item.id === "text3");
  const zip = !!zipObj.value && zipObj.value.replace(/['"]+/g, "");
  !!zip && (clientObj.zip = zip);
  //City
  const cityObj = clientInfo.column_values.find((item) => item.id === "text6");
  const city = !!cityObj.value && cityObj.value.replace(/['"]+/g, "");
  !!city && (clientObj.city = city);
  //Country
  const countryObj = clientInfo.column_values.find(
    (item) => item.id === "country"
  );
  const country =
    !!JSON.parse(countryObj.value) && JSON.parse(countryObj.value);
  !!country && (clientObj.country.countryName = country.countryName);
  !!country && (clientObj.country.countryCode = country.countryCode);
  //startDate
  const startDateObj = clientInfo.column_values.find(
    (item) => item.id === "date4"
  );
  const date =
    !!JSON.parse(startDateObj.value) && JSON.parse(startDateObj.value).date;
  !!date && (clientObj.startDate = date);
  //SM
  const smObj = clientInfo.column_values.find((item) => item.id === "people");
  const smIdObj = !!JSON.parse(smObj.value) && JSON.parse(smObj.value);
  const smId = smIdObj.personsAndTeams[0].id;
  !!smId && (clientObj.smId = smId);
  //Tag
  const tagObj = clientInfo.column_values.find((item) => item.id === "tags7");
  const tagIdObj = !!JSON.parse(tagObj.value) && JSON.parse(tagObj.value);
  const tag = tagIdObj.tag_ids[0];
  !!tag && (clientObj.tag = tag);

  return clientObj;
};

const getGroupFirstItem = async (boardId, groupId) => {
  console.log(boardId, groupId);
  const getInfo = {
    query: `
		query ($boardId:Int!,$groupId:String!){
			boards (ids: [$boardId]) {
			groups (ids: [$groupId]) {
				title
				items {
			 		 name
			 		 id
			 	column_values {
			   		id
				 } 
				}
		
			}
		}
	}`,
    variables: {
      boardId: boardId,
      groupId: groupId,
    },
  };

  const response = await postMonday(
    getInfo,
    `retrieving first itemId form group`
  );
  /* 	console.log(response.data) */
  const itemId = parseInt(response.data.boards[0].groups[0].items[0].id);
  return itemId;
};

const copyClientInfo = async (clientInfo, boardId, itemId) => {
  //clientName,clientNr,address,ZIP,City,Country, startdatum, SM,Kundennummer

  const {
    name,
    clientId,
    address,
    zip,
    city,
    country: { countryCode, countryName },
    startDate,
    smId,
    tag,
    street,
  } = clientInfo;

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
      boardId: boardId,
      itemId: itemId,
      columnValues: JSON.stringify({
        client_nr_: clientId,
        tags7: { text: "testTag", tag_ids: [tag] },
        date4: { date: startDate },
        people: {
          personsAndTeams: [{ id: smId, kind: "person" }],
        },
        text: name,
        adresse: address,
        text12: street,
        text3: zip,
        text6: city,
        country: {
          countryCode: countryCode,
          countryName: countryName,
        },
      }),
    },
  };

  await postMonday(createItemQuery2, `creating item 2`);
};
const parseObjForFirebase = async (columnId, value) => {
  console.log("value to parse", value);
  const POSITION = "text17";
  const OFFICE_PHONE = "mobile8";
  const MOBILE_PHONE = "phone";
  const EMAIL = "email";
  const BIRTHDATE = "due_date";
  const SM = "people";
  const CATEGORY = "text1";
  try {
    if (columnId === POSITION) {
      return { position: !!value ? value.value : "" };
    } else if (columnId === OFFICE_PHONE) {
      return {
        officePhone: {
          number: !!value ? value.phone : "",
        },
      };
    } else if (columnId === MOBILE_PHONE) {
      return {
        mobilePhone: {
          number: !!value ? value.phone : "",
        },
      };
    } else if (columnId === EMAIL) {
      return {
        email: {
          email: !!value.email ? value.email : "",
          text: !!value.text ? value.text : "",
        },
      };
    } else if (columnId === BIRTHDATE) {
      return {
        birthday: !!value ? value.date : "",
      };
    } else if (columnId === SM) {
      return {
        smId: !!value.personsAndTeams[0] ? value.personsAndTeams[0].id : "",
      };
    } else if (columnId === CATEGORY) {
      return { category: !!value ? value.value : "" };
    }
  } catch (error) {
    console.error(error);
  }
};

const getClientId = async (itemId) => {
  const body = {
    query: `query {
		items (ids: ${itemId}) {
			column_values {
		  		title
		  		id
		  		value
				}
			}
		}`,
  };
  const response = await postMonday(
    body,
    `getting clientid from item is ${itemId}`
  );
  const value = response.data.items[0];

  const clientObj =
    !!value && value.column_values.find((item) => item.id === "client_nr_");

  const clientId = !!clientObj.value && clientObj.value.replace(/['"]+/g, "");

  return clientId;
};
const getGroupId = async (itemId) => {
  console.log("getGroupId", itemId);
  if (!!itemId && itemId !== "") {
    const body = {
      query: `query {
					items(ids: ${itemId}) {
					  group {
						id
					  }
					}
				  }	  
			`,
    };
    const response = await postMonday(
      body,
      `getting groupId from item is ${itemId}`
    );

    return response.data.items[0].group.id;
  } else {
    return;
  }
};

const addContactToDbGroup = async (groupId, mondayObj) => {
  console.log("addContactToDbGroup", groupId, mondayObj);
  if (!!groupId && !!mondayObj) {
    console.log("addContactToDbGroup", groupId, mondayObj);
    const columnValues = JSON.stringify({
      phone: {
        phone: mondayObj.phone,
        countryShortName: mondayObj.country.countryCode,
      },
      email: {
        email: mondayObj.email,
        text: `${mondayObj.contactFirstName} ${mondayObj.contactLastName}`,
      },
      people: {
        personsAndTeams: [{ id: mondayObj.smId, kind: "person" }],
      },
      text17: mondayObj.contactPosition,
      client_nr_: mondayObj.clientId,
    });
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
        boardId: CLIENT_DATABASE_BOARD_ID,
        groupId: groupId,
        itemName: `${mondayObj.contactFirstName} ${mondayObj.contactLastName}`,
        columnValues: columnValues,
      },
    };
    try {
      const response = await postMonday(
        body,
        `adding item to group ${groupId}`
      );
      return response.data.create_item.id;
    } catch (error) {
      console.log(error);
    }
  } else {
    return;
  }
};

const getNewContactObj = async (itemId) => {
  const getInfo = {
    query: `
		{
			items(ids: ${itemId}) {
			  name
				column_values {
				id
				title
				value
			  }
			}
		  }`,
  };

  const response = await postMonday(
    getInfo,
    `retrieving contact from new item`
  );
  const contactInfo = response.data.items[0];
  console.log("getNewContactObj", contactInfo);
  //clientName,clientNr,address,ZIP,City,Country, startdatum, SM,Kundennummer
  const contactObj = {
    clientId: "",
    firstName: "",
    lastName: "",
    position: "",
    email: {
      email: "",
      text: "",
    },
    mobilePhone: {
      countryShortName: "",
      number: "",
    },
    officePhone: {
      countryShortName: "",
      number: "",
    },
    isPrimary: false,
    itemId: itemId,
  };
  //clientNr
  const clientNumberObj = contactInfo.column_values.find(
    (item) => item.id === "client_nr_"
  );
  const clientNumber =
    !!clientNumberObj.value && clientNumberObj.value.replace(/['"]+/g, "");
  !!clientNumber && (contactObj.clientId = clientNumber);

  //contact first name and last name
  const contactName = contactInfo.name;
  const array = contactName.split(" ", [2]);
  const first = array[0];
  const last = array[1];
  !!contactName && (contactObj.firstName = first);
  !!contactName && (contactObj.lastName = last);

  //Position
  const positionObj = contactInfo.column_values.find(
    (item) => item.id === "text17"
  );
  const position =
    !!positionObj.value && positionObj.value.replace(/['"]+/g, "");
  !!position && (contactObj.position = position);

  const emailObj = contactInfo.column_values.find(
    (item) => item.id === "email"
  );

  const email = !!emailObj.value && JSON.parse(emailObj.value);

  !!email && (contactObj.email.email = email.email);
  !!email &&
    (contactObj.email.text = `${contactObj.firstName} ${contactObj.lastName}`);

  const mobilePhoneObj = contactInfo.column_values.find(
    (item) => item.id === "phone"
  );
  const mobilePhone =
    !!JSON.parse(mobilePhoneObj.value) &&
    JSON.parse(mobilePhoneObj.value).phone;
  !!mobilePhone && (contactObj.mobilePhone.number = mobilePhone);

  return contactObj;
};

const createDatensicherungItem = async (
  clientNumber,
  clientName,
  projectName,
  clientProjectNumber,
  year,
  tag
) => {
  const boardId = 443156345;
  const groupId = "new_group69961";
  const itemName = `${clientNumber}_${year}_${clientProjectNumber
    .toString()
    .padStart(2, "0")} | ${clientName} | ${projectName}`;
  const columnValues = JSON.stringify({
    tags: { text: "testTag", tag_ids: [tag] },
  });

  const createItem = {
    query: `
		mutation($boardId: Int!, $groupId: String!,$itemName: String! ,$columnValues: JSON!) 
		{
			create_item (
				board_id: $boardId, 
				group_id: $groupId, 
				item_name: $itemName,
				column_values: $columnValues
				) 
				{
					id
				}
		}
	 		 
  `,
    variables: {
      boardId: boardId,
      groupId: groupId,
      itemName: itemName,
      columnValues: columnValues,
    },
  };
  console.log(
    "before creating  Datensicherung",
    boardId,
    groupId,
    itemName,
    columnValues
  );
  await postMonday(createItem, `creating item on Datensicherung`);
};

const getName = async (itemId) => {
  console.log("item id on function", itemId);
  const intId = parseInt(itemId);
  const body = {
    query: `
		query { 
			items (ids: [${intId}]) {
			name
			
			}
		}
    `,
  };
  const response = await postMonday(body, `getting namefrom ${itemId}`);

  const name = response.data.items[0].name;
  const fName = name.split(" ")[0];
  const lName = name.split(" ")[1];

  return { firstName: fName, lastName: lName };
};
/* const test1 = async () => {
	console.log(await getName(500294455))
}
test1() */

module.exports.getValuesFromMonday = getValuesFromMonday;
module.exports.updateForms = updateForms;
module.exports.getSubmissionData = getSubmissionData;
module.exports.changeMondayStatus = changeMondayStatus;
module.exports.setMondayClientId = setMondayClientId;
module.exports.getBoardByClientId = getBoardByClientId;
module.exports.addVideoProjectBoard = addVideoProjectBoard;
module.exports.addProjectOverview = addProjectOverview;
module.exports.addProjectOverviewConsulting = addProjectOverviewConsulting;
module.exports.addMoneyTreeAccount = addMoneyTreeAccount;
module.exports.saveClientToMondayDatabase = saveClientToMondayDatabase;
module.exports.createTag = createTag;
module.exports.getClientOnboarding = getClientOnboarding;
module.exports.getPmMondayInfo = getPmMondayInfo;
module.exports.sendWelcome = sendWelcome;
module.exports.getNewContactInfo = getNewContactInfo;
module.exports.getGroupFirstItem = getGroupFirstItem;
module.exports.copyClientInfo = copyClientInfo;
module.exports.parseObjForFirebase = parseObjForFirebase;
module.exports.getClientId = getClientId;
module.exports.postMonday = postMonday;
module.exports.getGroupId = getGroupId;
module.exports.addContactToDbGroup = addContactToDbGroup;
module.exports.getNewContactObj = getNewContactObj;
module.exports.createDatensicherungItem = createDatensicherungItem;
module.exports.getName = getName;
