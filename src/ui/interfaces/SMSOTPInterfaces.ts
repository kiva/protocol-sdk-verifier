import {ProofRequestProfile} from "./VerificationRequirementProps";
import {ComponentStoreMethods} from './FlowRouterInterfaces';
import ICommonProps from './ICommonProps';

export interface SMSProps extends ICommonProps {
    phoneNumber: string,
    setSmsInfo(data: SMSData): void,
    phoneScreen: string,
    email: string,
    smsSent: boolean,
    profile: ProofRequestProfile
}

export interface OTPState {
    [index: string]: any,
    phoneNumber: string,
    smsSent: boolean,
    phoneScreen: string
}

export interface SMSData {
    [index: string]: any,
    smsSent: boolean,
    phoneNumber: string,
    phoneScreen: string
}

export interface PhoneState {
    phoneNumber: string,
    error: string,
    requestInProgress: boolean
}

export interface SMSButtonProps {
    onSubmit(): void,
    onClickBack(): void
}

export interface PhoneNumberInputProps {
    phoneNumber: string,
    handlePhoneNumberChange: (input: string) => void,
    handleEnter: (keyCode: number) => void
}

export interface OTPScreenProps {
    phoneNumber: string,
    email: string,
    smsSent: boolean,
    setContainerState(data: SMSData): void,
    profile: ProofRequestProfile,
    store: ComponentStoreMethods
}

export interface OTPInputProps {
    handleOTPEntry: (index: number, value: string) => void
}

export interface OTPInputState {
    otp: string[],
    smsError: string,
    requestInProgress: boolean,
    idVerified: boolean
}

export interface SMSStatusProps {
    status: string,
    errorText?: string
}

export interface PhoneScreenProps {
    phoneNumber: string,
    setContainerState(data: SMSData): void,
    email: string,
    smsSent: boolean,
    profile: ProofRequestProfile,
    store: ComponentStoreMethods
}

export interface SMSPostBody {
    profile: string,
    guardianData: GuardianData,
    device: any
}

interface GuardianData {
    pluginType: string,
    filters: object,
    params: PhoneParams | OTPParams
}

interface PhoneParams {
    phoneNumber: string
}

interface OTPParams {
    otp: number
}
