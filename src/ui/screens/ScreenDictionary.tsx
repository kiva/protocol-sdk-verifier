import * as React from 'react';

import {ScreenContainerProps, ScreenContainerState, ScreenProps, ScreenState} from "../interfaces/ScreenDictionaryInterfaces";
import {SMSData} from "../interfaces/SMSOTPInterfaces";

import AgencyQR from "./AgencyQR";
import SMSOTPScreen from './SMSOTPScreen';
import EmailScreen from './EmailScreen';

export default class ScreenContainer extends React.Component<ScreenContainerProps, ScreenContainerState> {

    render() {
        return (
            <Screen
                screen={this.props.screen}
                authMethod={this.props.authMethod}
            />
        );
    }
}

class Screen extends React.Component<ScreenProps, ScreenState> {

    constructor(props: ScreenProps) {
        super(props);
        this.state = {
            screen: props.screen,
            connectionId: "",
            agent_connected: false,
            smsSent: false,
            phoneNumber: "",
            email: "",
            phoneScreen: "phoneInput"
        }
    }

    componentDidUpdate() {
        console.log(this.state);
    }

    setConnectionId = async (connectionId: string): Promise<void> => {
        this.setState({connectionId});
    };

    verifyConnection = async (agent_connected: boolean): Promise<void> => {
        this.setState({agent_connected});
    };

    setSmsInfo = (data: SMSData) => {
        this.setState(data);
    }

    setEmail = (email: string) => {
        this.setState({email});
    }

    renderAgencyQR() {
        return (
            <AgencyQR
                agentType={this.props.authMethod.id}
                connectionId={this.state.connectionId}
                setConnectionId={this.setConnectionId}
                verifyConnection={this.verifyConnection}
                connected={this.state.agent_connected}
            />
        );
    }

    renderSmsOtp() {
        return (
            <SMSOTPScreen
                phoneNumber={this.state.phoneNumber}
                phoneScreen={this.state.phoneScreen}
                setSmsInfo={this.setSmsInfo}
                smsSent={this.state.smsSent}
                email={this.state.email}
            />
        );
    }

    renderEmail() {
        return (
            <EmailScreen
                email={this.state.email}
                setEmail={this.setEmail}
            />
        );
    }

    renderByName() {
        switch (this.props.screen) {
            case "agency_qr":
                return this.renderAgencyQR();
            case "smsotp":
                return this.renderSmsOtp();
            case "email_input":
                return this.renderEmail();
            default:
                return "";
        }
    }

    render() {
        return this.renderByName();
    }
}
