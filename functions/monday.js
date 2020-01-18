/*
TODO: delete forms that are not on TypeForm anymore when update
      format for url to send with personalized params that we get from sales pipeline contact name and client name
      https://venturesome.typeform.com/to/OK160Z?clientname=SuperClient&contactname=Tom
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

module.exports.getResult = getResult;
module.exports.updateForms = updateForms;