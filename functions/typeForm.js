var rp = require('request-promise');
require('dotenv').config()

console.log("TypeForm File");

/* const formId = "OK160Z" */

const getFormsData = ()=>{
    
    var forms = []
    
    var headers = {
        'Authorization': `Bearer ${process.env.TYPEFORM_TOKEN}`
    };

    var options = {
        url: 'https://api.typeform.com/forms',
        headers: headers
    };
    

 return rp(options)
    .then(response => {
       var obj = JSON.parse(response)
           /*  console.log(obj); */
            forms = obj.items.map(form => {
                return {
                    id: form.id,
                    title: form.title,
                    link: form._links.display
                }
               
            })
            /* const form  = obj.items.find(form => form.id === formId)
            formLink = form._links.display  */
       return forms
    })
   /*  .then(()=> console.log(forms))  */
    .catch(err => console.log(err))



   

}

/* getFormsData() */


module.exports.getFormsData = getFormsData