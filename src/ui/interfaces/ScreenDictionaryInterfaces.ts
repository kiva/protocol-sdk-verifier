import {AuthOption} from "./AuthOptionInterfaces";

export interface ScreenContainerProps {
    screen: string,
    authMethod: AuthOption,
    profile:string
}

export interface ScreenContainerState {
    [index: string]: any,
    step: string
}

export interface ScreenProps extends ScreenContainerProps {
    [index: string]: any
}

export interface ScreenState {
    [index: string]: any
}