const translator = require('@boost/translate');
const fs = require('fs-extra');

const messageMap = {
    // Site specific items
    SITE_TITLE: "DeployKeys.title",
    AUTH_AGENCY: "DeployKeys.authAgency",
    AGENCY_ACRONYM: "DeployKeys.authAgencyAcronym",
    // Default items
    BACK: "Standard.back",
    ACCEPT: "Standard.accept",
    VERIFY: "Standard.verify",
    CONTINUE: "Standard.continue",
    POWERED_BY: "Standard.poweredBy",
    // Confirmation Screen
    AGREEMENT_1: "ConfirmationScreen.text.agreement-1",
    AGREEMENT_2: "ConfirmationScreen.text.agreement-2",
    INFO_INCLUDES: "ConfirmationScreen.text.infoShareIncludes",
    REVIEW: "ConfirmationScreen.text.pleaseReview",
    // Error Messages
    NO_INVITE_URL: "Errors.qr.noInviteUrl",
    QR_CONNECTION_ERROR: "Errors.qr.connectionError",
    QR_NO_CONNECTION_NOTIFY: "Errors.qr.notConnected",
    QR_NOT_FOUND: "Errors.qr.noConnectionFound",
    NO_EMAIL: "Errors.email.noInput",
    // QR Code
    RETRIEVING_QR: "QR.text.retrieving",
    SCAN_QR: "QR.text.scanQR",
    CONNECTION_ESTABLISHED: "QR.text.connected",
    RESET_FLOW: "QR.text.resetConnection",
    // User Details
    EXPORT_PROFILE: "UserDetails.buttons.exportProfile",
    PRINT_PROFILE: "UserDetails.buttons.printProfile",
    // Email
    EMAIL_INSTRUCTIONS: "Email.text.instructions"
};

class MessageBuilder {
    static init(locale, requiredMessages = false) {
        return new MessageBuilder(locale, MessageBuilder);
    }

    constructor(locale, requiredMessages) {
        this.locale = locale;
        this.fallbacks = this.createFallbacks(locale);
        this.messages = messageMap;
        this.translator = translator.createTranslator(['default'], __dirname + '/../language', {
            locale,
            fallbackLocale: this.fallbacks,
            resourceFormat: 'json',
            autoDetect: false
        });
    }

    getMessages() {
        return this.messages;
    }

    limitMessagesTo(requiredMessages) {
        this.messages = this.pruneTo(requiredMessages);
    }

    // TODO: Make this more elegant
    createFallbacks(locale) {
        const localeParts = locale.split('-');
        const fallbacks = [];

        // Don't need the last index for fallbacks, because that's covered in 'locale'
        localeParts.pop();

        while (localeParts.length) {
            let fallback = localeParts.join('-');
            fallbacks.push(fallback);

            localeParts.pop();
        }
        return fallbacks;
    }

    pruneTo(messageList) {
        for (let k in messageMap) {
            if (messageList.indexOf(k) === -1) {
                delete messageMap[k];
            }
        }
        return messageMap;
    }

    buildMessages() {
        this.translate();
    }

    translate() {
        for (let k in this.messages) {
            // Could also just use spread syntax to make the dot-notation values the keys
            // This would mean that we didn't need to change the keys used in the app if we ever
            // wanted to do this at runtime
            this.messages[k] = this.translator(this.messages[k], null, {
                skipInterpolation: true
            });
        }
    }
}

module.exports = MessageBuilder;