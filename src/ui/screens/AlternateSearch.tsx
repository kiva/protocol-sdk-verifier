import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import classNames from 'classnames';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { notify } from "react-notify-toast";

import '../css/Common.css';
import '../css/AlternateSearch.css';

import I18n from '../utils/I18n';

import { AltSearchProps, AltSearchState, AltSearchInputData } from '../interfaces/SearchInterfaces';
import FlowDispatchContext from '../contexts/FlowDispatchContext';
import FlowDispatchTypes from '../enums/FlowDispatchTypes';

export default class AlternateSearch extends React.Component<AltSearchProps, AltSearchState> {

    static contextType = FlowDispatchContext;
    private dispatch: any;

    constructor(props: AltSearchProps) {
        super(props);
        const search = props.store.get('search', {
            birthDate: '',
            mothersFirstName: '',
            fathersFirstName: '',
            firstName: '',
            lastName: ''
        });
        this.state = {
            search,
            errors: {
                firstName: false,
                lastName: false,
                mothersFirstName: false,
                fathersFirstName: false,
                birthDate: false
            },
            rows: [
                search.birthDate || false,
                (search.mothersFirstName
                    || search.fathersFirstName) || false
            ]
        }
    }

    componentDidMount() {
        this.dispatch = this.context();
    }

    validateInputs(data: AltSearchInputData): boolean {
        const errors: any = {};
        for (let input in data) {
            let msg = (input === "birthDate") ? this.validateBirthDate() : this.validateInputText(input);
            if (msg) {
                errors[input] = msg;
            }
        }

        if (Object.keys(errors).length) {
            this.setState({ errors });
            return false;
        } else {
            return true;
        }
    }

    validateDataRequirements(inputs: string[]): boolean {
        if (inputs.indexOf("firstName") === -1 || inputs.indexOf("lastName") === -1) {
            notify.show(I18n.getKey('MISSING_NAMES_ERROR'), 'error', 3000);
            return false;
        }

        if (inputs.indexOf("birthDate") > -1
            || inputs.indexOf("mothersFirstName") > -1
            || inputs.indexOf("fathersFirstName") > -1) {
            return true;
        } else {
            notify.show(I18n.getKey('MISSING_FUZZY_DATA_ERROR'), 'error', 7000);
            return false;
        }
    }

    validateBirthDate(): any {
        const bday: string | undefined = this.state.search.birthDate;
        if (bday && !Date.parse(bday)) {
            return I18n.getKey('DATE_INPUT_ERROR');
        }

        // Input is valid
        return false;
    }

    validateInputText(k: string): any {
        const inputValue: string | undefined = this.state.search[k];
        if (!inputValue
            || inputValue.length <= 0
            || inputValue.length > 50) {
            return I18n.computeKey({
                minimum: 1,
                maximum: 50
            }, 'INPUT_LENGTH_ERROR');
        }

        // Input is valid
        return false;
    }

    handleFieldChange = (filterKey: string) => (event: any): void => {
        event.preventDefault();
        this.setState({
            search: {
                ...this.state.search,
                [filterKey]: event.target.value
            }
        });
    }

    deleteEmptyValues(searchData: AltSearchInputData): AltSearchInputData {
        const data = searchData;
        for (let k in data) {
            if (!data[k]) {
                delete data[k];
            }
        }
        return data;
    }

    handleSubmission = () => (event: any) => {
        event.preventDefault();
        const data: AltSearchInputData = this.deleteEmptyValues(this.state.search);
        const keys = Object.keys(data);

        if (this.validateInputs(data) && this.validateDataRequirements(keys)) {
            this.props.store.set('search', data);
            this.dispatch({
                type: FlowDispatchTypes.NEXT
            })
        }
    };

    handleRowClick = (index: number) => (): void => {
        const rows = this.state.rows;
        rows[index] = !rows[index];
        this.setState({ rows });
    };

    // TODO:
    //     1) Figure out a way to break out form rows into their own component
    //     2) Add a fixed width to header text, because adding specific linebreaks will get tricky
    //     3) Figure out a scalable way to make the row toggling work i.e. not using specific indices
    render() {
        return <div data-cy="alternate-search" className="flex-block">
            <Grid container
                direction="column"
                justify="center"
                alignItems="center">
                <form name="ekycFuzzySearchForm">
                    <Grid item>
                        <Typography id="instructions" component="h2" align="center">
                            {I18n.getKey('ALTERNATESEARCH_INSTRUCTIONS')}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography component="h2" variant="h6" gutterBottom align="center">
                            {I18n.computeKey({
                                first: I18n.getKey('FIRSTNAME'),
                                last: I18n.getKey('LASTNAME')
                            }, 'ENTER_FIRST_LAST')}
                        </Typography>
                    </Grid>
                    <Grid container
                        className="alternate-search-row"
                        direction="row"
                        justify="space-around"
                        alignItems="center">
                        <Grid item xs={12} md={5}>
                            <TextField
                                className="inspectletIgnore alternate-search-field required"
                                data-cy="firstname-input"
                                label={`${I18n.getKey('FIRSTNAME')} (${I18n.getKey('REQUIRED')})`}
                                value={this.state.search.firstName || ""}
                                onChange={this.handleFieldChange("firstName")}
                                inputProps={{ 'aria-label': 'bare' }}
                                margin="dense"
                                name="inputFirstname"
                                error={!!this.state.errors.firstName}
                                helperText={this.state.errors.firstName}
                            />
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <TextField
                                className="inspectletIgnore alternate-search-field required"
                                data-cy="lastname-input"
                                label={`${I18n.getKey('LASTNAME')} (${I18n.getKey('REQUIRED')})`}
                                value={this.state.search.lastName || ""}
                                onChange={this.handleFieldChange("lastName")}
                                inputProps={{ 'aria-label': 'bare' }}
                                margin="dense"
                                name="inputLastname"
                                error={!!this.state.errors.lastName}
                                helperText={this.state.errors.lastName}
                            />
                        </Grid>
                    </Grid>
                    <Grid item onClick={this.handleRowClick(0)}>
                        <Typography
                            data-cy="dob-row-header"
                            className={classNames({
                                expandable: true,
                                expanded: this.state.rows[0]
                            })}
                            component="h2"
                            variant="h6"
                            align="center">
                            {I18n.getKey('ENTER_DOB')}
                            <AccordionArrow
                                fontSize="large"
                                className={"accordion-arrow " + (this.state.rows[0] ? "open" : "closed")}
                            />
                        </Typography>
                    </Grid>
                    <Grid container
                        className={classNames({
                            "alternate-search-row": true,
                            labelled: true,
                            hidden: !this.state.rows[0]
                        })}
                        direction="row"
                        justify="space-around"
                        alignItems="center">
                        <Grid item xs={12} md={5}>
                            <TextField
                                className="inspectletIgnore alternate-search-field"
                                data-cy="birthdate-input"
                                label={I18n.getKey('DOB')}
                                type="date"
                                value={this.state.search.birthDate || ""}
                                onChange={this.handleFieldChange("birthDate")}
                                margin="dense"
                                name="inputBirthdate"
                                error={!!this.state.errors.birthDate}
                                helperText={this.state.errors.birthDate}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Grid item className="or" onClick={this.handleRowClick(1)}>
                        <Typography
                            data-cy="parents-names-row-header"
                            className={classNames({
                                expandable: true,
                                expanded: this.state.rows[1]
                            })}
                            component="h2"
                            variant="h6"
                            align="center">
                            {I18n.getKey('ENTER_PARENTS_NAMES')}
                            <AccordionArrow
                                fontSize="large"
                                className={"accordion-arrow " + (this.state.rows[1] ? "open" : "closed")}
                            />
                        </Typography>
                        <h3
                            data-cy="parents-names-subheader"
                            className={classNames({
                                "row-subheader": true,
                                "align-center": true,
                                hidden: !this.state.rows[1]
                            })}
                        >
                            ({I18n.getKey('REQUIRED_WO_DOB')})
                        </h3>
                    </Grid>
                    <Grid container
                        className={classNames({
                            "alternate-search-row": true,
                            hidden: !this.state.rows[1]
                        })}
                        direction="row"
                        justify="space-around"
                        alignItems="center">
                        <Grid item xs={12} md={5}>
                            <TextField
                                className="inspectletIgnore alternate-search-field"
                                data-cy="mothersfirstname-input"
                                label="Mother's First Name"
                                value={this.state.search.mothersFirstName || ""}
                                onChange={this.handleFieldChange("mothersFirstName")}
                                inputProps={{ 'aria-label': 'bare' }}
                                margin="dense"
                                name="inputMothersFirstName"
                                error={!!this.state.errors.mothersFirstName}
                                helperText={this.state.errors.mothersFirstName}
                            />
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <TextField
                                className="inspectletIgnore alternate-search-field"
                                data-cy="fathersfirstname-input"
                                label="Father's First Name"
                                value={this.state.search.fathersFirstName || ""}
                                onChange={this.handleFieldChange("fathersFirstName")}
                                inputProps={{ 'aria-label': 'bare' }}
                                margin="dense"
                                name="inputFathersFirstName"
                                error={!!this.state.errors.fathersFirstName}
                                helperText={this.state.errors.fathersFirstName}
                            />
                        </Grid>
                    </Grid>
                    <div className="buttonListNew stack centered">
                        <Button
                            type="submit"
                            id="scan-fingerprint"
                            onClick={this.handleSubmission()}
                            onSubmit={this.handleSubmission()}>
                            {I18n.getKey('SCAN_FP')}
                        </Button>
                        <Button
                            className="back"
                            onClick={() => this.props.toggleSearchType()}>
                            {`< ${I18n.getKey('BACK')}`}
                        </Button>
                    </div>
                </form>
            </Grid>
        </div>
    }
}

function AccordionArrow(props: any) {
    if (props.className === "accordion-arrow open") {
        return <ArrowDropUpIcon {...props} />
    } else {
        return <ArrowDropDownIcon {...props} />
    }
}