import Grid from '@material-ui/core/Grid';
import * as React from "react";

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import I18n from '../utils/I18n';

import '../css/Common.css';
import '../css/ConfirmationScreen.css';

import {CredentialKeyFieldState, ConfirmationProps} from '../interfaces/ConfirmationProps';

import FlowDispatchContext from '../contexts/FlowDispatchContext';
import FlowDispatchTypes from '../enums/FlowDispatchTypes';

import {CONSTANTS} from "../../constants/constants";

export default class ConfirmationScreen extends React.Component<ConfirmationProps> {

    static contextType = FlowDispatchContext;

    consent = (): void => {
        const dispatch = this.context();
        const type: string = FlowDispatchTypes.NEXT;
        dispatch({type});
    }

    render() {
        const integrationName = I18n.getKey('SITE_TITLE');
        return <div className="Confirmation screen">
            <Grid container
                direction="column"
                justify="center"
                alignItems="center">
                <Grid item>
                    <Typography component="h2" variant="h6" gutterBottom>
                        {I18n.getKey('REVIEW')}
                    </Typography>
                </Grid>
            </Grid>
            <div className="legal-terms-section">
                <div className="legal-terms1">
                    <p>{I18n.getKey('AGREEMENT_1')} <strong>{integrationName}</strong> {I18n.getKey('AGREEMENT_2')}</p>

                    <p>{I18n.getKey('INFO_INCLUDES')}</p>
                </div>
                <PIIFields />
            </div>
            <Grid container
                direction="row"
                justify="center"
                alignItems="center">
                <Grid item>
                    <Button
                        className="accept"
                        onClick={() => this.consent()}>
                        {I18n.getKey('ACCEPT')}
                    </Button>
                </Grid>
            </Grid>
        </div>;
    }
}

class PIIFields extends React.Component<{}, CredentialKeyFieldState> {
    constructor(props: any) {
        super(props);

        this.state = {
            columnOne: [],
            columnTwo: []
        }
    }

    componentDidMount() {
        this.delegateLabels();
    }

    delegateLabels() {
        const columnOne: string[] = [];
        const columnTwo: string[] = [];

        let i = 0;
        for (let field in CONSTANTS.credentialKeyMap) {
            let currentArray = i % 2 === 0 ? columnOne : columnTwo;
            currentArray.push(CONSTANTS.credentialKeyMap[field].name);
            i++;
        }

        this.setState({columnOne, columnTwo});
    }

    renderFields() {
        return (
            <div className="legal-terms2">
                <ul>{this.state.columnOne.map(field => {
                    return <li key={field}>{field}</li>
                })}</ul>
                <ul>{this.state.columnTwo.map(field => {
                    return <li key={field}>{field}</li>
                })}</ul>
            </div>
        );
    }

    render() {
        return this.renderFields();
    }
}