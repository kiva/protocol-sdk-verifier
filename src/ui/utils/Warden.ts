import * as constants from "../../constants/variables.json"

const CONSTANTS: any = constants;

export default class Warden {
    static isPermittedPattern(url: string) {
        if (CONSTANTS.default.permittedOriginPatterns) {
            const pattern = new RegExp(CONSTANTS.default.permittedOriginPatterns, "g");
            return !!url.match(pattern);
        }
        return false;
    }

    static isPermittedURL(url: string) {
        let origins: string = CONSTANTS.default.permittedOrigins || '';

        return origins.split(',').indexOf(url) !== -1;
    }

    static certifyOrigin(origin: string) {
        return this.isPermittedURL(origin) || this.isPermittedPattern(origin);
    }
}