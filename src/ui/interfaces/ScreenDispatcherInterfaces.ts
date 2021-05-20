import {AuthOption} from "./AuthOptionInterfaces";
import {ProofRequestProfile} from "./VerificationRequirementProps";

export interface ScreenDispatcherProps {
    screen: string,
    authMethod: AuthOption,
    profile: ProofRequestProfile
}