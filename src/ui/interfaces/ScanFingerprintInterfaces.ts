import { RejectionReport } from "./RejectionProps";
import { EkycPostBody } from "./EkycPostBodyInterface";
import ICommonProps from "./ICommonProps";

export interface FPScanProps extends ICommonProps {
    selectedFinger: string,
    setSelectedFinger(finger: string): void
}

export interface FPScanState {
    selectedFinger: string,
    scanStatus: string,
    fingerPrintImage: string,
    selectingNewFinger: boolean,
    deviceInfo: any,
    rejection: RejectionReport,
    persistentError: boolean,
    processResultMessage: string,
    dialogOpen: boolean,
    dialogSuccess: boolean,
    dialogComplete: boolean,
    slowInternet: boolean
}

export interface FingerprintEkycBody {
    profile: string;
    guardianData: GuardianData;
}

export interface GuardianData extends EkycPostBody {
    pluginType: string;
    params: {
        image: string;
        position: number;
    }
}