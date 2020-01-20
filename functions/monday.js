/*
TODO: - delete forms that are not on TypeForm anymore when update
      - format for url to send with personalized params that we get from sales pipeline contact name and client name
        https://venturesome.typeform.com/to/OK160Z?clientname=SuperClient&contactname=Tom
      - change status on board, error and success
*/
const { GraphQLClient } = require('graphql-request');
require('dotenv').config();
const axios = require('axios')

const formsDataBoard = 415921614


//Create connection called 'client' that connects to Monday.com's API
const client = new GraphQLClient('https://api.monday.com/v2/', {
    headers: {
    'Content-Type': 'application/json',
    'Authorization': process.env.MONDAY_TOKEN
    },
});


const changeMondayStatus=(status)=>{
//0 sucess
//1 missing information




}




const getLink = async (itemId) => {

  const query = `query {
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
    `;
   try {
    const data = await client.request(query);
    return  data.boards[0].items[0].column_values[0].value.toString().replace(/['"]+/g, '');
  
  }
  catch (err) {
    return console.log(err);
  }
};


const getPmInfo = async (pmId) =>{
    // get name too
  const query = ` {
      users(ids: [${pmId}] ) {
        email
        name
      }
    }
      `;
  try {
    const data = await client.request(query);
    return data.users[0];
  } catch (error) {
    console.log(error);
  }

};

const getValuesFromMonday = async ( boardId,itemId ) =>{
 
        console.log("on get values from monday",boardId,itemId);  
        
        var mondayObj = {
        
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
      const query = ` query {
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
        `;
      try {
        const data  = await client.request(query);
        const values = await data.boards[0].items[0].column_values;
       
        
        mondayObj.itemId = itemId;
        
        const isNewClientItem = values.find(item=> item.id === "text86")
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
        const companyAssignedParse = JSON.parse(companyAssignedObj.value)
        const companyAssigned = companyAssignedParse.ids[0]
        if(companyAssigned === 1){
          mondayObj.companyAssigned = "Venturesome"
        }else if (companyAssigned === 2){
          mondayObj.companyAssigned = "MoneyTree"
        }
     
  
        const projectNameObj = values.find(item => item.id === "project_name");
        mondayObj.projectName = projectNameObj.value.replace(/['"]+/g, '');
  
        const managerObj = values.find(item => item.id === "person");
        mondayObj.managerId = JSON.parse(managerObj.value).personsAndTeams[0].id.toString();

       
        //get slackUsers emails array
        const slackItem = values.find(item => item.id === "people")
        const slackObj = JSON.parse(slackItem.value)
        const slackUsers = slackObj.personsAndTeams
        const slackIds = slackUsers.map(user=> user.id)
        
        const getUsers = async () => {
         return Promise.all(slackIds.map(id => getPmInfo(id)));
        }
     
        var slackEmails=[]

        getUsers()
       .then(data => slackEmails.push(data.map(user=>user.email)))
       .then(() => mondayObj.slackUsers = slackEmails.map(user=>{
         return {email:user}
        }))
       .catch(err=>console.log(err))
        
       //getting itemIdfor the correct Form 
       const linkItem = values.find(item=> item.id === "link_to_item")
       const linkObj = JSON.parse(linkItem.value)
       const formItemId = linkObj.linkedPulseIds[0].linkedPulseId;
       mondayObj.formLink =  await getLink(formItemId);
       
     /*   if(!!mondayObj.clientId){
         mondayObj.formLink = `${mondayObj.formLink}?clientid=${mondayObj.clientId}`
       }
         */
        const pmInfo = await getPmInfo(mondayObj.managerId.toString());
        mondayObj.pmEmail = pmInfo.email
        mondayObj.pmName = pmInfo.name 
        
     


        return mondayObj;
       
      } catch (error) {
        console.log("Error when reading mondayObj",error)
        changeMondayStatus(1)
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
  
  const query = `query {
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
    `;

   try {
    
    const data = await client.request(query);
    //column_value 1 represent form Id column on the board
    const ids = data.boards[0].items.map(form=>form.column_values[1].value.replace(/['"]+/g, ''));
    
    //filter the forms using ids already on the board, returning only new forms
    forms = forms.filter(item => {
      return !ids.includes(item.id); 
    })
  }
  catch (err) {
    return console.log(err);
  }

  
  // populate the formsBoard with the forms from typeForm after they were filtered by Id on monday board
  forms.map(form=>{

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

   return axios.post(`https://api.monday.com/v2`, body, {
        headers: {
          Authorization: process.env.MONDAY_TOKEN
        }
      })
      .catch(err => {
        console.error(err.data)
      })
      .then(res => {
        console.log(res.data)
      })

  })
}

const getSubmissionData=async(boardId,itemId)=>{
  
  const query = ` query {
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
    `;
    const submissionObj = {
      birthday : "",
      email:"",
      onboardingCompletedOn:"",
      slack:false,
      phone:"",
      clientId:0
    }
    const data  = await client.request(query);
    const values = await data.boards[0].items[0].column_values;
  
    
    const emailObj = values.find(item => item.id === "email");
    submissionObj.email = JSON.parse(emailObj.value).email;

    const onboardingDateObj = values.find(item => item.id === "date");
    submissionObj.onboardingCompletedOn = JSON.parse(onboardingDateObj.value).date;

    const birthdayObj = values.find(item => item.id === "date4");
    submissionObj.birthday = JSON.parse(birthdayObj.value).date;

    const slackObj = values.find(item => item.id === "check");
    console.log(JSON.parse(slackObj.value).checked);
    const slackString = JSON.parse(slackObj.value).checked
    if(slackString === "true"){
      submissionObj.slack = true
    }else if(slackString === "false"){
      submissionObj.slack = false
    }
  
    const phoneObj = values.find(item => item.id === "phone1");
    submissionObj.phone = phoneObj.value.replace(/['"]+/g, '')


    return submissionObj
}

module.exports.getResult = getResult;
module.exports.updateForms = updateForms;
module.exports.getSubmissionData = getSubmissionData;