import axios from 'axios';
import BaseAgent from './BaseAgent';

import {IAgent} from '../interfaces/AgentInterfaces';

import {CONSTANTS} from '../../constants/constants';

export default class LocalAgent extends BaseAgent implements IAgent {

    public localAgentUri = "http://localhost:" + CONSTANTS.agent_port;

    static init(): LocalAgent {
        return new LocalAgent();
    }

    fetchProofOptions(): any {
        return {};
    }

    isConnected(response: any): boolean {
        if (response.status === "Connected") {
            return true;
        }
        return false;
    }

    isVerified(response: any): boolean {
        if (response.verified) {
            return true;
        }
        return false;
    }

    formatProof(response: any): any {
        return {};
    }

    getData(axiosData: any) {
        return axiosData.data;
    }

    checkVerification = async (verificationId: string) => {
        return super.prove(
            axios.post(this.localAgentUri + "/Verification/Check", {verificationId}),
            this.getData
        );
    }

    async sendVerification(connectionId: string) {
        return super.send(
            axios.post(this.localAgentUri + "/Verification/Send", {connectionId}),
            this.getData
        );
    }

    async getConnection(connectionId: string) {
        return super.check(
            axios.post(this.localAgentUri + "/Connections/Status", {connectionId}),
            this.getData
        );
    }

    async establishConnection(connectionId: string) {
        return super.establish(
            axios.post(this.localAgentUri + "/Connections/Invite", {connectionId}),
            this.getData
        );
    }

    getProof(data: any) {
        return this.formatProof(data.proof);
    }
}
