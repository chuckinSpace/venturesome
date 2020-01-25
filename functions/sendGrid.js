const sgMail = require("@sendgrid/mail")
sgMail.setApiKey(process.env.SG_API_KEY)
const VENTURESOME_TEMPLATE_ID = "d-61e27a20903f47f7bb06b49b12710526"
const MONEYTREE_TEMPLATE_ID = "d-e1874833f3814ed0a1b8b540f18f24ba"


const sendOnboardingEmail = async (clientEmail,clientName,formLink, companyAssigned)=>{
    console.log("sending email", clientEmail,clientName,formLink, companyAssigned);
    let templateId = ""
    let emailFrom= ""
    if(companyAssigned === "Venturesome"){
        templateId = VENTURESOME_TEMPLATE_ID
        emailFrom= "office@venturesome.ch"
    }else if(companyAssigned === "MoneyTree"){
        templateId  = MONEYTREE_TEMPLATE_ID
        emailFrom = "office@moneytree.ch"
    }
  
    const msg =  {
        from:emailFrom,
        templateId: templateId,
        personalizations: [
            {
                to:[
                    {
                        email:clientEmail
                    }
                ],
                dynamic_template_data:{
                    "companyAssigned": companyAssigned,
                    "name":clientName,
                    "formLink":formLink
                }

            }
      
        ]
    }
    try {
        return sgMail.send(msg)
    } catch (error) {
        console.log("error on sendgrip api",error);
    }
} 

module.exports.sendOnboardingEmail = sendOnboardingEmail