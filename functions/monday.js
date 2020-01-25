/*
TODO: - delete forms that are not on TypeForm anymore when update
      - check error when client not found
      - change getPmInfo function name
      - change all column ids to CONST
    
 BUG: - error when submitting form check cloud funciotns
*/
/* const { GraphQLClient } = require('graphql-request'); */
require('dotenv').config();
const axios = require('axios')

// const data from MONDAY
const formsDataBoard = 415921614
// contant id in sales pipeline
const CLIENT_ID_ID = "text86"
const STATUS_ID_SALES_PIPELINE = "status"

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
          managerId :"",
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
        mondayObj.managerId = JSON.parse(managerObj.value).personsAndTeams[0].id.toString();

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
     
        const pmInfo = await getPmInfo(mondayObj.managerId.toString());
       
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
      clientId:0
    }

    try {
      const response  = await postMonday(body,"getSubmissionData");
      const values = await response.data.boards[0].items[0].column_values;

      const emailObj = values.find(item => item.id === "email");
      submissionObj.email = JSON.parse(emailObj.value).email;


      const birthdayObj = values.find(item => item.id === "date4");
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



module.exports.getResult = getResult;
module.exports.updateForms = updateForms;
module.exports.getSubmissionData = getSubmissionData;
module.exports.changeMondayStatus = changeMondayStatus
module.exports.setMondayClientId = setMondayClientId