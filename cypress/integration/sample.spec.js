///<reference types="Cypress"/>
describe("My First Test", function() {
	it("Visits the Kitchen Sink", function() {
		cy.visit("http://localhost:3000/home")
		cy.contains("112").click()
	})
})
