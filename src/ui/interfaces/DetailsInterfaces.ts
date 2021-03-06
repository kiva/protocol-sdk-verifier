import ICommonProps from './ICommonProps';

export interface DetailsProps extends ICommonProps {
    personalInfo: any,
    actionButtonCaption: string,
    exportAction(): void,
    printButtonCaption: string
}

export interface PhotoAttach {
    data: string,
    type: string,
    encoding: string
}
