import {IBaseAgent} from "../interfaces/AgentInterfaces";

export default class BaseAgent implements IBaseAgent {

    async baseFunction(request: Promise<any>, callback: (data: any) => any, error?: string): Promise<any> {
        try {
            const connection: any = await request;

            return Promise.resolve(callback(connection));
        } catch (e) {
            let msg: string = "";
            if (error) {
                msg = error;
            } else {
                const errorDetails = ` (${e.response.data.code}: ${e.response.data.message})`;
                msg = e.message + errorDetails;
            }
            console.error(error);
            return Promise.reject(msg);
        }
    }

    async establish(request: Promise<any>, callback: (data: any) => any, error?: string): Promise<any> {
        return this.baseFunction(request, callback, error);
    }

    async check(request: Promise<any>, callback: (data: any) => any, error?: string): Promise<any> {
        return this.baseFunction(request, callback, error);
    }

    async send(request: Promise<any>, callback: (data: any) => any, error?: string): Promise<any> {
        return this.baseFunction(request, callback, error);
    }

    async prove(request: Promise<any>, callback: (data: any) => any, error?: string): Promise<any> {
        return this.baseFunction(request, callback, error);
    }
}