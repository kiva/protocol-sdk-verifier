import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import I18n from '../utils/I18n';
import BaseAgent from './BaseAgent';
import _ from 'lodash';
import {IAgent} from '../interfaces/AgentInterfaces';
import {CredentialKeyMap} from '../interfaces/ConfirmationProps';
import {ProofRequestProfile} from "../interfaces/VerificationRequirementProps";


import {CONSTANTS} from '../../constants/constants';

const PII: CredentialKeyMap = CONSTANTS.credentialKeyMap;

export default class KivaAgent extends BaseAgent implements IAgent {
    public axiosInstance: AxiosInstance;
    private _connectionId?: string;
    private _verificationId?: string;

    static init(token: string): KivaAgent {
        return new KivaAgent(token);
    }

    constructor(token: string) {
        super();
        const config: any = {
            baseURL: CONSTANTS.controllerUrlBase,
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        };
        const axiosConfig: AxiosRequestConfig = config;
        this.axiosInstance = axios.create(axiosConfig);

    }

    fetchProofOptions() {
        return super.profiles(
            this.axiosInstance.get('/v2/kiva/api/profiles/proofs', {},),
            (profiles: any) => {
                return _.map(profiles.data, (value, key) => {
                    return {
                        schema_id: key,
                        ...value
                    }
                });
            }
        );
    }

    isConnected(response: any): boolean {
        const state: string = response.state;
        if (state === "response" || state === "active") {
            return true;
        }
        return false;
    }

    isVerified(response: any): boolean {
        if (response.state === "verified" && response.verified === "true") {
            return true;
        }
        return false;
    }

    isRejected(response: any): boolean {
        if (response.state === "verified" && response.verified === "false") {
            return true;
        }
        return false;
    }

    formatProof(response: any): void {
        // TODO: Define an actual credential schema structure so that we can know that we're mapping data to actual PII map keys
        const proof: any = {};
        for (let key in response) {
            let k: string = PII[key]?.alternateKey || key;
            proof[k] = response[key].raw;
        }
        return proof;
    }

    getData(axiosData: any) {
        return axiosData.data;
    }

    establishConnection = async (ignore: string) => {
        return super.establish(
            this.axiosInstance.post('/v2/kiva/api/connection', {},),
            (connection: any) => {
                this._connectionId = connection.data.connection_id;
                return btoa(JSON.stringify(connection.data.invitation));
            },
            I18n.getKey('QR_CONNECTION_ERROR')
        );
    }

    getConnection = async (ignore: string) => {
        return super.check(
            this.axiosInstance.get('/v2/kiva/api/connection/' + this._connectionId),
            this.getData,
            I18n.computeKey({
                connectionId: this._connectionId
            }, 'QR_NOT_FOUND')
        );
    }

    checkVerification = async (ignore: string) => {
        return super.prove(
            this.axiosInstance.get('/v2/kiva/api/verify/' + this._verificationId),
            this.getData,
            I18n.getKey('UNKNOWN_ERROR')
        );
    }

    sendVerification = async (connectionId: string, profile: ProofRequestProfile): Promise<string> => {
        return super.send(
            this.axiosInstance.post('/v2/kiva/api/verify', {
                connectionId: this._connectionId,
                profile: profile.schema_id || CONSTANTS.credentialProof
            }),
            (verification: any) => {
                this._verificationId = verification.data.presentation_exchange_id;
                return this._verificationId;
            },
            I18n.getKey('UNKNOWN_ERROR')
        );
    }

    getProof(data: any) {
        return this.formatProof(data.presentation.requested_proof.revealed_attrs);
    }
}
