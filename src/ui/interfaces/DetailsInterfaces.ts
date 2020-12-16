export interface DetailsProps {
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
