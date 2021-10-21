const translator = require('@boost/translate');
const fs = require('fs-extra');

const messageMap = {
    // Site specific items
    SITE_TITLE: "DeployKeys.title",
    AUTH_AGENCY: "DeployKeys.authAgency",
    AGENCY_ACRONYM: "DeployKeys.authAgencyAcronym",
    // Default items
    BACK: "Standard.back",
    NEXT: "Standard.next",
    ACCEPT: "Standard.accept",
    VERIFY: "Standard.verify",
    VERIFYING: "Standard.verifying",
    CONTINUE: "Standard.continue",
    POWERED_BY: "Standard.poweredBy",
    SCAN_FP: "Standard.scanFp",
    REQUIRED: "Standard.required",
    // Confirmation Screen
    AGREEMENT_1: "ConfirmationScreen.text.agreement-1",
    AGREEMENT_2: "ConfirmationScreen.text.agreement-2",
    INFO_INCLUDES: "ConfirmationScreen.text.infoShareIncludes",
    REVIEW: "ConfirmationScreen.text.pleaseReview",
    // PII
    NATIONAL_ID: "PII.nationalId",
    VOTER_ID: "PII.voterId",
    VOTER_ID_ISSUE: "PII.voterIdIssueDate",
    FIRSTNAME: "PII.firstName",
    LASTNAME: "PII.lastName",
    DOB: "PII.birthDate",
    JOB: "PII.job",
    PHONE: "PII.phoneNo",
    RES_ADDRESS: "PII.residentialAddress",
    PERM_ADDRESS: "PII.permanentAddress",
    MARRIED: "PII.maritalStatus",
    MOM_NAME: "PII.momsName",
    DAD_NAME_FULL: "PII.dadsName_full",
    SIGNATURE: "PII.signature",
    GIVEN_NAME: "PII.firstName_formal",
    SURNAME: "PII.lastName_formal",
    SEX: "PII.sex",
    // Verification Requirement Screen
    VERIFICATION_REQUIRED: "VerificationRequirementScreen.verificationRequired",
    PLEASE_SELECT: "VerificationRequirementScreen.pleaseSelect",
    // Error Messages
    NO_INVITE_URL: "Errors.qr.noInviteUrl",
    QR_CONNECTION_ERROR: "Errors.qr.connectionError",
    QR_NO_CONNECTION_NOTIFY: "Errors.qr.notConnected",
    QR_NOT_FOUND: "Errors.qr.noConnectionFound",
    PROOFS_ERROR: "Errors.proofs.fetchProofsError",
    NO_EMAIL: "Errors.email.noInput",
    INVALID_OTP_ENTRY: "Errors.input.invalidOTP",
    REJECTED_PROOF: "Errors.qr.rejectedProof",
    // QR Code
    CLICK_VERIFY: "QR.text.clickVerify",
    RETRIEVING_QR: "QR.text.retrieving",
    SCAN_QR: "QR.text.scanQR",
    SCAN_QR_INSTRUCTIONS: "QR.text.scanQRInstructions",
    CONNECTION_ESTABLISHED: "QR.text.connected",
    RESET_FLOW: "QR.text.resetConnection",
    // User Details
    EXPORT_PROFILE: "UserDetails.buttons.exportProfile",
    PRINT_PROFILE: "UserDetails.buttons.printProfile",
    // Email
    EMAIL_INSTRUCTIONS: "Email.text.instructions",
    // DialogBody
    SLOW_INTERNET: "Dialog.text.slowInternetWarning",
    TRY_AGAIN: "Dialog.buttons.tryAgain",
    ID_VERIFIED: "Dialog.text.idVerified",
    // SMS OTP Screen
    ENTER_PHONE_NUMBER: "SMSOTP.text.enterPhoneNumber",
    SMS_OTP_INSTRUCTIONS: "SMSOTP.text.smsOtpInstructions",
    ENTER_OTP: "SMSOTP.text.enterOTP",
    SMS_SENT_TO: "SMSOTP.text.smsSentTo",
    // Details Screen
    PLACE_OF_BIRTH: "PII.birthPlace",
    CREDENTIALING_AGENCY: "UserDetails.credentialingAgency",
    // SearchMenu Screen
    ENTER_MESSAGE: "SearchMenuScreen.text.enterInfo",
    ID_OPTIONS: "SearchMenuScreen.labels.idOptions",
    INPUT_MSG: "SearchMenuScreen.labels.enterInput",
    NIN: "SearchMenuScreen.labels.nationalIdAbbrev",
    ID_UNKNOWN: "SearchMenuScreen.text.unknownId",
    // AlternateSearch Screen
    ALTERNATESEARCH_INSTRUCTIONS: "AlternateSearchScreen.text.fuzzySearchInstructions",
    ENTER_FIRST_LAST: "AlternateSearchScreen.text.enterFirstAndLast",
    ENTER_DOB: "AlternateSearchScreen.text.enterDob",
    ENTER_PARENTS_NAMES: "AlternateSearchScreen.text.enterParentsNames",
    REQUIRED_WO_DOB: "AlternateSearchScreen.text.requiredWithoutDob",
    // FP Reader connection messages
    READER_UNDETECTED: "Errors.retries.readerNotFound",
    PERSISTENT_READER_FAILURE: "Errors.retries.readerStillNotFound",
    // Error Messages
    NATIONAL_ID_INPUT_ERROR: "Errors.input.nationalIdInput",
    VOTER_ID_INPUT_ERROR: "Errors.input.voterIdInput",
    DATE_INPUT_ERROR: "Errors.input.dateInput",
    UNSET_ID_INPUT: "Errors.input.unsetID",
    MISSING_NAMES_ERROR: "Errors.input.missingNames",
    MISSING_FUZZY_DATA_ERROR: "Errors.input.missingFuzzySearchData",
    INPUT_LENGTH_ERROR: "Errors.input.inputLength",
    NETWORKABORTED_ERROR: "Errors.kyc.NetworkAborted",
    SDKACCESSDENIED_ERROR: "Errors.kyc.SDKAccessDenied",
    NOCITIZENFOUND_ERROR: "Errors.kyc.NoCitizenFound",
    FP_NO_MATCH: "Errors.kyc.FingerprintNoMatch",
    FP_NO_MATCH_SUGGESTIONS: "Errors.kyc.FingerprintSuggestions",
    FP_LOW_QUALITY: "Errors.kyc.FingerprintLowQuality",
    FP_NOT_CAPTURED: "Errors.kyc.FingerprintMissingNotCaptured",
    FP_CANT_PRINT: "Errors.kyc.FingerprintMissingUnableToPrint",
    FP_AMPUTEE: "Errors.kyc.FingerprintMissingAmputation",
    INVALIDFILTERS_ERROR: "Errors.kyc.InvalidFilters",
    SVC_ERROR: "Errors.kyc.ServiceError",
    "500_ERROR": "Errors.kyc.InternalServerError",
    CONNECTION_ERROR: "Errors.kyc.RegistryConnectionError",
    INVALID_DATA_ERROR: "Errors.kyc.InvalidData",
    PDFGEN_ERROR: "Errors.kyc.PDFGenerationError",
    INVALID_FORMAT_ERROR: "Errors.kyc.InvalidDataFormat",
    SCANNER_NOT_FOUND: "Errors.desktopTool.scannerNotFound",
    LOGIN_FAILURE: "Errors.desktopTool.loginFailure",
    REQUEST_PENDING: "Errors.desktopTool.deviceInUse",
    UNKNOWN_ERROR: "Errors.unknown",
    INVALID_CREDENTIALS: "Errors.desktopTool.invalidCredentials",
    SMS_SEND_FAILED: "Errors.kyc.SmsSendFailed",
    OTP_NO_MATCH: "Errors.kyc.OtpNoMatch",
    OTP_EXPIRED: "Errors.kyc.OtpExpired",
    NO_PHONE_NUMBER: "Errors.kyc.NoPhoneNumber",
    INVALID_PHONE_NUMBER_INPUT: "Errors.input.missingPhoneNumber",
    NO_REQUEST_NEEDED: "Errors.kyc.NoRequestNeeded",
    // ScanFingerprint Screen
    PLACE_FINGER: "ScanFingerprintScreen.text.placeFinger",
    CHANGE_FINGER: "ScanFingerprintScreen.text.changeFinger",
    RECAPTURE_FINGER: "ScanFingerprintScreen.text.recaptureFinger",
    CHANGE_AUTH_METHOD: "ScanFingerprintScreen.text.cantUseFinger",
    // FingerSelection Screen
    SELECT_NEW_FINGER: "FingerSelectionScreen.text.selectNew",
    LEAVE_FP_SELECT: "FingerSelectionScreen.text.leaveFpSelect",
    // Fingers
    // TODO: Maybe break out the translations into "Left", "Right", and then each finger?
    FINGER: "Fingers.finger",
    LEFT_THUMB: "Fingers.leftThumb",
    LEFT_INDEX: "Fingers.leftIndex",
    LEFT_MIDDLE: "Fingers.leftMiddle",
    LEFT_RING: "Fingers.leftRing",
    LEFT_LITTLE: "Fingers.leftLittle",
    RIGHT_THUMB: "Fingers.rightThumb",
    RIGHT_INDEX: "Fingers.rightIndex",
    RIGHT_MIDDLE: "Fingers.rightMiddle",
    RIGHT_RING: "Fingers.rightRing",
    RIGHT_LITTLE: "Fingers.rightLittle",
    LEFT_THUMB_FULL: "Fingers.leftThumb_full",
    LEFT_INDEX_FULL: "Fingers.leftIndex_full",
    LEFT_MIDDLE_FULL: "Fingers.leftMiddle_full",
    LEFT_RING_FULL: "Fingers.leftRing_full",
    LEFT_LITTLE_FULL: "Fingers.leftLittle_full",
    RIGHT_THUMB_FULL: "Fingers.rightThumb_full",
    RIGHT_INDEX_FULL: "Fingers.rightIndex_full",
    RIGHT_MIDDLE_FULL: "Fingers.rightMiddle_full",
    RIGHT_RING_FULL: "Fingers.rightRing_full",
    RIGHT_LITTLE_FULL: "Fingers.rightLittle_full"
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