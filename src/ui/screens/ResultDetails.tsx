import * as React from 'react';
import '../css/ResultDetails.scss';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

import classNames from 'classnames';
import I18n from '../utils/I18n';

import {CONSTANTS} from "../../constants/constants";
import _ from "lodash";
import {DetailsProps, PhotoAttach} from "../interfaces/DetailsInterfaces";
import {CredentialKeyMap} from "../interfaces/ConfirmationProps";

const CredentialKeys: CredentialKeyMap = CONSTANTS.credentialKeyMap;

const wideKeys: string[] = [];
const itemList: any = {};

export default class ResultDetails extends React.Component<DetailsProps> {

    private personalInfo: any = this.props.store.get('personalInfo', {}, this.props.prevScreen);

    componentDidMount() {
        this.props.store.reset();
        this.dispatchEkycComplete();
    }

    dispatchEkycComplete = () => {
        const sendingObject = {
            key: 'kycCompleted',
            detail: this.personalInfo
        };
        console.info("Sending kycCompleted", sendingObject);
        window.parent.postMessage(sendingObject, "*");
    }

    getPIIDisplayString(key: string, val: string) {
        try {
            let piiString = val;
            const dataKey = _.findKey(CredentialKeys, (item) => {return item.name === key});
            if (dataKey && CredentialKeys[dataKey] && CredentialKeys[dataKey].dataType === "date") {
                piiString = new Date(Number(val)).toLocaleDateString(
                    'en-gb',
                    {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }
                );
            }
            return piiString;
        } catch {
            return I18n.getKey('noData');
        }
    }

    renderFields(title: string, fields: any) {
        this.processCredentialKeys();
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
                <div key={key}
                    className={
                        classNames({
                            FieldCard: true,
                            wide: wideItemKeys.indexOf(key) > -1
                        })}>
                    <div className="FieldCardTitle">{key}</div>
                    <div className="FieldCardValue">{this.getPIIDisplayString(key, value)}</div>
                </div>
            );
        }
        return <div className="ProfileItemContainer">
            {items}
        </div>
    }

    processCredentialKeys() {
        for (let k in CredentialKeys) {
            let key: string = CredentialKeys[k].alternateKey || k,
                name: string = CredentialKeys[k].alternateName || CredentialKeys[k].name,
                rendered: boolean = CredentialKeys[k].rendered || false,
                isWide: boolean = CredentialKeys[k].wide || false;

            if (isWide) {
                wideKeys.push(name);
            }
            if (rendered && this.personalInfo.hasOwnProperty(key)) {
                itemList[name] = this.personalInfo[key];
            }
        }
    }

    createPhotoData(photoAttach: string): string {
        let ret: string = "";
        try {
            const photoData: PhotoAttach = JSON.parse(photoAttach);
            const {data, encoding, type} = photoData;
            ret = `data:${type};${encoding},${data}`;
        } catch {
            ret = "data:image/png;base64," + photoAttach;
        } finally {
            return ret;
        }
    }

    render() {
        const pictureData: string = this.createPhotoData(this.personalInfo["photo~attach"]);

        return <Paper className="ProfileCardContainer"
            elevation={1}>
            <div className="ProfileCard">
                <div className="Column2">
                    <h3>{I18n.getKey('EKYC_RECORD_TYPE')}</h3>
                    <img className="PictureProfile"
                        alt=""
                        src={pictureData}/>
                    {false && <Button
                        className="export-profile"
                        onClick={this.dispatchEkycComplete}>
                        {I18n.getKey('EXPORT_PROFILE')}
                    </Button>}
                    {this.renderFields(I18n.getKey('CREDENTIALING_AGENCY'), itemList)}
                    <div className="important-buttons">
                        <Button
                            className="back"
                            onClick={() => {
                                if (window.opener) {
                                    window.opener.location.href = "https://pro-cluster-kiva.web.app/";
                                    window.close();
                                }
                            }}>
              Back
                        </Button>
                    </div>
                </div>
            </div>
        </Paper>
    }
}
