import { CredentialKeyMap } from "./ConfirmationProps";
import { AuthOption } from "./AuthOptionInterfaces";

export interface Constants {
    verification_options: AuthOption[],
    permittedOrigins: string,
    permittedOriginPatterns?: string,
    credentialKeyMap: CredentialKeyMap,
    isProd?: boolean,
    direction: string,
    agent_port: string,
    headerImage: string,
    controllerUrlBase: string,
    auth_endpoints?: EndpointsMap,
    phoneIntls?: CountryCodeConfig,
    permittedOpenerOrigins: string[],
    credentialProof: any,
    slowInternetThreshold?: number
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
