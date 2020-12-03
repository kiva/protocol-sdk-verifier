export interface QRProps {
    setConnectionId(id: string): Promise<void>,
    verifyConnection(established: boolean): Promise<void>,
    connectionId: string,
    connected: boolean,
    agentType: string
}

export interface QRState {
    inviteUrl: string | undefined,
    connectionError: string,
    retrievingInviteUrl: boolean,
    verifying: boolean,
    isConnectionReady: boolean,
}

export interface QRButtonProps {
    onSubmit(): void,
    onClickBack(): void,
    onReset(): void
    isConnectionReady: boolean,
}
