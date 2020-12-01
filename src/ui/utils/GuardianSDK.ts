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
        config.token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlJrTXpRVEEyUkRrMVJqSTBOVEUyTlVZNU1rTkJRekF6TWtGRU4wSTROalk1T0RreVFqVkJNZyJ9.eyJodHRwczovL2VreWMuc2wua2l2YS5vcmcvZmlyc3ROYW1lIjoiSG9yYWNpbyIsImh0dHBzOi8vZWt5Yy5zbC5raXZhLm9yZy9sYXN0TmFtZSI6Ik51bmV6IiwiaHR0cHM6Ly9la3ljLnNsLmtpdmEub3JnL2JyYW5jaExvY2F0aW9uIjoiS0lWQS1IUSIsImh0dHBzOi8vZWt5Yy5zbC5raXZhLm9yZy9pbnN0aXR1dGlvbiI6IktpdmEgRW5naW5lZXJpbmcgQ29ycHMiLCJodHRwczovL2VreWMuc2wua2l2YS5vcmcvZnNwSWQiOiJVbm0yZ2k5ZFF1Znc2VUo4aEZCemFaIiwiaHR0cHM6Ly9la3ljLnNsLmtpdmEub3JnL2VreWNDaGFpbiI6IlVubTJnaTlkUXVmdzZVSjhoRkJ6YVoiLCJodHRwczovL2VreWMuc2wua2l2YS5vcmcvcm9sZXMiOiJvcGVyYXRvci1tYW5hZ2VtZW50LHNhbmRib3gtaGVscGVycywgc2FuZGJveC1tYW5hZ2VtZW50LCBjcmVkaXQtcmVwb3J0aW5nIiwiaHR0cHM6Ly9la3ljLnNsLmtpdmEub3JnL3JlY29yZFNlc3Npb24iOmZhbHNlLCJuaWNrbmFtZSI6ImhvcmFjaW8ubnVuZXoiLCJuYW1lIjoiaG9yYWNpby5udW5lekBraXZhLm9yZyIsInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci9mNjc2Njk1NDZlMTdiNDJkNmEzNDg1OGFkMmY3N2Q3Mz9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRmhvLnBuZyIsInVwZGF0ZWRfYXQiOiIyMDIwLTExLTIwVDAyOjE2OjAwLjkwNVoiLCJlbWFpbCI6ImhvcmFjaW8ubnVuZXpAa2l2YS5vcmciLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6Ly9raXZhLXByb3RvY29sLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw1ZTQ0NDhiZmVkNDZjNDBlN2Y5MTFkMDAiLCJhdWQiOiI3TkhwVHl5SDZ5UlBQdTZ2T0NFZE5SU213T1BGS2tsRCIsImlhdCI6MTYwNTgzODU2MCwiZXhwIjoxNjA1ODc0NTYwfQ.Uw6El51xdq8VRay7-Iz591f6PUGpIrSnyz-TGil2UN9S59vU48DbNb1VvL8HKUFZUbkm-NOGvPIn0QYRK0fCaGlKhSZQnEKEGDgI4oiBZweqS7ucSzBjRwo0w8XnS1SuAXlgin5kwr6F6a7GWIO1eOVM1dynNLhSrU5CU0hDeB9u67o20MuzA2ZpGjmusy68S9v86rssdgDXkeHWDn7HZhsNZYZ_ZyFvDQOREWQqIPWXJzll4GujexN_49LDJsVfhC-UyfHODCpv_eV0muP7uvxBGgWHpkzDNYIJtalKdYrFyp7tSLPKfVPaT8U32VpFkpcU9Vk35FTZ3DyoiDVl-g"
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
