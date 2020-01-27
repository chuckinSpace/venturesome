/*
TODO: - delete forms that are not on TypeForm anymore when update
      - check error when client not found
      - change getPmInfo function name
      - change all column ids to CONST
    
 BUG: - error when submitting form check cloud funciotns
*/
/* const { GraphQLClient } = require('graphql-request'); */
require('dotenv').config();
const moment = require("moment")
const axios = require('axios')

// const data from MONDAY
const formsDataBoard = 415921614
const SALES_PIPELINE_BOARD_ID = 413267102
//Video Project Overview
const VIDEO_PROJECTS_OVERVIEW_BOARD_ID= 403775339
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
const postMonday = (body,action) => {
 
  return axios.post(`https://api.monday.com/v2`, body, {
    headers: {
      Authorization: process.env.MONDAY_TOKEN
    }
  })
  
  .then(res => {
    console.log(`sucess ${action}`,res.data)
    return res.data
  })
  .catch(err => {
    console.log(`error ${action}`,err)
  })
}

const setMondayClientId = async (boardId,itemId,clientId)=>{
  
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

  await postMonday(body,`returning client Id ${stringId}`)
  
}

const changeMondayStatus= async (status, boardId,itemId)=>{
  
  let statusText = ""
  if(status === 0){
    statusText = "Onboarding Sent!"
  }else if(status === 1){
    statusText ="Missing Info"
  }else if(status === 2){
    statusText = "Project Created"
  }else if(status === 3){
    statusText = "Client Not Found"
  }else if(status === 4){
    statusText = "Onboarding Complete"
  }
 
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
    boardId: boardId,
    itemId: itemId,
    columnValues: JSON.stringify({"label": statusText}),
    columnId: STATUS_ID_SALES_PIPELINE
    
    }
  }

  await postMonday(body,`changing monday status to ${statusText}`)
}


const getLink = async (itemId) => {

  const body ={ 
    query: 
    `query {
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
    `}
   try {
    const response = await postMonday(body,"getLink")
    return  response.data.boards[0].items[0].column_values[0].value.toString().replace(/['"]+/g, '');
  
  }
  catch (err) {
    return console.log(err);
  }
};


const getPmInfo = async (pmId) =>{
    // get name too
  const body ={
    query:
    ` {
      users(ids: [${pmId}] ) {
        email
        name
      }
    }
      `
  } ;
  try {
    const response = await postMonday(body, `get PM info ID:${pmId}`);
    return response.data.users[0];
  } catch (error) {
    console.log(error);
  }

};

const getValuesFromMonday = async ( boardId,itemId ) =>{
 
        let mondayObj = {
        
          email : "",
          clientName : "",
          phone : "",
          companyAssigned : "",
          projectName :"",
          pmId :"",
          itemId:"",
          formLink : "",
          pmEmail : "",
          pmName : "",
          slackUsers:[],
          isNewClient : true,
          clientId:""
       };
    
   
      //Create query to send to Monday.com's API
      const body ={
        query:` query {
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
      } ;
      try {
        const response  = await postMonday(body,"getValuesFromMonday");
        const values = await response.data.boards[0].items[0].column_values;
       
        
        mondayObj.itemId = itemId;
        
        const isNewClientItem = values.find(item=> item.id === CLIENT_ID_ID)
        const isNewClient = !!isNewClientItem.value ? false : true
        if(!!isNewClientItem.value){
          mondayObj.clientId = parseInt(isNewClientItem.value.replace(/['"]+/g, ''))
        }
        mondayObj.isNewClient = isNewClient

        const emailObj = values.find(item => item.id === "email");
        mondayObj.email = JSON.parse(emailObj.value).email;
  
        const clientNameObj = values.find(item => item.id === "text");
        mondayObj.clientName = clientNameObj.value.replace(/['"]+/g, '');
        
        const phoneObj = values.find(item => item.id === "phone_number");
        mondayObj.phone = JSON.parse(phoneObj.value).phone;
        
        const companyAssignedObj = values.find(item => item.id === "dropdown1");
        
        //check company assigned, if empty error
        const companyAssignedParse = JSON.parse(companyAssignedObj.value)
        const companyAssigned = companyAssignedParse.ids[0]
        console.log(companyAssigned);
        if(!!companyAssigned && companyAssigned === 1){
          mondayObj.companyAssigned = "Venturesome"
        }else if (!!companyAssigned && companyAssigned === 2){
          mondayObj.companyAssigned = "MoneyTree"
        }
        else{
          throw new Error("missing company Assigned")
        }
  
        const projectNameObj = values.find(item => item.id === "project_name");
        mondayObj.projectName = projectNameObj.value.replace(/['"]+/g, '');

        const managerObj = values.find(item => item.id === "person");
        if(!!JSON.parse(managerObj.value).personsAndTeams[0]){
        console.log("asiggning manager id",managerObj)
          mondayObj.pmId = JSON.parse(managerObj.value).personsAndTeams[0].id.toString();

       }else{
         throw new Error("missing Pm info")
       }
       
       
        //get slackUsers emails array
        const slackItem = values.find(item => item.id === "people")
        const slackObj = JSON.parse(slackItem.value)
        const slackUsers = slackObj.personsAndTeams
        const slackIds = slackUsers.map(user=> user.id)
        console.log(slackIds);
        if(slackIds.length === 0){
          throw new Error("missing Slack Users")
        }else{
          const getUsers = async () => {
            return Promise.all(slackIds.map(id => getPmInfo(id)));
           }
        
           let slackEmails=[]
   
           getUsers()
          .then((data)=> slackEmails = data.map(email=> {
            return email.email
          }))
          .then(() => mondayObj.slackUsers = slackEmails) 
          .catch(err=>console.log(err))
        }
        
        
       //getting itemIdfor the correct Form 
       const linkItem = values.find(item=> item.id === "link_to_item")
       const linkObj = JSON.parse(linkItem.value)
       console.log(linkObj);
       if(mondayObj.isNewClient){
        if(!linkObj.linkedPulseIds){
          throw new Error("missing Form Info")
        }else{
          const formItemId = linkObj.linkedPulseIds[0].linkedPulseId;
          mondayObj.formLink =  await getLink(formItemId);
        }
     
       }
     
        const pmInfo = await getPmInfo(mondayObj.pmId.toString());
       
        mondayObj.pmEmail = pmInfo.email
        mondayObj.pmName = pmInfo.name 
  
        return mondayObj;
       
      } catch (error) {
        console.log("Error when reading mondayObj",error)
        changeMondayStatus(1, boardId,itemId)
        return 0
      }
    
    };

 const getResult = async (boardId,itemId)=>{
     
  try {
    console.log("get result ", boardId,itemId); 
    return await getValuesFromMonday(boardId,itemId);
   
   } catch (error) {
     console.log(error);
   }
  
  
 }; 


 //Update forms from type form functions

const updateForms =async (forms)=>{

  // get current ids for all the forms from form board to avoid duplicates, return an array of strings with ids
  
  const body ={
    query:
    `query {
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
  } ;

   try {
    
    const response = await postMonday(body,"updateForms");
    //column_value 1 represent form Id column on the board
    const ids = response.data.boards[0].items.map(form=>form.column_values[1].value.replace(/['"]+/g, ''));
    
    //filter the forms using ids already on the board, returning only new forms
    forms = forms.filter(item => {
      return !ids.includes(item.id); 
    })
  }
  catch (err) {
    return console.log(err);
  }

  
  // populate the formsBoard with the forms from typeForm after they were filtered by Id on monday board
  forms.map(async form=>{

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
      columnValues: JSON.stringify({"text": form.link,"text4": form.id})
      }
    }

   await postMonday(body,"populating form board")

  })
}

const getSubmissionData=async(boardId,itemId)=>{
  
  const body ={
    query:
    ` query {
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
  } ;
    const submissionObj = {
      birthday : "",
      email:"",  
      slack:false,
      phone:"",
      clientId:0,
      name:""
    }

    try {
      const response  = await postMonday(body,"getSubmissionData");
      const values = await response.data.boards[0].items[0].column_values;
      console.log(values)
      const emailObj = values.find(item => item.id === "email");
      submissionObj.email = JSON.parse(emailObj.value).email;

      const contactNameObj = values.find(item => item.id === "text4");
      submissionObj.name = JSON.parse(contactNameObj.value);


      const birthdayObj = values.find(item => item.id === "date4");
      console.log(birthdayObj, typeof birthdayObj)
      submissionObj.birthday = JSON.parse(birthdayObj.value).date;

      const slackObj = values.find(item => item.id === "check");
      if(!!slackObj.value){
        const slackString = JSON.parse(slackObj.value).checked
        if(slackString === "true"){
          submissionObj.slack = true
        }
      }
      else{
        submissionObj.slack = false
      }
    
      const phoneObj = values.find(item => item.id === "phone1");
      submissionObj.phone = phoneObj.value.replace(/['"]+/g, '')
      console.log("sucess creating submission obj", submissionObj)

      return submissionObj
    } catch (error) {
      console.log("error when creating submission obj",error);
    }
}
const test =async ()=>{
await getSubmissionData(411284598,439576800)
}
/* test() */
const getBoardByClientId = async (clientId) =>{
  console.log(clientId, typeof clientId)

  const body ={
                query:
                ` query {
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
  const response  = await postMonday(body,"get boards");
  const boardItems =  await response.data.boards[0].items.map(item=> item)
  const boardData = await boardItems.map(item => {
    return {
      id:item.id,
      idCell: item.column_values.find(value => value.id ==="text86")
    }
  })
  boardData.map(item=>{

    if(item.idCell.value !== null){
      item.idCell.value = item.idCell.value.replace(/['"]+/g, '')
    }
    return null
  })

  const itemObj = boardData.find(item=> item.idCell.value === clientId.toString())
  const itemId = itemObj.id
  
  return {boardId: SALES_PIPELINE_BOARD_ID,  itemId:parseInt(itemId)}
} catch (error) {
  throw new Error(`client Id ${clientId} not found in monday board`,error)

}
   

    
}

const addVideoProjectBoard = async (clientNumber,year,clientProjectNumber,clientName,projectName,pmId)=>{
  console.log(clientNumber,year,clientProjectNumber,clientName,projectName,pmId)

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
      columnValues: JSON.stringify( {"status":{"label":"Done"}, "person":{"personsAndTeams":[{"id":pmId,"kind":"person"}]}})
      }
  
    }
    try {
      await postMonday(body,"adding board to Video Project Over")
    } catch (error) {
      throw new Error("error when creating board for Video Project overview",error)
    }  

}

const addProjectOverview = async (clientNumber,year,clientProjectNumber,clientName,projectName,pmId,createdAt)=>{
 /*  console.log(clientNumber,year,clientProjectNumber,clientName,projectName,pmId,createdAt) */

 let dateTime = moment(createdAt).format("YYYY-MM-DD");

 console.log(typeof dateTime)
 //"date": "2019-06-03"  format to insert date
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
      columnValues: JSON.stringify( {"person":{"id":pmId},"geschenksdatum":{"date":dateTime}})
      }
  
    }
    try {
       await postMonday(body,"adding item to Inbox Project Overview") 
    } catch (error) {
      throw new Error("error when creating board for Video Project overview",error)
    }  

}

const addMoneyTreeAccount = async (clientNumber,year,clientProjectNumber,clientName,projectName,pmId)=>{
  console.log(clientNumber,year,clientProjectNumber,clientName,projectName,pmId)

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
      columnValues: JSON.stringify( { "strategie_session" :{"label":"Done"}, "person":{"personsAndTeams":[{"id":pmId,"kind":"person"}]}})
      }
  
    }
    try {
      await postMonday(body,"adding item toMoney Tree account")
    } catch (error) {
      throw new Error("error when creating board for Money Tree Account",error)
    }  

}

const saveClientToMondayDatabase = async (clientFirebase) =>{


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
  groupName: `TEST${clientFirebase.idNumber} | ${clientFirebase.name}`,
  }
}


  try {
     const obj = await postMonday(body,"saving client to mondaydatabase") 
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
        columnValues: JSON.stringify( { "phone" :{"phone":clientFirebase.phone}, "email":{"email":clientFirebase.email,"text":clientFirebase.contactName},"due_date":{"date":clientFirebase.birthday}})
      }
    }
    await postMonday(body1,"populating board monday database") 
  } catch (error) {
    throw new Error("error when saving client to mondaydatabase",error)
  }  

}

module.exports.getResult = getResult;
module.exports.updateForms = updateForms;
module.exports.getSubmissionData = getSubmissionData;
module.exports.changeMondayStatus = changeMondayStatus
module.exports.setMondayClientId = setMondayClientId
module.exports.getBoardByClientId = getBoardByClientId
module.exports.addVideoProjectBoard = addVideoProjectBoard
module.exports.addProjectOverview = addProjectOverview
module.exports.addMoneyTreeAccount = addMoneyTreeAccount
module.exports.saveClientToMondayDatabase = saveClientToMondayDatabase