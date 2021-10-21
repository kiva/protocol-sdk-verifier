/* eslint-disable jsx-a11y/anchor-is-valid */

import * as React from 'react';
import { notify } from "react-notify-toast";
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import '../css/ScanFingerprintScreen.css';

import RejectionScreen from "./RejectionScreen";
import FingerSelectionScreen from './FingerSelectionScreen';
import DialogContainer from "../components/DialogContainer";

import FingerUtils from '../utils/FingerUtils';
import I18n from "../utils/I18n";
import DesktopToolService from "../utils/DesktopToolService";
import getPostBody from "../utils/Normalizer";
import auth from '../utils/AuthService';

import { CONSTANTS } from "../../constants/constants";
import FlowDispatchContext from '../contexts/FlowDispatchContext';

import { FPScanProps, FPScanState, FingerprintEkycBody } from "../interfaces/ScanFingerprintInterfaces";
import { FingerTypesMap, FingerTypeTranslation } from "../interfaces/UtilInferfaces";
import { RejectionReport } from "../interfaces/RejectionProps";
import FlowDispatchTypes from '../enums/FlowDispatchTypes';
import GuardianSDK from '../utils/GuardianSDK';

import failed from "../images/np_fingerprint_failed.png";
import success from "../images/np_fingerprint_verified.png";
import in_progress from "../images/np_fingerprint_inprogress.png";

const SLOW_INTERNET_THRESHOLD: number = CONSTANTS.slowInternetThreshold || 10000;

const NoRejection: RejectionReport = {
    rejected: false,
    reason: ""
};

const desktopToolClient = DesktopToolService.init({
    api: "http://localhost:9907"
});

const SDK = GuardianSDK.init({
    endpoint: '/v2/hnfsp/api/guardian/verify',
    auth_method: 'Fingerprint'
});

const fingerTypes: FingerTypesMap = FingerUtils.buildFingerTypes();

export default class ScanFingerprintScreen extends React.Component<FPScanProps, FPScanState> {

    static contextType = FlowDispatchContext;
    private dispatch: any;

    constructor(props: FPScanProps) {
        super(props);

        this.state = {
            selectedFinger: this.props.store.get('selectedFinger', 'right_thumb'),
            scanStatus: "",
            fingerPrintImage: "",
            selectingNewFinger: false,
            deviceInfo: {},
            rejection: NoRejection,
            persistentError: false,
            processResultMessage: "",
            dialogOpen: false,
            dialogComplete: false,
            dialogSuccess: false,
            slowInternet: false
        };
    }

    componentDidMount() {
        this.dispatch = this.context();
        this.beginFingerprintScan();
    }

    changeFingerSelection = (index: string): void => {
        this.props.store.set('selectedFinger', index);
        this.setState({
            selectedFinger: index,
            fingerPrintImage: '',
            scanStatus: '',
            selectingNewFinger: false
        }, this.beginFingerprintScan);
    };

    resetFingerprintImage = (): void => {
        this.setState({
            fingerPrintImage: '',
            scanStatus: 'progress'
        }, this.beginFingerprintScan);
    };

    buildFingerCaption(fingerType: string): string {
        return fingerTypes.hasOwnProperty(fingerType) ? fingerTypes[fingerType] : "";
    }

    // 1 - 5 Right thumb through right four fingers
    // 6 -10 Left thumb through left four fingers
    // Taken from ISO 19794-4
    translateFingertype(fingerType: string): number {
        var data: FingerTypeTranslation = {
            right_thumb: 1,
            right_index: 2,
            right_middle: 3,
            right_ring: 4,
            right_little: 5,
            left_thumb: 6,
            left_index: 7,
            left_middle: 8,
            left_ring: 9,
            left_little: 10,
        };
        return data.hasOwnProperty(fingerType) ? data[fingerType] : 1;
    }

    beginRequest = () => (event: any) => {
        event.preventDefault();
        this.setState({
            dialogComplete: false,
            dialogOpen: true,
            dialogSuccess: false,
            processResultMessage: ''
        }, () => this.makeRequest());
    }

    allowCancel = (): void => {
        this.setState({
            slowInternet: true
        });
    };

    dismissCancel = (): void => {
        this.setState({
            slowInternet: false
        });
    };

    cancelEkycRequest = (): void => {
        if (SDK.cancel) {
            SDK.cancel('User cancelled request because of slow internet');
        }
        this.setState({
            dialogOpen: false,
            dialogComplete: false,
            dialogSuccess: false,
            slowInternet: false
        });
    };

    setPostBody(): FingerprintEkycBody {
        return getPostBody(
            this.state.fingerPrintImage,
            this.translateFingertype(this.state.selectedFinger),
            this.state.deviceInfo,
            CONSTANTS.credentialProof,
            this.props.store.get);
    }

    // TODO: Break up this method - it's too big
    makeRequest = async (): Promise<void> => {
        let slowInternetWarning;
        try {
            slowInternetWarning = setTimeout(() => {
                this.allowCancel();
            }, SLOW_INTERNET_THRESHOLD);

            const body: FingerprintEkycBody = this.setPostBody();

            const data = await SDK.fetchKyc(body, auth.getToken());
            this.setState({
                dialogSuccess: true,
                dialogComplete: true,
                processResultMessage: ''
            }, () => this.handleEkycSuccess(data));
        } catch (errorMessage: any) {
            const msg = errorMessage.toString();
            console.error("Error -> " + msg);
            this.setState({
                dialogComplete: true,
                dialogSuccess: false,
                processResultMessage: msg
            });
        } finally {
            if (slowInternetWarning) clearTimeout(slowInternetWarning);
        }
    }

    handleEkycSuccess = (personalInfo: any) => {
        this.props.store.set('personalInfo', personalInfo)
        setTimeout(() => {
            this.setState({
                dialogOpen: false
            }, () => this.dispatch({ type: FlowDispatchTypes.NEXT }));
        }, 1000);
    };

    buildBase64Template(status: string): string {
        let b64 = in_progress;
        switch (status) {
        case 'failed':
            b64 = failed;
            break;
        case 'success':
            b64 = success;
            break;
        case 'progress':
        default:
            break;
        }
        return b64;
    }

    createAltText(status: string): string {
        if (status === 'progress') {
            return "Scan in progress...";
        } else {
            return `Scan finished with status: ${status}!`;
        }
    }

    beginFingerprintScan = (): void => {
        if (this.state.scanStatus !== 'progress') {
            this.setState({
                scanStatus: 'progress',
                fingerPrintImage: ''
            }, this.getImageFromFingerprintScanner);
        }
    };

    updateFingerprintState = (response: any): void => {
        const fingerPrintImage: string = response.ImageBase64.replace("data:image/png;base64,", "");
        const deviceInfo: any = response;

        delete deviceInfo.ImageBase64;
        delete deviceInfo.Token;

        this.setState({
            scanStatus: 'success',
            fingerPrintImage,
            deviceInfo,
            rejection: NoRejection,
            persistentError: false,
            dialogOpen: false,
            dialogComplete: false,
            processResultMessage: ""
        });
    };

    showNotification() {
        if (this.state.persistentError) {
            notify.show(I18n.getKey('PERSISTENT_READER_FAILURE'), "error", 5000);
        }
    }

    handleScannerFailures = (e: any) => {
        const rejection: RejectionReport = desktopToolClient.createErrorReport(e);
        const updatedState: any = {
            rejection,
            scanStatus: ""
        };
        if (this.state.rejection.rejected) {
            updatedState.persistentError = true;
            updatedState.dialogOpen = true;
            updatedState.dialogComplete = true;
            updatedState.processResultMessage = I18n.getKey('READER_UNDETECTED');
        }
        this.setState(updatedState, this.showNotification);
    };

    handleFailure = (e: any) => {
        if (e.message && e.message === 'FR_NOT_CAPTURED') {
            this.setState({
                scanStatus: 'failed',
                fingerPrintImage: '',
                rejection: {
                    rejected: false,
                    reason: ""
                },
                persistentError: false,
                dialogOpen: false,
                dialogComplete: false,
                processResultMessage: ""
            });
        } else if (e.message && e.message === 'DEVICE_IN_USE') {
            const errorMessage: string = desktopToolClient.createErrorString(e);
            notify.show(errorMessage, 'error', 2000);
        } else {
            this.handleScannerFailures(e);
        }
    };

    getImageFromFingerprintScanner = async (): Promise<void> => {
        try {
            const data: any = await desktopToolClient.makeDesktopToolRequest('Fingerprint');
            this.updateFingerprintState(data);
        } catch (e) {
            console.log(e);
            this.handleFailure(e);
        }
    };

    buildSelectedFingerprint() {
        if (this.state.scanStatus) {
            return (
                <div
                    className="fileLoader"
                    onClick={this.beginFingerprintScan}>
                    <img src={this.buildBase64Template(this.state.scanStatus)} alt={this.createAltText(this.state.scanStatus)} className="SuperImage" data-cy="fp-image" />
                </div>
            );
        } else {
            return (
                <FingerSelectionScreen
                    selectedFinger={this.state.selectedFinger}
                    isReadOnly={true}
                />
            );
        }
    }

    selectNewFinger = () => {
        this.setState({
            selectingNewFinger: true
        });
    };

    handleDialogClose = (): void => {
        this.setState({
            dialogOpen: false
        });
    }

    renderChangeScreen() {
        return (
            <FingerSelectionScreen
                selectedFinger={this.state.selectedFinger}
                changeFingerSelection={this.changeFingerSelection}
            />
        );
    }

    renderScanScreen() {
        return <div className="flex-block">
            <Grid container
                className="fingerprint"
                direction="column"
                justify="center"
                alignItems="center"
                spacing={8}>
                <Grid item>
                    <Typography component="h2" variant="h6" gutterBottom className="fingerprint-selection">
                        <div dangerouslySetInnerHTML={{
                            __html: I18n.computeKey({
                                finger: this.buildFingerCaption(this.state.selectedFinger)
                            }, 'PLACE_FINGER')
                        }} />
                        <br />
                        <a data-cy="select-new-finger" onClick={this.selectNewFinger}>{I18n.getKey('CHANGE_FINGER')}</a> <br />
                    </Typography>
                </Grid>
                <Grid item>
                    {this.buildSelectedFingerprint()}
                </Grid>
                <Grid item>
                    <Typography component="h2" variant="h6" className="fingerprint-selection">
                        <a data-cy="recapture-fp" className="enhanced" onClick={this.beginFingerprintScan}>{I18n.getKey('RECAPTURE_FINGER')}</a> <br />
                    </Typography>
                </Grid>
                <Grid container
                    className=""
                    direction="row"
                    justify="center"
                    alignItems="center">
                    <Grid item>
                        <Button
                            data-cy="fpscan-back"
                            className="back"
                            onClick={() => this.dispatch({ type: FlowDispatchTypes.BACK })}>
                            {`< ${I18n.getKey('BACK')}`}
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            data-cy="fpscan-next"
                            className="next"
                            onClick={this.beginRequest()}>
                            {`${I18n.getKey('NEXT')} >`}
                        </Button>
                    </Grid>
                </Grid>
                {this.state.dialogOpen && this.renderDialog()}
            </Grid>
        </div>;
    }

    renderDialog() {
        return (
            <DialogContainer
                open={this.state.dialogOpen}
                clickFunction={this.state.rejection.rejected ? this.beginFingerprintScan : this.handleDialogClose}
                complete={this.state.dialogComplete}
                rejection={this.state.rejection.rejected}
                success={this.state.dialogSuccess}
                errorMessage={this.state.processResultMessage}
                handleCancel={this.cancelEkycRequest || undefined}
                allowCancel={this.state.slowInternet}
                dismissCancel={this.dismissCancel}
            />
        );
    }

    renderRejectionScreen() {
        return (
            <RejectionScreen
                rejection={this.state.rejection}
                handleRestart={this.beginFingerprintScan}
            >
                {this.renderDialog()}
            </RejectionScreen>
        );
    }

    render() {
        if (this.state.rejection.rejected) {
            return this.renderRejectionScreen();
        } else if (this.state.selectingNewFinger) {
            return this.renderChangeScreen();
        } else {
            return this.renderScanScreen();
        }
    }
}