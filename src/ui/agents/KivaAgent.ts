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
        const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik5UQTRPRVJGUXpsQ1JVTkdRMEV6TXprNE56TTBOa014UlVSRFJUTkJRakU1UWpGQk5qUkNPUSJ9.eyJpc3MiOiJodHRwczovL2tpdmEtcHJvdG9jb2wtc3RhbmRhbG9uZS5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NWU3ZGYxOTc4YzNmZmMwY2JlMjIxOGI1IiwiYXVkIjpbImh0dHBzOi8va2l2YS1wcm90b2NvbC1zdGFuZGFsb25lLmF1dGgwLmNvbS9hcGkvdjIvIiwiaHR0cHM6Ly9raXZhLXByb3RvY29sLXN0YW5kYWxvbmUuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTYwNjgzNzI5MiwiZXhwIjoxNjA5NDI5MjkyLCJhenAiOiI5dTJZV09COUZQRWE2MjBDSHFBbVEwTEhqY1U5UlFnNiIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwgYWRkcmVzcyBwaG9uZSByZWFkOmN1cnJlbnRfdXNlciB1cGRhdGU6Y3VycmVudF91c2VyX21ldGFkYXRhIGRlbGV0ZTpjdXJyZW50X3VzZXJfbWV0YWRhdGEgY3JlYXRlOmN1cnJlbnRfdXNlcl9tZXRhZGF0YSBjcmVhdGU6Y3VycmVudF91c2VyX2RldmljZV9jcmVkZW50aWFscyBkZWxldGU6Y3VycmVudF91c2VyX2RldmljZV9jcmVkZW50aWFscyB1cGRhdGU6Y3VycmVudF91c2VyX2lkZW50aXRpZXMiLCJndHkiOiJwYXNzd29yZCJ9.Y8kPe17yeym2obP1b4VselHZYTLUXIA4cYjn2IADSwDaSvX5RT5ubNeB-p69eU88pS0ZzU692KuAr1OvIOSzYnMQ3iXMLdt_bdojJknpBrPbLqzgzO_NnjbeMl91jr3XysiJDCufQVKxerEP4eAwNLoSytyNsmaeJc8ZTccUy-HQCNIhvqsQMPfAx_oB2R04cpE13nP-Wd7u8GO9q_ydVJL_TxhacgeG4cLfTvBTwbu718hCZNw4jcU0TN_cpbIhrN7zxwV7jgBzwuBO8lUspAuwNO5gFD4Wumsehz6qjrS5_kZ5Au9vY9uyFZik2sYa7LAtJqpwlMqeyHWlmWPgrw';
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
        debugger;
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
