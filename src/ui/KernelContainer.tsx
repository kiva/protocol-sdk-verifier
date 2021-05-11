import * as React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

// Controllers
import {ScreenDispatcher} from "./controllers/ScreenDispatcher";

// Screens
import ConfirmationScreen from './screens/ConfirmationScreen';
import VerificationRequirementScreen from './screens/VerificationRequirementScreen';
import ResultDetails from './screens/ResultDetails';
import AuthenticationOptionMenu from './screens/AuthenticationOptionMenu';

// Utils
import listen from "./utils/listen";
import Warden from "./utils/Warden";
import I18n from "./utils/I18n";
import FlowController from "./utils/FlowController";

// Interfaces
import {KernelProps, KernelState} from "./interfaces/KernelInterfaces";
import {ProofRequestProfile} from "./interfaces/VerificationRequirementProps";

// Constants
import {actionList, CONSTANTS} from "../constants/constants";

// CSS
import './css/KernelContainer.css';
import './css/Common.css';

export let flowController: FlowController;

export class KernelContainer extends React.Component<KernelProps, KernelState> {

    constructor(props: KernelProps) {
        super(props);
        this.state = {
            step: 'confirmation',
            flowControllerStepOverride: '',
            isLoading: true,
            personalInfo: "",
            isStandalone: false,
            authIndex: 0,
        };

        flowController = FlowController.init(CONSTANTS.verification_options, this.go);
    }

    componentDidMount(): void {
        listen(window, "message", (e: any) => {
            const eventAction: string = e.data.action;
            const origin: string = e.origin;

            if (eventAction
                && Warden.certifyOrigin(origin)
                && !this.state.rejection.rejected
                && actionList.hasOwnProperty(eventAction))
            {
                if (eventAction === "reset") {
                    flowController = FlowController.init(CONSTANTS.verification_options, this.go);
                }
                this.setState(actionList[eventAction]);
            }

        });
        this.setState({
            isLoading: false
        });
    }

    go = (step: string, additionalStateData?: any): void => {
        const updatedState: any = additionalStateData || {};
        if (step) {
            updatedState.step = step;
            this.setState(updatedState);
        }
    }

    setNewAuthType = (optionIndex: number): void => {
        flowController.modifyFlow(CONSTANTS.verification_options[optionIndex]);
        this.setState({
            authIndex: optionIndex
        }, () => flowController.goTo('NEXT'));
    }

    setProfile = (profile: ProofRequestProfile): void => {
        this.setState({
            profile: profile
        });
    }

    dispatchEkycComplete = (): void => {
        const sendingObject = {
            key: 'kycCompleted',
            detail: this.state.personalInfo
        };
        console.info("Sending kycCompleted", sendingObject);
        window.parent.postMessage(sendingObject, "*");
    };

    handleNavigateToPage = (pageName: string) => (): any => {
        this.setState({
            step: pageName,
        });
    };

    renderWalletDetails() {
        this.dispatchEkycComplete();
        let detailsPage: any = "";
        if (!this.state.isStandalone) {
            detailsPage = <ResultDetails
                personalInfo={this.state.personalInfo}
                actionButtonCaption={I18n.getKey('EXPORT_PROFILE')}
                exportAction={this.dispatchEkycComplete}
                printButtonCaption={I18n.getKey('PRINT_PROFILE')}
            />;
        }
        return detailsPage;
    }

    renderHeader() {
        const headerImage: string = `/images/${CONSTANTS.headerImage}`;
        if (this.state.isStandalone) {
            return null;
        } else {
            return <div className="AppHeader">
                <img src={headerImage} alt=""/>
                <h1>{I18n.getKey('SITE_TITLE')}</h1>
            </div>;
        }
    }

    renderFooter() {
        return <div className="AppFooter">
            {I18n.getKey('POWERED_BY')} <strong>{I18n.getKey('AUTH_AGENCY')}</strong>
        </div>;
    }

    renderLoadingScreen() {
        return <div className="screen">
            <h4>Verifying</h4>
            <CircularProgress color="secondary"/>
        </div>;
    }

    renderScreen(screen: string) {
        return (
            <ScreenDispatcher
                screen={screen}
                authMethod={CONSTANTS.verification_options[this.state.authIndex]}
                profile={this.state.profile}
            />
        );
    }

    renderOptionMenu() {
        return (
            <AuthenticationOptionMenu
                verification_opts={CONSTANTS.verification_options}
                setNewAuthType={this.setNewAuthType}
                authIndex={this.state.authIndex}
            />
        );
    }

    renderConfirmationScreen() {
        return (
            <ConfirmationScreen
                integrationName={I18n.getKey('SITE_TITLE')}
            />
        );
    }

    renderVerificationRequirement() {
        return (
            <VerificationRequirementScreen
                integrationName={I18n.getKey('SITE_TITLE')}
                setProfile={this.setProfile}
            />
        )
    }

    renderContent() {
        switch (this.state.step) {
        case 'menu':
            return this.renderOptionMenu();
        case 'details':
            return this.renderWalletDetails();
        case 'loading':
            return this.renderLoadingScreen();
        case 'confirmation':
            return this.renderConfirmationScreen();
        case 'verificationRequirement':
            return this.renderVerificationRequirement();
        default:
            return this.renderScreen(this.state.step);
        }
    }

    renderNormalFlow() {
        return <div className="normalFlow" data-cy={screenNames[this.state.step]}>
            {this.renderHeader()}
            {this.renderContent()}
            {this.renderFooter()}
        </div>;
    }

    renderLoadingFlow() {
        return <div className="extraterrestrialLayer">
            Loading...
        </div>;
    }

    render() {
        const {isLoading} = this.state;
        return (
            <div className="KernelContainer">
                <div className="KernelContent">
                    {isLoading && this.renderLoadingFlow()}
                    {!isLoading && this.renderNormalFlow()}
                </div>
            </div>
        );
    }
}

const screenNames: any = {
    confirmation: 'Consent',
    verificationRequirement: 'VerificationRequirement',
    loading: 'AppLoad',
    details: 'CustomerInfo'
};
