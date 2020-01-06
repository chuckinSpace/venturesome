var rp = require('request-promise');
require('dotenv').config()

const formId = "OK160Z"
var formLink = ""
const getFormLink = ()=>{

    var headers = {
        'Authorization': `Bearer ${process.env.TYPEFORM_TOKEN}`
    };

    var options = {
        url: 'https://api.typeform.com/forms',
        headers: headers
    };
    

 rp(options)
    .then(response => {
       var obj = JSON.parse(response)
          form  = obj.items.find(form => form.id === formId)
          formLink = form._links.display 
       
    })
    .then(()=> console.log(formLink)) 
    .catch(err => console.log(err))



    

}

getFormLink()

module.exports.getFormLink = getFormLink