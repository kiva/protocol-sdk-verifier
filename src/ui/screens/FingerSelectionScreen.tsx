import Grid from '@material-ui/core/Grid';
import * as React from "react";

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import '../css/Common.css';
import '../css/FingerSelectionScreen.css';
import map from "lodash/map";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import FingerUtils from '../utils/FingerUtils';
import I18n from '../utils/I18n';
import fpImage from '../images/fingers_small.png';

import { FingerSelectProps, FingerSelectState } from "../interfaces/FingerSelectionInterfaces";
import { FingerTypesMap } from "../interfaces/UtilInferfaces";

const fingerTypes: FingerTypesMap = FingerUtils.buildFingerTypes();

export default class FingerSelectionScreen extends React.Component<FingerSelectProps, FingerSelectState> {
    constructor(props: FingerSelectProps) {
        super(props);
        this.state = {
            selectedFinger: this.props.selectedFinger
        };
    }

    buildCaptionFromFingerType(finger: string): string {
        return fingerTypes[finger];
    }

    renderReadOnlyVersion() {
        const { selectedFinger } = this.state;
        return <div className="flex-block">
            <Grid container
                direction="column"
                justify="center"
                alignItems="center">
                <div className="FingerContainer">
                    <RadioGroup
                        aria-label="FingerSelection"
                        name="finger"
                        className="RadioGroup"
                        value={this.state.selectedFinger}>
                        {
                            map(fingerTypes, (value: string, key: string) => {
                                const isChecked = key === selectedFinger;
                                if (!isChecked) {
                                    return null;
                                }
                                return <FormControlLabel
                                    key={key}
                                    style={{
                                        ...radioButtonStyles[key],
                                        position: 'absolute',
                                    }}
                                    value={value}
                                    control={<Radio disableRipple disabled={!isChecked} checked={isChecked} color="primary" />}
                                    label={""} />
                            })
                        }
                    </RadioGroup>
                </div>
            </Grid>
        </div>
    }

    renderEditVersion() {
        const { selectedFinger } = this.state;
        return <div className="flex-block">
            <Grid container
                direction="column"
                justify="center"
                alignItems="center">

                <Grid item>
                    <Typography component="h2" variant="h6" gutterBottom>
                        {I18n.getKey('SELECT_NEW_FINGER')}
                    </Typography>
                </Grid>
                <Grid container
                    direction="column"
                    justify="center"
                    alignItems="center">
                    <div className="FingerContainer" style={{
                        background: `url(${fpImage}) no-repeat center center`
                    }}>
                        <RadioGroup
                            aria-label="FingerSelection"
                            name="finger"
                            className="RadioGroup"
                            value={this.state.selectedFinger}>
                            {
                                map(fingerTypes, (value: string, key: string) => {
                                    const isChecked = key === selectedFinger;
                                    return <FormControlLabel
                                        key={key}
                                        style={{
                                            ...radioButtonStyles[key],
                                            position: 'absolute',
                                        }}
                                        value={value}
                                        control={<Radio disableRipple checked={isChecked} color="primary" />}
                                        label={""}
                                        onClick={() => {
                                            this.setState({
                                                selectedFinger: key
                                            });
                                        }} />
                                })
                            }
                        </RadioGroup>
                    </div>
                </Grid>
                <Button
                    data-cy="back"
                    className="finger-select"
                    onClick={() => {
                        this.props.changeFingerSelection && this.props.changeFingerSelection(this.state.selectedFinger);
                    }}>
                    {this.state.selectedFinger !== this.props.selectedFinger ?
                        (<span>{I18n.getKey('USE')} <strong>{this.buildCaptionFromFingerType(this.state.selectedFinger)}</strong></span>) :
                        `${I18n.getKey('LEAVE_FP_SELECT')}`
                    }
                </Button>
            </Grid>
        </div>
    }

    render() {
        if (this.props.isReadOnly) {
            return this.renderReadOnlyVersion();
        } else {
            return this.renderEditVersion();
        }
    }
}

const radioButtonStyles: any = {
    right_thumb: {
        top: 108,
        left: 221
    },
    right_index: {
        top: 41,
        left: 248
    },
    right_middle: {
        top: 28,
        left: 291
    },
    right_ring: {
        top: 42,
        left: 332,
    },
    right_little: {
        top: 76,
        left: 367
    },
    left_thumb: {
        top: 108,
        left: 163
    },
    left_index: {
        top: 41,
        left: 137,
    },
    left_middle: {
        top: 28,
        left: 94
    },
    left_ring: {
        top: 42,
        left: 52
    },
    left_little: {
        top: 76,
        left: 18
    }
};