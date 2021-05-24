export interface ConfirmationProps {
    integrationName: string
}

interface CredentialKeyDefinition {
    name: string,
    rendered?: boolean,
    dataType: string,
    wide?: boolean,
    alternateKey?: string,
    alternateName?: string
}

/*
 * PII: An acronym for "personally identifiable information"
 *
 * This includes things like name, phone number, date of birth, etc.
 * You can see a larger explanation of the term (and concept) at https://en.wikipedia.org/wiki/Personal_data
 *
 */
export interface CredentialKeyMap {
    [index: string]: CredentialKeyDefinition
}

export interface CredentialKeyFieldsProps {
    fields: CredentialKeyMap
}

export interface CredentialKeyFieldState {
    columnOne: string[],
    columnTwo: string[]
}