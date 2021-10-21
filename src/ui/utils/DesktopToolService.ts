import axios from 'axios';

import I18n from "./I18n";
import { DesktopToolConfig } from "../interfaces/DesktopToolInterfaces";
import { RejectionReport } from "../interfaces/RejectionProps";

const errorMessages: any = {
    'Network Error': I18n.getKey('LOGIN_FAILURE'),
    USER_NOT_LOGGED_IN: I18n.getKey('LOGIN_FAILURE'),
    FR_NOT_FOUND: I18n.getKey('SCANNER_NOT_FOUND'),
    FR_NOT_CAPTURED: I18n.getKey('SCANNER_NOT_FOUND'),
    DEVICE_IN_USE: I18n.getKey('REQUEST_PENDING')
}

export default class DesktopToolService {
    private conf: DesktopToolConfig;

    static init(conf: DesktopToolConfig): DesktopToolService {
        return new DesktopToolService(conf);
    }

    constructor(conf: DesktopToolConfig) {
        this.conf = conf;
    }

    get = (endpoint: string, config?: any): Promise<any> => {
        const reqUrl = this.conf.api + endpoint;
        const conf = config || {};

        return axios.get(reqUrl, conf).then(response => {
            console.log(response);
            if (response.data.hasOwnProperty('success') && !response.data.success) {
                const errorCode = response.data.error || I18n.getKey('UNKNOWN_ERROR');
                throw new Error(errorCode);
            } else {
                return response.data;
            }
        });
    };

    getInfo = (): Promise<any> => {
        return this.get('/EKYC/Info');
    };

    getFingerprint = (): Promise<any> => {
        return this.get('/EKYC/Fingerprint');
    };

    makeDesktopToolRequest = (type: string): Promise<any> => {
        switch (type) {
        case "Fingerprint":
            return this.getFingerprint();
        case "Info":
            return this.getInfo();
        default:
            return Promise.reject(I18n.getKey('UNKNOWN_ERROR'));
        }
    }

    createErrorString(error: any): string {
        if ('string' !== typeof error) {
            error = error.message;
        }

        if (errorMessages.hasOwnProperty(error)) {
            return errorMessages[error];
        }

        return error;
    }

    createErrorReport(error: any): RejectionReport {
        return {
            rejected: true,
            reason: this.createErrorString(error)
        };
    }
}