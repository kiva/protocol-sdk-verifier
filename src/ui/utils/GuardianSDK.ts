import axios from 'axios';
import {v4 as uuid4} from "uuid";

import {CONSTANTS} from "../../constants/constants";

const CancelToken = axios.CancelToken;

export default class GuardianSDK {
    public readonly config: any;
    public cancel: any;
    private auth_method: any;
    private endpoint: string;
    private token?: string;

    static init(config: GuardianSDKConfig): GuardianSDK {
        return new GuardianSDK(config)
    }

    constructor(config: GuardianSDKConfig) {
        this.cancel = null;
        this.auth_method = config.auth_method;
        this.endpoint = config.endpoint;
        if (config.token) {
            this.token = config.token;
        }
    }

    async fetchKyc(requestBody: any, token?: string): Promise<any> {
        const ekycUri = CONSTANTS.controllerUrlBase + this.endpoint;
        const ekycId: string = uuid4();
        const headers: any = {
            'Content-Type': 'application/json',
            'x-request-id': ekycId,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response: any = await axios.post(ekycUri, requestBody, {
                headers,
                // TODO: Decide if there should be a unique cancel token that is responsible for cancelling all requests within this utility class
                cancelToken: new CancelToken((cancel): void => {
                    this.cancel = cancel;
                })
            });
            response.data['ekycId'] = ekycId;
            return Promise.resolve(response.data);
        } catch (error) {
            console.log(error);

            return Promise.reject(error.message);
        } finally {
            this.cancel = null;
        }
    }
}

interface GuardianSDKConfig {
    endpoint: string,
    auth_method: string,
    token?: string
}
