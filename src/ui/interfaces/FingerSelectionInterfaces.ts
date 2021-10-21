export interface FingerSelectProps {
    selectedFinger: string,
    changeFingerSelection?: (index: string) => void,
    isReadOnly?: boolean
}

export interface FingerSelectState {
    selectedFinger: string
}