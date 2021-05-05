import {AuthOption} from "./AuthOptionInterfaces";

export interface ScreenDispatcherProps {
    screen: string,
    authMethod: AuthOption,
    profile: string
}