import {ProofRequestProfile} from "./VerificationRequirementProps";
import ICommonProps from './ICommonProps';

export interface QRProps extends ICommonProps {
    setConnectionId(id: string): Promise<void>,
    verifyConnection(established: boolean): Promise<void>,
    connectionId: string,
    connected: boolean,
    agentType: string,
    profile: ProofRequestProfile
}

export interface QRState {
    inviteUrl: string | undefined,
    connectionError: string,
    retrievingInviteUrl: boolean,
    verifying: boolean,
    isConnectionReady: boolean,
    agent_connected: boolean,
    connectionId: string
}

export interface QRButtonProps {
    onSubmit(): void,
    onClickBack(): void,
    onReset(): void
    isConnectionReady: boolean,
    isVerifying: boolean
}
