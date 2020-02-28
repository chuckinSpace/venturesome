var firebase = require("../firebase")

const admin = require("firebase-admin")
const db = admin.firestore()

describe("firebase", () => {
	describe("getClientId()", () => {
		test("get next Id from firebase", async () => {
			expect.assertions(1)
			let lastNumber = 0

			try {
				const querySnapshot = await db
					.collection("clients")
					.orderBy("idNumber", "desc")
					.limit(1)
					.get()

				querySnapshot.forEach(
					doc => (lastNumber = parseInt(doc.data().idNumber))
				)
			} catch (error) {
				console.log(error)
			}
			const result = await firebase.getClientId()
			expect(parseInt(result)).toBe(parseInt(lastNumber + 1))
		})
	})
	describe("checkNewContact()", () => {
		test("return an itemId if passed an existing email AND clientnumber on mondayObj", async () => {
			const mondayObj = { email: "igor.bilic@primework.ch", clientId: "112" }
			const result = await firebase.checkNewContact(mondayObj)

			expect(result).result.found.toBe(true)
			expect(result).result.itemId.toBeTruthy()
			expect(result).toBeGreaterThan(0)
		})
		test("return falsy if passed email not previously in the database for that client ", async () => {
			const mondayObj = { email: "carlosmoyanor@gmail.com", clientId: "112" }
			const result = await firebase.checkNewContact(mondayObj)
			expect(result).toBeFalsy()
		})
		test("return falsy if passed clienId but no email on mondayObj ", async () => {
			const mondayObj = { email: "", clientId: "112" }
			const result = await firebase.checkNewContact(mondayObj)
			expect(result).toBeFalsy()
		})
		test("return false if passed email but not clientId on mondayObj", async () => {
			const mondayObj = { email: "igor.bilic@primework.ch", clientId: "" }
			const result = await firebase.checkNewContact(mondayObj)
			expect(result).toBeFalsy()
		})
		test("return false if passed mondayObj === null ", async () => {
			const mondayObj = undefined
			const result = await firebase.checkNewContact(mondayObj)
			expect(result).toBeFalsy()
		})
	})
})
