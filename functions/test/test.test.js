var firebase = require("../firebase")

/* const testEnv = functions(
	{
		storageBucket: "automation-dev-7807f.appspot.com",
		databaseURL: "https://automation-dev-7807f.firebaseio.com",
		projectId: "automation-dev-7807f"
	},
	"./automationKey.json"
) */

describe("firebase", () => {
	test("get last Id Id from firebase", async () => {
		const client = await firebase.getClientId()
		expect(client).toBeDefined()
		expect(client).toBeTruthy()
	})
})
