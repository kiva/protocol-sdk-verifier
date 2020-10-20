import * as React from 'react';
import '../css/ResultDetails.css';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

import classNames from 'classnames';
import I18n from '../utils/I18n';

import {CONSTANTS} from "../../constants/constants";

import {DetailsProps} from "../interfaces/DetailsInterfaces";
import {PIImap} from "../interfaces/ConfirmationProps";

const PII: PIImap = CONSTANTS.pii_map;

const wideKeys: string[] = [];
const itemList: any = {}; 

export default class ResultDetails extends React.Component<DetailsProps> {

    renderFields(title: string, fields: any) {
        this.processPII();
        const items: any[] = [];
        const wideItemKeys: string[] = [
            "DID",
            "publicKey",
            ...wideKeys
        ];

        for (var key in fields) {
            if (!fields.hasOwnProperty(key)) {
                continue;
            }
            const value = fields[key];
            items.push(
                <div key={key} className={
                    classNames({
                        FieldCard: true,
                        wide: wideItemKeys.indexOf(key) > -1
                    })}>
                    <div className="FieldCardTitle">{key}</div>
                    <div className="FieldCardValue">{value}</div>
                </div>
            );
        }
        return <div className="ProfileItemContainer">
            {items}
        </div>
    }

    processPII() {
        for (let k in PII) {
            let key: string = PII[k].alternateKey || k,
                name: string = PII[k].alternateName || PII[k].name,
                rendered: boolean = PII[k].rendered || false,
                isWide: boolean = PII[k].wide || false;

            if (isWide) {
                wideKeys.push(name);
            }
            if (rendered && this.props.personalInfo.hasOwnProperty(key)) {
                itemList[name] = this.props.personalInfo[key];
            }
        }
    }

    render() {
        const pictureData: string = this.props.personalInfo.photoHash;

        return <Paper className="ProfileCardContainer" elevation={1}>
            <div className="ProfileCard">
                <div className="Column2">
                    <h3>{I18n.getKey('EKYC_RECORD_TYPE')}</h3>
                    <img className="PictureProfile" alt="" src={"data:image;base64," + pictureData}/>
                    <Button
                        className="export-profile"
                        onClick={this.props.exportAction}>
                        {this.props.actionButtonCaption}
                    </Button>
                    {this.renderFields(I18n.getKey('CREDENTIALING_AGENCY'), itemList)}
                </div>
            </div>
        </Paper>
    }
}
