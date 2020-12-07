import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import I18n from '../utils/I18n';
import BaseAgent from './BaseAgent';

import {IAgent} from '../interfaces/AgentInterfaces';
import {PIImap} from '../interfaces/ConfirmationProps';

import {CONSTANTS} from '../../constants/constants';

const PII: PIImap = CONSTANTS.pii_map;

export default class KivaAgent extends BaseAgent implements IAgent {
    public axiosInstance: AxiosInstance;
    private _connectionId?: string;
    private _verificationId?: string;

    static init(): KivaAgent {
        return new KivaAgent();
    }

    constructor() {
        super();
        const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlJrTXpRVEEyUkRrMVJqSTBOVEUyTlVZNU1rTkJRekF6TWtGRU4wSTROalk1T0RreVFqVkJNZyJ9.eyJpc3MiOiJodHRwczovL2tpdmEtcHJvdG9jb2wuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDVlNDQ0OGJmZWQ0NmM0MGU3ZjkxMWQwMCIsImF1ZCI6WyJodHRwczovL2tpdmEtcHJvdG9jb2wuYXV0aDAuY29tL2FwaS92Mi8iLCJodHRwczovL2tpdmEtcHJvdG9jb2wuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTYwNzEwNzY3MywiZXhwIjoxNjA3MTk0MDczLCJhenAiOiI3TkhwVHl5SDZ5UlBQdTZ2T0NFZE5SU213T1BGS2tsRCIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwgYWRkcmVzcyBwaG9uZSByZWFkOmN1cnJlbnRfdXNlciB1cGRhdGU6Y3VycmVudF91c2VyX21ldGFkYXRhIGRlbGV0ZTpjdXJyZW50X3VzZXJfbWV0YWRhdGEgY3JlYXRlOmN1cnJlbnRfdXNlcl9tZXRhZGF0YSBjcmVhdGU6Y3VycmVudF91c2VyX2RldmljZV9jcmVkZW50aWFscyBkZWxldGU6Y3VycmVudF91c2VyX2RldmljZV9jcmVkZW50aWFscyB1cGRhdGU6Y3VycmVudF91c2VyX2lkZW50aXRpZXMiLCJndHkiOiJwYXNzd29yZCJ9.iAvPZ4rk5r27ibgpqH1nVHhquXPGUDi5L8wPunGQa6eQbCZQHsVIyAByHkheNhSsw9weYWXXjkIoCOFDsA5JHvj99-lsDNUNfoZu5vweBB0rgQETOHyK2bEWy9Z-mYo5sz1wZ7n6LHiqd6fzG5J3nV3A98VmQ94395WBoRjVI2g6Q10HDfXVkwmUaQlY_XKLQWjNv8dW8mZz_RbCZXIbwdfHKdqdlcluoDE40FFcSY4iR2xoNoOXvAN-oDypGwpnrFv-gfFBKUqwDlyEmavVe8queNkpPqcwWjAuh81_XLNeaZimDuPFjEJnDkGpz-7g1W7_bd1X8H8mOLft84VBOw';
        const config: any = {
            baseURL: CONSTANTS.controllerUrlBase,
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        };
        const axiosConfig: AxiosRequestConfig = config;
        this.axiosInstance = axios.create(axiosConfig);

    }

    isConnected(response: any): boolean {
        const state: string = response.state;
        if (state === "response" || state === "active") {
            return true;
        }
        return false;
    }

    isVerified(response: any): boolean {
        if (response.state === "verified") {
            return true;
        }
        return false;
    }

    formatProof(response: any): void {
        // TODO: Define an actual credential schema structure so that we can know that we're mapping data to actual PII map keys
        const proof: any = {};
        for (let key in response) {
            let k: string = PII[key].alternateKey || key;
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

    sendVerification = async (connectionId: string): Promise<string> => {
        return super.send(
            this.axiosInstance.post('/v2/kiva/api/verify', {
                connectionId: this._connectionId,
                profile: "employee.proof.request.json"
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

// TODO: Implement verification interfaces
// TODO: Actually use these
interface ConnectionInviteResponse {
    connection_id: string,
    invitation: ConnectionInvitation,
    invitation_url: string
}

interface ConnectionInvitation {
    "@type": string,
    "@id": string,
    serviceEndpoint: string,
    recipientKeys: string[],
    label: string
}

interface ConnectionStatus {
    connectionId: string,
    routingState: string,
    initiator: string,
    invitation_mode: string,
    updated_at: string,
    state: string,
    invitation_key: string,
    accept: string,
    created_at: string
}
