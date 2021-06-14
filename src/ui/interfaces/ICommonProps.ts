import {ComponentStoreMethods} from './FlowRouterInterfaces';

export default interface ICommonProps {
    store: ComponentStoreMethods,
    prevScreen: string,
    authIndex: number
}
