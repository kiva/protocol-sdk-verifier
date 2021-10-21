import * as React from "react";

import Button from '@material-ui/core/Button';

import { RejectionProps } from "../interfaces/RejectionProps";

import '../css/Common.css';
import '../css/RejectionScreen.css';

export default class RejectionScreen extends React.Component<RejectionProps> {
    constructor(props: RejectionProps) {
        super(props);

        if (!this.props.rejection.rejected) {
            this.props.handleRestart();
        }
    }

    render() {
        return <div className="extraterrestrialLayer">
            {this.props.children}
            <div id="error-text">
                {this.props.rejection.reason}
            </div>
            <Button
                data-cy="restart-button"
                onClick={this.props.handleRestart}>
                Start Again
            </Button>
        </div>;
    }
}
