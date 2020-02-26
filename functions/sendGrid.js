const sgMail = require("@sendgrid/mail")
sgMail.setApiKey(process.env.SG_API_KEY)
require("dotenv").config()

const sendOnboardingEmail = async (
	contactEmail,
	contactFirstName,
	formLink,
	companyAssigned,
	pmObj,
	smObj
) => {
	let emailFrom = ""
	let projectOrAccount = ""
	let noun = ""
	let lineColor = ""
	let eurenEure = ""
	let templateId = ""
	if (pmObj.id === smObj.id) {
		templateId = "d-a7ff85405c504132bed16f33aa034878"
	} else {
		templateId = "d-2f1aadef566b4c07a4602ed01b136e9b"
	}
	if (companyAssigned === "VENTURESOME") {
		if (!!pmObj.phone && pmObj.phone.toLowerCase() === "female") {
			projectOrAccount = "Projektmanagerin"
			noun = "Sie"
			eurenEure = "eure zuständige"
		} else {
			projectOrAccount = "Projektmanager"
			noun = "Er"
			eurenEure = "euren zuständigen"
		}
		emailFrom = "office@venturesome.ch"
		lineColor = "#2CB4FF"
	} else if (companyAssigned === "moneytree") {
		if (!!pmObj.phone && pmObj.phone.toLowerCase() === "female") {
			projectOrAccount = "Account Managerin"
			noun = "Sie"
			eurenEure = "eure zuständige"
		} else {
			projectOrAccount = "Account Manager"
			noun = "Er"
			eurenEure = "euren zuständigen"
		}
		emailFrom = "office@moneytree.ch"
		lineColor = "#36CE78"
	}

	const pmFirstName = pmObj.name.split(" ")[0]
	const msg = {
		from: emailFrom,
		templateId: templateId,
		personalizations: [
			{
				to: [
					{
						email: contactEmail
					}
				],
				bcc: [
					{
						email: "carlos.moyano@venturesome.ch"
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
					erSie: noun,
					projectOrAccount: projectOrAccount,
					lineColor: lineColor,
					eurenEure: eurenEure
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

const onboardingNotification = async client => {
	const msg = {
		from: "carlosmoyanor@gmail.com",
		templateId: "d-a2fa7ae779364e6ba75dcf0f62d47b7b",
		personalizations: [
			{
				to: [
					{
						email: "carlosmoyanor@gmail.com"
					}
				],
				dynamic_template_data: {
					client: { client }
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
module.exports.onboardingNotification = onboardingNotification
