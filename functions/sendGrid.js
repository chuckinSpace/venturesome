const sgMail = require("@sendgrid/mail")
sgMail.setApiKey(process.env.SG_API_KEY)
require("dotenv").config()
const VENTURESOME_TEMPLATE_ID = "d-61e27a20903f47f7bb06b49b12710526"
const MONEYTREE_TEMPLATE_ID = "d-e1874833f3814ed0a1b8b540f18f24ba"

/* Venturesome ig http://instagram.com/venturesomemedia/
			linkedIn https://www.linkedin.com/company/venturesomemedia/

			moneytree ?
*/

const sendOnboardingEmail = async (
	clientEmail,
	contactName,
	formLink,
	companyAssigned
) => {
	console.log(
		"sending email",
		clientEmail,
		contactName,
		formLink,
		companyAssigned
	)
	let templateId = ""
	let emailFrom = ""
	if (companyAssigned === "Venturesome") {
		templateId = VENTURESOME_TEMPLATE_ID
		emailFrom = "office@venturesome.ch"
	} else if (companyAssigned === "MoneyTree") {
		templateId = MONEYTREE_TEMPLATE_ID
		emailFrom = "office@moneytree.ch"
	}

	const msg = {
		from: emailFrom,
		templateId: templateId,
		personalizations: [
			{
				to: [
					{
						email: clientEmail
					}
				],
				dynamic_template_data: {
					companyAssigned: companyAssigned,
					contactName: contactName,
					formLink: formLink,
					image:
						"https://firebasestorage.googleapis.com/v0/b/venturesome-f6c40.appspot.com/o/Nick.png?alt=media&token=3b3e7ec3-3827-4ca2-bfe4-75671d0b04a1"
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
const test = async () => {
	try {
		await sendOnboardingEmail(
			"carlosmoyanor@gmail.com",
			"test Client",
			"asd",
			"Venturesome"
		)
	} catch (error) {
		console.log(error)
	}
}
/* test() */
module.exports.sendOnboardingEmail = sendOnboardingEmail
