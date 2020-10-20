import {AuthOption} from "./AuthOptionInterfaces";

export interface ScreenContainerProps {
    screen: string,
    authMethod: AuthOption
}

export interface ScreenContainerState {
    [index: string]: any,
    step: string
}

export interface ScreenProps extends ScreenContainerProps {
    [index: string]: any
}

export interface ScreenState {
    screen: string,
    connectionId: string,
    agent_connected: boolean
}