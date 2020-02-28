const monday = require("../monday")

/* let mondayObj = {
    email: "",
    clientName: "",
    phone: "",
    companyAssigned: "",
    projectName: "",
    pmId: "",
    itemId: "",
    formLink: "",
    pmEmail: "",
    pmName: "",
    slackUsers: [],
    isNewClient: true,
    clientId: "",
    smId: "",
    contactFirstName: "",
    contactLastName: "",
    streetAddress: "",
    zipCode: "",
    city: "",
    country: { countryCode: "", countryName: "" },
    contactPosition: ""
} */

describe("monday", () => {
	describe("getGroupId()", () => {
		test("return an group id from monday when passed a valid itemId", async () => {
			const testItemId = 473646859
			const itemId = await monday.getGroupId(testItemId)
			expect(itemId).toBeTruthy()
		})
		test("return an group id from monday when passed a valid itemId", async () => {
			const testItemId = ""
			const itemId = await monday.getGroupId(testItemId)
			expect(itemId).toBeFalsy()
		})
		test("return an group id from monday when passed a valid itemId", async () => {
			const testItemId = null
			const itemId = await monday.getGroupId(testItemId)
			expect(itemId).toBeFalsy()
		})
	})
})
