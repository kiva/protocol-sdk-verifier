// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// TODO: Do we need this?
Cypress.Commands.add("postActionMessage", (stateObject, waitPeriod) => {
    cy.window().then(win => {
        win.postMessage(stateObject, Cypress.env('MESSAGE_TARGET_ORIGIN'));
        // TODO: Tie the waiting period to the response from the FP scanner
        if (waitPeriod) {
            cy.wait(waitPeriod);
        }
    });
});

Cypress.Commands.add("selectAuthMenuItem", () => {
    cy.get('#auth_options .auth_option');
});

Cypress.Commands.add("otpInput", (inputCode) => {
    let i = 0;
    for (i; i < 6; i++) {
        let selector = `[name="otp-digit-${i}"]`;

        cy.get(selector).clear().type(inputCode[i]);
    }
})

Cypress.Commands.add('fpScanIntercept', function (delay) {
    const response = {
        body: {
            FingerprintSensorSerialNumber: "Kiva-Device-Simulator",
            TellerComputerUsername: "MAC",
            success: true
        }
    };
    if (!!delay) {
        response.delay = delay;
    }
    cy.fixture('fingerprint.png', 'base64').then(function (fingerprint) {
        response.body.ImageBase64 = 'data:image/png;base64,' + fingerprint;
        cy.intercept('GET', 'http://localhost:9907/EKYC/Fingerprint', response).as('scannerData');
    });
})
