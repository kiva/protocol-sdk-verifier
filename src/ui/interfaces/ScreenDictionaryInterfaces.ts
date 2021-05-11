import {AuthOption} from "./AuthOptionInterfaces";
import {ProofRequestProfile} from "./VerificationRequirementProps";

export interface ScreenContainerProps {
    screen: string,
    authMethod: AuthOption,
    profile: ProofRequestProfile
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