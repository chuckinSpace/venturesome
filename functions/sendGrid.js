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
	contactEmail,
	contactFirstName,
	formLink,
	companyAssigned,
	pmObj,
	smObj
) => {
	let templateId = ""
	let emailFrom = ""
	let logo = ""
	if (companyAssigned === "Venturesome") {
		templateId = VENTURESOME_TEMPLATE_ID
		emailFrom = "office@venturesome.ch"
		logo =
			"https://firebasestorage.googleapis.com/v0/b/venturesome-f6c40.appspot.com/o/Logos%2FVENTURESOME-Favicon%20(1).png?alt=media&token=9b4517ab-fe2f-40ff-8996-aca06ea63477"
	} else if (companyAssigned === "MoneyTree") {
		templateId = MONEYTREE_TEMPLATE_ID
		emailFrom = "office@moneytree.ch"
		logo =
			"https://firebasestorage.googleapis.com/v0/b/venturesome-f6c40.appspot.com/o/Logos%2Fmt-high-color-pos%20(1).png?alt=media&token=e5e3fc2f-f846-4348-94f4-6a378f04be15"
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
					pmName: pmObj.name,
					pmFirstName: pmFirstName,
					pmEmail: pmObj.email,
					pmMobile: pmObj.mobile,
					pmPhone: pmObj.phone,
					image: pmObj.photo,
					logo: logo,
					smPhoto: smObj.photo,
					smName: smObj.name,
					smEmail: smObj.email,
					smPhone: smObj.phone,
					smMobile: smObj.mobile
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
	const string = "Carlos Moyano"
	const array = string.split(" ")[0]
	console.log(array)
}
/* test() */

module.exports.sendOnboardingEmail = sendOnboardingEmail
