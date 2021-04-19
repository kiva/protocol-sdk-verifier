type TBaseAgentFunction = (request: Promise<any>, callback: (data: any) => any, error?: string) => Promise<any>;

export interface IBaseAgent {
    establish: TBaseAgentFunction,
    check: TBaseAgentFunction,
    send: TBaseAgentFunction,
    prove: TBaseAgentFunction
}

export interface IAgent {
    checkVerification(verificationId: string): Promise<any>,
    sendVerification(connectionId: string): Promise<string>,
    establishConnection(connectionId: string): Promise<any>,
    getConnection(connectionId: string): Promise<any>,
    isConnected(response: any): boolean,
    isVerified(response: any): boolean,
    getProof(response: any): any,
    formatProof(response: any): any,
    isRejected?: (response: any) => boolean
}
