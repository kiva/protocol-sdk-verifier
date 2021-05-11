describe("The Verification", () => {

    before(() => {
        cy.visit('/');
        cy.contains('Accept').click();
        cy.wait(1000);
    });

    // TODO: Decouple these tests from CSS selectors
    it('opens immediately when the application loads', () => {
        cy.get('.VerificationRequirement.screen').should('exist');
    });

    it('advances to the Authentication Options Menu when user Accepts', () => {
        cy.contains('Continue').click();
        cy.get('#auth_options').should('be.visible');
    });
});
