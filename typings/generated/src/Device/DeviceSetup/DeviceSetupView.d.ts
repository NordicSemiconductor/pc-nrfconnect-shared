import React from 'react';
export interface DeviceSetupViewProps {
    isVisible: boolean;
    isInProgress: boolean;
    text?: string | null;
    choices: readonly string[];
    onOk: (choice: string | boolean) => void;
    onCancel: () => void;
}
interface State {
    selectedChoice: null | string;
}
/**
 * Dialog that allows the user to provide input that is required during device setup
 * (programming/DFU). If the 'choices' prop is provided, then the user will see a
 * list of choices, and select one of them. If not, then user will just respond yes/no.
 *
 * The 'onConfirm' callback is called with one of the choices or just true if it is a
 * simple yes/no confirmation. Shows a spinner and disables input if the 'isInProgress'
 * prop is set to true.
 */
export default class DeviceSetupDialog extends React.Component<DeviceSetupViewProps, State> {
    constructor(props: DeviceSetupViewProps);
    onSelectChoice(choice: string): void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=DeviceSetupView.d.ts.map