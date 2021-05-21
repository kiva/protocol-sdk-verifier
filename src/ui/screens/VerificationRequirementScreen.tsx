import Grid from '@material-ui/core/Grid';
import * as React from "react";

// CSS
import '../css/Common.scss';
import '../css/VerificationRequirementScreen.scss';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import I18n from '../utils/I18n';
import { IAgent } from '../interfaces/AgentInterfaces';
import KivaAgent from '../agents/KivaAgent';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {VerificationRequirementProps, VerificationRequirementState} from '../interfaces/VerificationRequirementProps';
import {flowController} from "../KernelContainer";
import auth from '../utils/AuthService';
import _ from 'lodash';

export default class VerificationRequirementScreen extends React.Component<VerificationRequirementProps, VerificationRequirementState> {
    public readonly agent: IAgent;

    constructor(props:any) {
        super(props);
        this.state = {
            verificationRequired: 0,
            proofOptions: []
        }
        this.agent = KivaAgent.init(auth.getToken());
        this.setProofOptions();
    }

    async setProofOptions() {
        this.setState({
            proofOptions: await this.agent.fetchProofOptions()
        });
        this.props.setProfile(this.state.proofOptions[0]);
    }

    handleChange(event: React.ChangeEvent<{ value: unknown }>) {
        const index = Number((event.target as HTMLInputElement).value);
        const option = this.state.proofOptions[index];
        this.setState({
            verificationRequired: index
        })
        this.props.setProfile(option);
    };

    render() {
        return <div className="VerificationRequirement screen">
            <Grid container
                direction="column"
                justify="center"
                alignItems="center">
                <Grid item>
                    <Typography component="h2" variant="h6" gutterBottom>
                        {I18n.getKey('VERIFICATION_REQUIRED')}
                    </Typography>
                </Grid>
            </Grid>
            <Grid container
                direction="column"
                justify="center"
                alignItems="center">
                <Grid item>
                    <Typography gutterBottom>
                        {I18n.getKey('PLEASE_SELECT')}
                    </Typography>
                </Grid>
            </Grid>
            <Grid container
                direction="column"
                justify="center"
                alignItems="center">
                <Grid item>
                    <FormControl className="form-control">
                        <InputLabel >Verification Requirement</InputLabel>
                        <Select
                            className="verification-requirement-select"
                            value={this.state.verificationRequired}
                            onChange={this.handleChange.bind(this)}
                        >
                            {_.map(this.state.proofOptions, (option, index) => {
                                return (<MenuItem value={index} key={index}>{`${index+1} - ${option.comment}`}</MenuItem>)
                            })}
                            
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <Grid container
                direction="row"
                justify="center"
                alignItems="center">
                <Grid item>
                    <Button
                        className="back"
                        onClick={() => flowController.goTo('BACK')}>
                        {I18n.getKey('BACK')}
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        className="accept"
                        onClick={() => flowController.goTo('NEXT')}>
                        {I18n.getKey('CONTINUE')}
                    </Button>
                </Grid>
            </Grid>
        </div>;
    }
}