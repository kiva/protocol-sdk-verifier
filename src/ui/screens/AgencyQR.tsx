import * as React from 'react';
import {notify} from "react-notify-toast";
import { v4 as uuid4 } from "uuid";
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import Button from '@material-ui/core/Button';
import ErrorIcon from '@material-ui/icons/Error';
import QRCode from 'qrcode';
import classNames from 'classnames';

import {QRProps, QRState, QRButtonProps} from "../interfaces/QRInterfaces";
import {IAgent} from "../interfaces/AgentInterfaces";
import {ProofRequestProfile} from '../interfaces/VerificationRequirementProps';

import {CONSTANTS} from '../../constants/constants';

import FlowDispatchContext from '../contexts/FlowDispatchContext';
import FlowDispatchTypes from '../enums/FlowDispatchTypes';

import I18n from '../utils/I18n';
import LocalAgent from '../agents/LocalAgent';
import KivaAgent from '../agents/KivaAgent';
import auth from '../utils/AuthService';

import "../css/Common.css";
import "../css/QRScreen.css";

let cancel: boolean;

const pollInterval: number = 200;

export default class AgencyQR extends React.Component<QRProps, QRState> {

    public readonly agent: IAgent;
    static contextType = FlowDispatchContext;
    private dispatch: any;
    private profile: ProofRequestProfile;
    private selectedVerificationOptionId: string;

    constructor(props: QRProps) {
        super(props);
        this.state = {
            retrievingInviteUrl: true,
            inviteUrl: "",
            connectionError: "",
            verifying: false,
            isConnectionReady: false,
            agent_connected: this.props.store.get('agent_connected', false),
            connectionId: this.props.store.get('connection_id', '')
        };
        this.profile = this.props.store.get('profile', {
            comment: '',
            proof_request: {},
            schema_id: ''
        }, 'verificationRequirement');
        this.selectedVerificationOptionId = CONSTANTS.verification_options[this.props.store.get('authIndex', 0, 'menu')].id;
        this.agent = this.determineCloudAgent();
    }

    componentWillUnmount() {
        cancel = true;
    }

    componentDidMount() {
        cancel = false;
        this.dispatch = this.context();
        this.startProcess();
    }

    determineCloudAgent = (): IAgent => {
        switch (this.selectedVerificationOptionId) {
        case "Local_QR":
            return LocalAgent.init();
        case "Kiva_QR":
        default:
            return KivaAgent.init(auth.getToken());
        }
    }

    startProcess = (reset?: boolean) => {
        if (!this.state.connectionId || reset) {
            console.log("Attempting to get a connection");
            this.startConnection();
        } else if (this.state.agent_connected) {
            console.log("Starting a verification");
            this.startVerification();
        }
    }

    startConnection = () => {
        this.setState({
            retrievingInviteUrl: true,
            connectionError: ""
        }, () => this.getInviteUrl());
    }

    storeConnectionId = (connectionId: string): void => {
        this.props.store.set('connection_id', connectionId);
        this.setState({connectionId})
    }

    getInviteUrl = async () => {
        try {
            const connectionId: string = uuid4();
            const url: string = await this.agent.establishConnection(connectionId);
            this.storeConnectionId(connectionId);
            this.setInviteUrl(url);
            this.pollConnection(connectionId);
        } catch (e) {
            console.log(e);
            this.setConnectionError(e);
        }
    }

    pollConnection = async (connectionId: string) => {
        try {
            let connectionStatus: any = await this.agent.getConnection(connectionId);
            if (this.agent.isConnected(connectionStatus)) {
                this.props.store.set('agent_connected', true);
                this.setState({
                    isConnectionReady: true,
                    agent_connected: true
                });
            } else if (!cancel) {
                setTimeout(() => {
                    this.pollConnection(connectionId);
                }, pollInterval);
            }
        } catch (e) {
            console.log(e);
            this.setConnectionError(e);
        }
    }

    pollVerification = async (selectedVerificationOptionId: string) => {
        try {
            let verificationStatus: any = await this.agent.checkVerification(this.selectedVerificationOptionId);
            if (this.agent.isVerified(verificationStatus)) {
                this.acceptProof(this.agent.getProof(verificationStatus));
            } else if (!!this.agent.isRejected && this.agent.isRejected(verificationStatus)) {
                throw I18n.computeKey({
                    proofRequestComment: this.profile.comment
                }, 'REJECTED_PROOF')
            } else if (!cancel) {
                setTimeout(() => {
                    this.pollVerification(this.selectedVerificationOptionId);
                }, pollInterval);
            }
        } catch (e) {
            console.log(e);
            this.setConnectionError(e);
        }
    }

    startVerification = () => {
        if (this.state.verifying || !this.state.agent_connected) {
            notify.show(I18n.getKey('QR_NO_CONNECTION_NOTIFY'), 'error', 3000);
        } else {
            this.setState({
                verifying: true
            }, () => {
                this.verify();
            });
        }
    }

    settleConnectionId = (connectionId?: string): string => {
        const id: string = connectionId || this.state.connectionId;
        return id;
    }

    acceptProof(verificationData: any) {
        this.props.store.set('personalInfo', verificationData);
        this.dispatch({type: FlowDispatchTypes.NEXT});
    }

    verify = async () => {
        try {
            const id: string = this.settleConnectionId();
            const verification: any = await this.agent.sendVerification(id, this.profile);
            this.pollVerification(verification);
        } catch (e) {
            console.log(e);
            this.setConnectionError(e);
        }
    }

    setInviteUrl = (inviteUrl: string | undefined): void => {
        const updatedState: any = {
            retrievingInviteUrl: false
        };

        if (inviteUrl) {
            updatedState.inviteUrl = inviteUrl;
        } else {
            updatedState.connectionError = I18n.getKey('NO_INVITE_URL');
        }

        this.setState(updatedState, this.writeQRtoCanvas);
    }

    writeQRtoCanvas() {
        try {
            QRCode.toCanvas(document.getElementById('qr-code'), this.state.inviteUrl || "", {
                width: 200
            });
        } catch {
            console.error('The QR code failed to write to the canvas');
        }
    }

    setConnectionError = (connectionError: string) => {
        cancel = true;
        this.setState({
            retrievingInviteUrl: false,
            verifying: false,
            connectionError
        });
    }

    resetFlow = (): void => {
        this.props.store.set('connection_id', '');
        this.props.store.set('agent_connected', false);
        this.setState({
            isConnectionReady: false,
            verifying: false,
            connectionId: '',
            agent_connected: false
        }, () => this.startProcess(true));
    }

    renderQRInvite() {
        return (
            <div>
                <Typography component="h2" variant="h6" gutterBottom className="qr-loading-title">
                    <strong>
                        {this.state.agent_connected ? I18n.getKey('CLICK_VERIFY') : I18n.getKey('SCAN_QR')}
                    </strong>
                    <br />
                    {this.state.agent_connected ? I18n.getKey('CONNECTION_ESTABLISHED') : I18n.getKey('SCAN_QR_INSTRUCTIONS')}
                </Typography>
                <div id="qr-box">
                    <canvas id="qr-code"></canvas>
                    <CheckCircleIcon className={classNames({
                        'qr-icon': true,
                        'dialog-icon': true,
                        verified: true,
                        hidden: !this.state.agent_connected
                    })} />
                </div>
            </div>
        );
    }

    renderRetrieving(text?: string) {
        const header: string = text || I18n.getKey('RETRIEVING_QR');
        return (
            <div className="centered-flex-content">
                <Typography component="h2" variant="h6" gutterBottom className="qr-loading-title">
                    {header}
                </Typography>
                <div id="qr-loader">
                    <CircularProgress className="dialog-icon verifying"/>
                </div>
            </div>
        );
    }

    renderVerifying() {
        return (
            <div data-cy="verify-qr">
                <Typography component="h2" variant="h6" gutterBottom className="qr-loading-title">
                    {I18n.getKey('VERIFYING')}...
                </Typography>
                <div id="qr-loader">
                    <CircularProgress className="dialog-icon verifying"/>
                </div>
            </div>
        );
    }

    renderError() {
        return (
            <div className="centered status-report">
                <ErrorIcon className="dialog-icon error"/>
                <Typography id="instructions" component="h2" align="center" className="error-description">
                    {this.state.connectionError}
                </Typography>
            </div>
        );
    }

    renderBody() {
        if (this.state.connectionError) {
            return this.renderError();
        } else if (this.state.verifying) {
            return this.renderVerifying();
        } else if (this.state.inviteUrl && !this.state.retrievingInviteUrl) {
            return this.renderQRInvite();
        } else {
            return this.renderRetrieving();
        }
    }

    render() {
        const {isConnectionReady, verifying} = this.state;
        return (
            <div id={this.selectedVerificationOptionId} className="flex-block column">
                <Grid container
                    direction="column"
                    justify="center"
                    alignItems="center">
                    {this.renderBody()}
                </Grid>
                <QRScreenButtons
                    isConnectionReady={isConnectionReady}
                    isVerifying={verifying}
                    onClickBack={() => this.dispatch({type: FlowDispatchTypes.BACK})}
                    onSubmit={() => this.startVerification()}
                    onReset={() => this.resetFlow()}
                />
            </div>
        );
    }
}

class QRScreenButtons extends React.Component<QRButtonProps> {
    render() {
        return (
            <Grid container
                className="qrButtons buttonListNew row"
                direction="row"
                justify="center"
                alignItems="center">
                <Grid item>
                    <Button
                        data-cy="qr-back"
                        className="back secondary"
                        onClick={this.props.onClickBack}>
                        {I18n.getKey('BACK')}
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        data-cy="reset-flow"
                        className="qr-reset"
                        onClick={this.props.onReset}>
                        {I18n.getKey('RESET_FLOW')}
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        disabled={!this.props.isConnectionReady || this.props.isVerifying}
                        type="submit"
                        data-cy="qr-scan-next"
                        className="next button-verify"
                        onSubmit={this.props.onSubmit}
                        onClick={this.props.onSubmit}>
                        {I18n.getKey('VERIFY')}
                    </Button>
                </Grid>
            </Grid>
        );
    }
}
