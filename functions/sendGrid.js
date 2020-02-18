const sgMail = require("@sendgrid/mail")
sgMail.setApiKey(process.env.SG_API_KEY)
require("dotenv").config()
/* const VENTURESOME_TEMPLATE_ID = "d-61e27a20903f47f7bb06b49b12710526"
const MONEYTREE_TEMPLATE_ID = "d-e1874833f3814ed0a1b8b540f18f24ba" */

const sendOnboardingEmail = async (
	contactEmail,
	contactFirstName,
	formLink,
	companyAssigned,
	pmObj,
	smObj
) => {
	let emailFrom = ""

	let noun = ""

	if (companyAssigned === "VENTURESOME") {
		emailFrom = "office@venturesome.ch"
	} else if (companyAssigned === "moneytree") {
		emailFrom = "office@moneytree.ch"
	}
	if (!!pmObj.phone && pmObj.phone.toLowerCase() === "female") {
		noun = "Sie"
	} else {
		noun = "Er"
	}
	const pmFirstName = pmObj.name.split(" ")[0]
	const msg = {
		from: emailFrom,
		templateId: "d-2f1aadef566b4c07a4602ed01b136e9b",
		personalizations: [
			{
				to: [
					{
						email: contactEmail
					}
				],
				dynamic_template_data: {
					companyAssigned: companyAssigned,
					contactFirstName: contactFirstName,
					formLink: formLink,
					image: pmObj.photo,
					pmName: pmObj.name,
					pmFirstName: pmFirstName,
					pmEmail: pmObj.email,
					pmMobile: pmObj.mobile,
					pmTitle: pmObj.title,
					smTitle: smObj.title,
					smPhoto: smObj.photo,
					smName: smObj.name,
					smEmail: smObj.email,
					smMobile: smObj.mobile,
					erSie: noun
				}
			}
		]
	}
	try {
		console.log("msg before sending", msg)
		return sgMail.send(msg)
	} catch (error) {
		console.log("error on sendgrip api", error)
	}
}
const sendErrorEmail = async (functionName, action, error) => {
	const msg = {
		from: "carlosmoyanor@gmail.com",
		templateId: "d-beb51d7ed6d7453fbd6c9f263c3e478f",
		personalizations: [
			{
				to: [
					{
						email: "carlosmoyanor@gmail.com"
					}
				],
				dynamic_template_data: {
					appName: "Venturesome Automation",
					functionName: functionName,
					action: action,
					createdAt: new Date(),
					error: error
				}
			}
		]
	}
	try {
		return sgMail.send(msg)
	} catch (error) {
		console.log("error on sendgrip api", error)
	}
}

module.exports.sendOnboardingEmail = sendOnboardingEmail
module.exports.sendErrorEmail = sendErrorEmail
