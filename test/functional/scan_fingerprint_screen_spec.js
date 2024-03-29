import { v4 as uuid4 } from "uuid";

const ekycData = {
    voterId: "8675309",
    lastName: "Lastname",
    firstName: "Firstname",
    gender: "Male",
    birthDate: "31-08-2019",
    occupation: "Account Officer",
    birthPlace: "Hospital",
    residentialAddress: "123 Fake Street",
    permanentAddress: "123 Fake Street",
    maritalStatus: "Married",
    motherFirstName: "MFirstname",
    motherLastName: "MLastname",
    fatherFirstName: "FFirstname",
    fatherLastName: "FLastname",
    nationalIssueDate: "31-07-2019",
    ekycId: uuid4(),
    middleName: "Peligroso",
    nationalId: "FAKEFAKE",
    voterIssueDate: "01-01-2020",
    phoneNumber: "8675309"
}

let scannerData;

describe('The ScanFingerprint screen', function () {
    before(() => {
        cy.fpScanIntercept();
        cy.fixture('growly.png', 'base64').then(image => {
            ekycData["photo~attach"] = image;
        });
        cy.fixture('growly.png', 'base64').then(image => {
            ekycData["signature~attach"] = image;
        });
        cy.fixture("kiva_agent.json").then(info => {
            let common = info.common,
                fetchProofs = info.fetchProofOptions;
            cy.intercept(fetchProofs.method, fetchProofs.endpoint, {
                ...common,
                body: fetchProofs.success
            });
        });
        cy.visit('/');
        cy.contains('Accept').click();
        cy.contains('Continue').click();
        cy.selectAuthMenuItem().eq(2).click();
        cy.get('#select-auth-method').click();
        cy.get('[data-cy="id-input"] input').type('T3STUS3R{enter}');
        cy.wait('@scannerData').then(function (data) {
            scannerData = data.response.body;
        });
    });

    it('renders the "In Progress" icon on load', function () {
        cy.get('[data-cy="fp-image"]', { timeout: 500 }).should('be.visible');
    });

    // TODO: This doesn't actually verify the fpImage was reset. That functionality will have to be tested in integration.
    it('correctly resets the screen when "Recapture Fingerprint" is clicked', function () {
        cy.fpScanIntercept(200);
        cy.fixture('scanImages/np_fingerprint_inprogress.png', 'base64').then(function (b64) {
            this.b64 = b64;
        });
        cy.get('[data-cy="recapture-fp"]', { timeout: 500 }).click();
        cy.get('[data-cy="fp-image"]', { timeout: 500 }).should(el => {
            expect(el.attr('src')).to.eq('data:image/png;base64,' + this.b64);
        });
        cy.wait(200);
    });

    it('correctly re-renders the fingerprint "Success" icon when captured by the scanner', function () {
        cy.get('[data-cy="fp-image"]', { timeout: 500 }).should(el => {
            expect(el.attr('src')).to.eq('/static/media/np_fingerprint_verified.5092a6d6.png');
        });
    });

    it('correctly discards the fingerprint image when "Back" is clicked', function () {
        cy.fpScanIntercept(500);
        cy.fixture('scanImages/np_fingerprint_inprogress.png', 'base64').then(function (b64) {
            this.b64 = b64;
        });
        cy.get('.back', { timeout: 500 }).click();
        cy.get('#scan-fingerprint', { timeout: 500 }).click();
        cy.get('[data-cy="fp-image"]', { timeout: 500 }).should(el => {
            expect(el.attr('src')).to.eq('data:image/png;base64,' + this.b64);
        });
        cy.wait(500);
    });

    it('responds correctly when the scanner responds with FR_NOT_CAPTURED', function () {
        cy.intercept('GET', '**/EKYC/**', {
            success: false,
            error: 'FR_NOT_CAPTURED',
        });
        cy.get('[data-cy="recapture-fp"]', { timeout: 500 }).click();
        cy.get('[data-cy="fp-image"]', { timeout: 500 }).should(el => {
            expect(el.attr('src')).to.eq('/static/media/np_fingerprint_failed.eec8baf9.png');
        });
    });

    it('renders the FingerSelection screen when "Use a different finger" is clicked', function () {
        cy.get('[data-cy="select-new-finger"]', { timeout: 500 }).click();
        cy.get('.FingerContainer').should('be.visible');

        // It worked? Cool, let's go back (and set the scanner data correctly again)
        cy.fpScanIntercept();
        cy.get('[data-cy="back"]', { timeout: 500 }).click();
    });

    it('rejects invalid fingerprint data', function () {
        cy.intercept('POST', '**/v2/**/api/guardian/verify', {
            statusCode: 418,
            delay: 1000,
            body: {
                code: "NO_CITIZEN_FOUND"
            }
        });
        // wait briefly for actionability of the button
        cy.wait(200);
        cy.get('.next').click();
        cy.get('#dialog-box h2').contains('Verifying').should('be.visible');
        cy.get('.dialog-icon.error').should('be.visible');
        cy.get('.DialogBodyErrorMessage').should('contain', 'No record found. Please use an alternative KYC process.');
    });

    it('closes the dialog box when you click outside of it', function () {
        cy.get('[data-cy="dialog-container"]', { timeout: 500 }).click(1, 1);
        cy.get('#dialog-box', { timeout: 500 }).should('not.exist');
    });

    it.skip('correctly handles the High Quality FP data, if available', function () {
        cy.intercept('POST', '**/v2/**/api/guardian/verify', {
            statusCode: 400,
            delay: 500,
            body: {
                code: "FINGERPRINT_NO_MATCH",
                message: "Fingerprint did not match stored records for citizen supplied through filters",
                details: {
                    bestPositions: [
                        2,
                        3,
                        4,
                        5
                    ]
                }
            }
        });
        cy.wait(500);
        cy.get('.next').click();
        cy.get('.DialogBodyErrorMessage').should('contain', 'The fingerprint captured did not match the stored records. Please try again using the Right Index, Right Middle, or Right Ring finger positions.');
    });

    it('closes the error dialog when you click Continue', function () {
        cy.intercept('POST', '**/v2/**/api/guardian/verify', {
            statusCode: 418,
            delay: 500,
            body: {
                code: "NO_CITIZEN_FOUND"
            }
        });
        // wait briefly for actionability of the button
        cy.get('.next').click();
        cy.wait(200);
        cy.get('[data-cy="dialog-button"]').click();
        cy.get('#dialog-box', { timeout: 500 }).should('not.exist');
    });

    it('allows you to cancel if the request is taking too long', function () {
        cy.intercept('POST', '**/v2/**/api/guardian/verify', {
            statusCode: 418,
            delay: 15000,
            body: {
                code: "#cancelled"
            }
        });
        cy.get('.next').click();
        cy.wait(10500);
        cy.get('[data-cy="cancel"]').click();
        cy.get('#dialog-box').should('not.exist');
    });

    it('allows you to continue processing the request if you want to', function () {
        cy.intercept('POST', '**/v2/**/api/guardian/verify', {
            statusCode: 418,
            delay: 12000,
            body: {
                code: "#cancelled"
            }
        })
        cy.get('.next').click();
        cy.wait(10500);
        cy.get('[data-cy="continue"]').click();
        cy.get('#dialog-box').should('be.visible');
        cy.get('[data-cy="dialog-button"]').click();
    });

    it('successfully validates valid data', function () {
        cy.intercept('POST', '**/v2/**/api/guardian/verify', {
            statusCode: 200,
            body: ekycData
        })
        cy.get('.next', { timeout: 500 }).click();
        cy.wait(400);
        cy.get('.DialogBody h2').contains('Identity Verified').should('be.visible');
        cy.get('.dialog-icon.verified').should('be.visible').then(function () {
            // simulate the timeout for closing the success dialog
            cy.wait(1000);
        });
    });

    it('moves to the "Details" screen after the timeout', function () {
        cy.get('[data-cy="details"]', { timeout: 500 }).should('be.visible');
    });
})