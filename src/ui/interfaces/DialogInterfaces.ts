interface DialogCommonProps {
    clickFunction(open: boolean): void;
    allowCancel?: boolean;
    errorMessage: string;
    complete: boolean;
    success: boolean;
}

export interface DialogContainerProps
    extends DialogCommonProps {
    open: boolean;
    rejection: boolean;
    handleCancel?: () => void;
    dismissCancel?: () => void;
}

export interface DialogBodyProps extends DialogCommonProps {
    cancel?: () => void;
}