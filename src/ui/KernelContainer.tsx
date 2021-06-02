import * as React from 'react';

// Controllers
<<<<<<< HEAD
import FlowControllerFC from "./hooks/FlowRouter";
=======
import {ScreenDispatcher} from "./controllers/ScreenDispatcher";

// Screens
import ConfirmationScreen from './screens/ConfirmationScreen';
import VerificationRequirementScreen from './screens/VerificationRequirementScreen';
import ResultDetails from './screens/ResultDetails';
import AuthenticationOptionMenu from './screens/AuthenticationOptionMenu';
>>>>>>> 7a01608f7ee2d48036eff309274f9421047e5c86

// Utils
import listen from "./utils/listen";
import Warden from "./utils/Warden";
import I18n from "./utils/I18n";

// Interfaces
import {KernelProps, KernelState} from "./interfaces/KernelInterfaces";
import {ProofRequestProfile} from "./interfaces/VerificationRequirementProps";

// Constants
import {actionList, CONSTANTS} from "../constants/constants";

// CSS
import './css/KernelContainer.css';
import './css/Common.css';

export class KernelContainer extends React.Component<KernelProps, KernelState> {

    constructor(props: KernelProps) {
        super(props);
        this.state = {
            isLoading: true,
            isStandalone: false
        };
    }

    componentDidMount(): void {
        listen(window, "message", (e: any) => {
            const eventAction: string = e.data.action;
            const origin: string = e.origin;

            if (eventAction
                && Warden.certifyOrigin(origin)
                && actionList.hasOwnProperty(eventAction))
            {
                this.setState(actionList[eventAction]);
            }

        });
        this.setState({
            isLoading: false
        });
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

    renderLoadingFlow() {
        return <div className="extraterrestrialLayer">
            Loading...
        </div>;
    }

    renderNormalFlow() {
        return (
            <div className="normalFlow">
                {this.renderHeader()}
                <FlowControllerFC />
                {this.renderFooter()}
            </div>
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
        const {isLoading} = this.state;
        if (isLoading) {
            return this.renderLoadingFlow();
        } else {
            return this.renderNormalFlow();
        }
    }

    render() {
        return this.renderContent();
    }
}
