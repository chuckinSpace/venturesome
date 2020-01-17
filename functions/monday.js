const { GraphQLClient } = require('graphql-request');
require('dotenv').config();
const axios = require('axios')
//Create connection called 'client' that connects to Monday.com's API
const client = new GraphQLClient('https://api.monday.com/v2/', {
    headers: {
    'Content-Type': 'application/json',
    'Authorization': process.env.MONDAY_TOKEN
    },
});

const getLink = async (pulseId) => {

  const query = `query {
    boards (ids:415921614) {
      items (ids:${pulseId}) {
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
    return  data.boards[0].items[0].column_values[0].value.toString();
  
  }
  catch (err) {
    return console.log(err);
  }
};

const getPmInfo = async (pmId) =>{
    // get name too
  const query = ` {
      users(ids: [${pmId}]) {
        email
      }
    }
      `;
try {
  const data = await client.request(query);
  return data.users[0].email;
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
          pulseId:"",
          formLink : "",
          pmEmail : "",
          pmName : ""
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
        
        const emailObj = values.find(item => item.id === "email");
        mondayObj.email = JSON.parse(emailObj.value).email;
  
        const clientNameObj = values.find(item => item.id === "text");
        mondayObj.clientName = clientNameObj.value;
        
        const phoneObj = values.find(item => item.id === "phone_number");
        mondayObj.phone = JSON.parse(phoneObj.value).phone;
        
        const companyAssignedObj = values.find(item => item.id === "company_assigned0");
        mondayObj.companyAssigned = companyAssignedObj.value;
  
        const projectNameObj = values.find(item => item.id === "project_name");
        mondayObj.projectName = projectNameObj.value;
  
        const managerObj = values.find(item => item.id === "person");
        mondayObj.managerId = JSON.parse(managerObj.value).personsAndTeams[0].id.toString();

        //add manager name
        //get slackUsers emails array
       /*  const formLinkObj = values.find(item => item.id === "link_to_item");
        mondayObj.pulseId = JSON.parse(formLinkObj.value).linkedPulseIds[0].linkedPulseId.toString(); */
        
        console.log(values);
        
        mondayObj.formLink = await getLink(mondayObj.pulseId.toString());
        mondayObj.pmEmail = await getPmInfo(mondayObj.managerId.toString());
        return mondayObj;
       
      } catch (error) {
        console.log(error);
      }
    
    };

 const getResult = async (/* boardId,itemId  */)=>{
      const boardId = "413267102";
      const itemId = "413267104"; 
  try {
    console.log("get result ", boardId,itemId); 
    return await getValuesFromMonday(boardId,itemId);
   
   } catch (error) {
     console.log(error);
   }
  
  
 }; 
/* getResult() */

const updateForms =async (forms)=>{
  console.log("forms from monday script", forms);

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
    boardId: 415921614,
    groupId: "new_group",
    itemName: "New item",
    columnValues: JSON.stringify({"text": "myLink"})
    }
  }
  axios.post(`https://api.monday.com/v2`, body, {
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











/* 

  const variables = {
    columnValues: JSON.stringify({"text": "myLink"})
  }
  //"text4" :"Hello world2"
  const query = ` mutation {
    create_item(board_id: 415921614, 
                group_id: "new_group",  
                item_name: "new item",
                column_values:${variables.columnValues}
                ) {
      id
    }
  },
  `;

  try {
   const data = await client.request(query,variables)
  
     console.log(data);
   
  } catch (error) {
    console.log(error);
  } */
}

module.exports.getResult = getResult;
module.exports.updateForms = updateForms;