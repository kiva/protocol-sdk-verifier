/* eslint-disable jsx-a11y/anchor-is-valid */

import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { notify } from "react-notify-toast";

import I18n from '../utils/I18n';

import '../css/Common.css';
import '../css/SearchMenu.css';

import { SearchProps, SearchState, SearchInputData } from '../interfaces/SearchInterfaces';
import FlowDispatchContext from '../contexts/FlowDispatchContext';
import FlowDispatchTypes from '../enums/FlowDispatchTypes';
import AlternateSearch from './AlternateSearch';

export default class SearchMenu extends React.Component<SearchProps, SearchState> {

    static contextType = FlowDispatchContext;
    private dispatch: any;

    constructor(props: SearchProps) {
        super(props);
        this.state = {
            filters: this.props.store.get('filters', {}),
            error: false,
            errorReason: "",
            altSearch: this.props.store.get('altSearch', false),
            externalId: this.props.store.get('externalId', 'nationalId')
        };
    }

    componentDidMount() {
        this.dispatch = this.context();
    }

    getExternalId = (): string => {
        return this.props.store.get('externalId', this.state.externalId);
    }

    getFilterValue = (): string => {
        return this.props.store.get('filters', this.state.filters)[this.state.externalId] || '';
    }

    handleFieldChange = (event: any): void => {
        event.preventDefault();
        const value = event.target.value;
        const prevFilters = this.props.store.get('filters', this.state.filters);
        const filters = {
            ...prevFilters,
            [this.state.externalId]: value
        }
        this.props.store.set('filters', filters);
        this.setState({ filters });
    }

    updateExternalId = (event: any): void => {
        event.preventDefault();
        const value = event.target.value;
        this.props.store.set('externalId', value);
        this.setState({
            externalId: value
        });
    }

    toggleSearchType = () => {
        this.props.store.set('altSearch', !this.state.altSearch);
        this.setState({
            altSearch: !this.state.altSearch
        });
    }

    switchToAltSearchMenu = () => {
        const filters: SearchInputData = this.state.filters;
        this.props.store.set('filters', filters);
        this.toggleSearchType();
    }

    handleSubmission = (stateData: any) => (event: any): void => {
        event.preventDefault();
        const filterValue: string = this.getFilterValue();
        if (filterValue.trim() === "") {
            notify.show(I18n.getKey('UNSET_ID_INPUT'), 'error', 3000);
            return;
        }

        const errorState: any = {
            error: true
        };
        if (this.getExternalId() === "nationalId" && !this.validateNIN(filterValue)) {
            errorState['errorReason'] = I18n.getKey('NATIONAL_ID_INPUT_ERROR');
        } else if (this.getExternalId() === "voterId" && !this.validateVoterID(filterValue)) {
            errorState['errorReason'] = I18n.getKey('VOTER_ID_INPUT_ERROR');
        }

        if (errorState.errorReason) {
            this.setState(errorState);
        } else {
            this.props.store.set('filters', this.props.store.get('filters', this.state.filters));
            this.dispatch({
                type: FlowDispatchTypes.NEXT
            });
        }
    }

    validateVoterID(input: string): boolean {
        const voterIdDigits: string[] = input.split("");

        return voterIdDigits.length === 7 && voterIdDigits.every((n: string) => !isNaN(Number(n)));
    }

    validateNIN(input: string): boolean {
        const parsed = input.match(/[A-Z0-9]/g);

        return !!parsed && parsed.length === 8 && input.length === 8;
    }

    renderSearch() {
        return <div data-cy="standard-search" className="flex-block">
            <Grid container
                direction="column"
                justify="center"
                alignItems="center">
                <Grid item>
                    <Typography component="h2" variant="h6" gutterBottom>
                        {I18n.getKey('ENTER_MESSAGE')}
                    </Typography>
                </Grid>
                <form name="ekycIdForm">
                    <Grid container
                        direction="row"
                        justify="center"
                        alignItems="center">
                        <Grid item id="id-select-menu">
                            <FormControl variant="outlined">
                                <Select
                                    value={this.state.externalId}
                                    onChange={this.updateExternalId}
                                    id="select-searchId"
                                    displayEmpty
                                    input={
                                        <OutlinedInput
                                            labelWidth={100}
                                            name="searchId"
                                            id="outlined-search-id"
                                        />
                                    }>
                                    <MenuItem value="none" disabled>{I18n.getKey('ID_OPTIONS')}</MenuItem>
                                    <MenuItem value="nationalId"><div className="id-type">{I18n.getKey('NIN')}</div></MenuItem>
                                    <MenuItem value="voterId"><div className="id-type">{I18n.getKey('VOTER_ID')}</div></MenuItem>
                                </Select>
                            </FormControl>

                        </Grid>
                        <Grid item>
                            <FormControl>
                                <TextField
                                    className="inspectletIgnore"
                                    data-cy="id-input"
                                    label={this.getFilterValue().trim() === "" ? I18n.getKey('INPUT_MSG') : ""}
                                    value={this.getFilterValue()}
                                    onChange={this.handleFieldChange}
                                    inputProps={{ 'aria-label': 'bare' }}
                                    margin="normal"
                                    name="inputId"
                                    error={!!this.state.error}
                                    helperText={this.state.errorReason || ""}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                    <div className="buttonListNew stack together loose">
                        <Button
                            type="submit"
                            id="scan-fingerprint"
                            onClick={this.handleSubmission(this.props.filters)}
                            onSubmit={this.handleSubmission(this.props.filters)}>
                            {I18n.getKey('SCAN_FP')}
                        </Button>
                        <Button
                            className="secondary"
                            onClick={() => this.dispatch({ type: FlowDispatchTypes.NEXT })}>
                            {I18n.getKey('BACK')}
                        </Button>
                        <a id="alternate-search" onClick={() => this.switchToAltSearchMenu()}>{I18n.getKey('ID_UNKNOWN')}</a>
                    </div>
                </form>
            </Grid>
        </div>
    }

    renderAltSearch() {
        return (
            <AlternateSearch
                {...this.props}
                toggleSearchType={this.toggleSearchType}
            />
        );
    }

    // TODO: Make the credential options configurable (i.e. don't limit to NIN and Voter ID)
    render() {
        if (this.state.altSearch) {
            return this.renderAltSearch();
        } else {
            return this.renderSearch();
        }
    }
}