import axios from 'axios';
import map from "lodash/map";
import startCase from "lodash/startCase";

import Fingers from "../../constants/fingers";
import I18n from "./I18n";

import { KYCErrorHandlerConf } from "../interfaces/UtilInferfaces"

export class KYCErrorHandler {
    private conf: KYCErrorHandlerConf;
    private errorCodes: any;

    static init(conf: KYCErrorHandlerConf): KYCErrorHandler {
        return new KYCErrorHandler(conf);
    }

    constructor(conf: KYCErrorHandlerConf) {
        this.conf = conf;
        this.errorCodes = {
            Fingerprint: {
                "NetworkAborted": I18n.getKey('NETWORKABORTED_ERROR'),
                "SDKAccessDenied": I18n.getKey('SDKACCESSDENIED_ERROR'),
                "NoCitizenFound": I18n.getKey('NOCITIZENFOUND_ERROR'),
                "FingerprintNoMatch": I18n.getKey('FP_NO_MATCH'),
                "FingerprintLowQuality": I18n.getKey('FP_LOW_QUALITY'),
                "FingerprintMissingNotCaptured": I18n.getKey('FP_NOT_CAPTURED'),
                "FingerprintMissingUnableToPrint": I18n.getKey('FP_CANT_PRINT'),
                "FingerprintMissingAmputation": I18n.getKey('FP_AMPUTEE'),
                "InvalidFilters": I18n.getKey('INVALIDFILTERS_ERROR'),
                "ServiceError": I18n.getKey('SVC_ERROR'),
                "InternalServerError": I18n.getKey('500_ERROR'),
                "RegistryConnectionError": I18n.getKey('CONNECTION_ERROR'),
                "InvalidData": I18n.getKey('INVALID_DATA_ERROR'),
                "PDFGenerationError": I18n.getKey('PDFGEN_ERROR'),
                "InvalidDataFormat": I18n.getKey('INVALID_FORMAT_ERROR')
            },
            SMS: {
                "NoCitizenFound": I18n.getKey('NOCITIZENFOUND_ERROR'),
                "NetworkAborted": I18n.getKey('NETWORKABORTED_ERROR'),
                "PhoneNumberNoMatch": I18n.getKey('NO_PHONE_NUMBER'),
                "OtpNoMatch": I18n.getKey('OTP_NO_MATCH'),
                "OtpExpired": I18n.getKey('OTP_EXPIRED'),
                "SmsSendFailed": I18n.getKey('SMS_SEND_FAILED')
            },
            Face: {}
        };
    }

    determineError = (errorObject: any): string => {
        switch (this.conf.auth_method) {
        case 'Fingerprint':
            return this.determineFpError(errorObject);
        case 'SMS':
            return this.determineSMSError(errorObject);
        case 'Face':
        default:
            return '';
        }
    };

    createErrorString = (errorCode: string, errorObject: any, options: any): string => {
        const e = errorObject.response.data;

        if (e.details
            && e.hasOwnProperty
            && e.hasOwnProperty('details')
            && e.details.hasOwnProperty('bestPositions')
            && e.details.bestPositions.length) {
            const bestFingers: string[] = this.getBestFpPositions(e.details.bestPositions);
            const fingers: string = this.joinFingers(bestFingers);
            return I18n.computeKey({ fingers }, 'FP_NO_MATCH_SUGGESTIONS');
        }

        if (!errorCode.length || !options.hasOwnProperty(errorCode)) {
            return I18n.getKey('UNKNOWN_ERROR');
        }

        return options[errorCode];
    };

    joinFingers(fpArray: string[]): string {
        let fingerString, numFingers = fpArray.length;

        if (numFingers === 1) {
            fingerString = fpArray[0];
        } else {
            fpArray[numFingers - 1] = `${I18n.getKey('OR')} ${fpArray[numFingers - 1]}`;
            fingerString = fpArray.join(", ");
        }

        return fingerString;
    }

    explainError(error: any): string {
        const reason: string | boolean = this.determineError(error);
        const errorOptions = this.errorCodes[this.conf.auth_method];

        return this.createErrorString(reason, error, errorOptions);
    }

    normalizeErrorCode(code: string): string {
        const pieces = code.split("_");
        if (pieces.length === 1) {
            return code;
        }
        return map(pieces, x => {
            return startCase(x.toLowerCase());
        }).join("");
    }

    // TODO: Make a common method that determineSMSError and determineFpError can draw upon, we're violating DRY
    determineSMSError(errorObject: any): string {
        let errorCode = "";

        if (!errorObject.hasOwnProperty("response") || !errorObject.response) {
            errorCode = "NetworkAborted";
        } else {
            errorCode = this.normalizeErrorCode(errorObject.response.data.code);
        }

        return errorCode;
    }

    determineFpError(errorObject: any): string {
        let errorCode = "";
        if (axios.isCancel(errorObject)) {
            console.log(errorObject.message);
            errorCode = "Cancel";
        }

        if (!errorObject.hasOwnProperty("response") || !errorObject.response) {
            errorCode = "NetworkAborted";
        } else {
            if (errorObject.response.hasOwnProperty("status")
                && errorObject.response.status === 401) {
                errorCode = "SDKAccessDenied";
            } else {
                errorCode = this.normalizeErrorCode(errorObject.response.data.code);
            }
        }

        return errorCode;
    }


    getBestFpPositions(posArr: string[]): string[] {
        let counter = 0,
            stringParts = [];

        while (counter < 3 && !!posArr.length) {
            let pos = posArr.shift();
            pos && stringParts.push('<span class="bold">' + Fingers[pos]['name'] + '</span>');
            counter++;
        }
        return stringParts;
    }
}