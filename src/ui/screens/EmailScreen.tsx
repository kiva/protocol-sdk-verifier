import * as React from 'react';
import {notify} from "react-notify-toast";
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';

import I18n from '../utils/I18n';
import FlowDispatchContext from '../contexts/FlowDispatchContext';
import FlowConstants from '../enums/FlowConstants';

import {EmailProps, EmailState} from '../interfaces/EmailInterfaces';

import '../css/Common.css';
import '../css/Email.css';

export default class EmailScreen extends React.Component<EmailProps, EmailState> {

    static contextType = FlowDispatchContext;
    private dispatch: any;

    constructor(props: EmailProps) {
        super(props);
        this.state = {
            email: window.localStorage.getItem('email') || ''
        }
    }

    componentDidMount() {
        this.dispatch = this.context();
    }

    handleInputChange = () => (e: any) => {
        const email: string = e.target.value;
        window.localStorage.setItem('email', email);
        this.setState({email});
    }

    continue = () => (e: any) => {
        e.preventDefault();
        if (!this.state.email) {
            notify.show(I18n.getKey('NO_EMAIL'), 'error', 3000);
        } else {
            this.dispatch({type: FlowConstants.NEXT});
        }
    }

    render() {
        return (
            <div data-cy="standard-search" className="flex-block">
                <Grid container
                    direction="column"
                    justify="center"
                    alignItems="center">
                    <Grid item>
                        <Typography component="h2" variant="h6" gutterBottom>
                            {I18n.getKey('EMAIL_INSTRUCTIONS')}
                        </Typography>
                    </Grid>
                    <form name="ekycIdForm">
                        <Grid item>
                            <FormControl id="test">
                                <TextField
                                    id="email-input"
                                    data-cy="email-input"
                                    label={this.state.email.trim() === "" ? "Email" : ""}
                                    value={this.state.email}
                                    onChange={this.handleInputChange()}
                                    inputProps={{'aria-label': 'bare'}}
                                    margin="normal"
                                    name="inputId"
                                />
                            </FormControl>
                        </Grid>
                        <div className="buttonListNew together loose">
                            <Button
                                className="secondary"
                                id="back"
                                onClick={() => this.dispatch({type: FlowConstants.BACK})}>
                                {I18n.getKey('BACK')}
                            </Button>
                            <Button
                                type="submit"
                                id="continue"
                                onClick={this.continue()}
                                onSubmit={this.continue()}>
                                {I18n.getKey('CONTINUE')}
                            </Button>
                        </div>
                    </form>
                </Grid>
            </div>
        );
    }
}