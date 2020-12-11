import {PIImap} from "./ConfirmationProps";
import {AuthOption} from "./AuthOptionInterfaces";

export interface Constants {
    verification_options: AuthOption[],
    permittedOrigins: string,
    permittedOriginPatterns?: string,
    pii_map: PIImap,
    isProd?: boolean,
    direction: string,
    agent_port: string,
    headerImage: string,
    controllerUrlBase: string,
    auth_endpoints?: EndpointsMap,
    phoneIntls?: CountryCodeConfig,
    permittedOpenerOrigins: string[]
}

export interface MessageMap {
    [index: string]: string
}

interface EndpointsMap {
    [index: string]: string
}

interface CountryCodeConfig {
    only: boolean,
    countries: string[];
}
