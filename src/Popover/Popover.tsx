import React, { type HTMLAttributes } from 'react';

import Button, { type ButtonProps } from '../Button/Button';
import classNames from '../utils/classNames';

interface PopoverOpenButtonProps
    extends Omit<ButtonProps, 'command' | 'commandfor'> {
    popoverId: string;
}

type PopoverOpenButtonComponent = React.FC<
    React.PropsWithChildren<PopoverOpenButtonProps>
>;

const PopoverOpenButton: PopoverOpenButtonComponent = ({
    children,
    popoverId,
    ...attrs
}) => (
    <Button command="show-popover" commandfor={popoverId} {...attrs}>
        {children}
    </Button>
);

type PopoverClosingBehavior = 'normal' | 'hint' | 'manual';

const popoverClosingBehaviorLookup: Record<
    PopoverClosingBehavior,
    HTMLAttributes<HTMLDialogElement>['popover']
> = {
    normal: 'auto',
    hint: 'hint',
    manual: 'manual',
};

interface PopoverProps
    extends Pick<React.ComponentPropsWithRef<'dialog'>, 'ref' | 'className'> {
    id: string;
    closingBehavior?: PopoverClosingBehavior;
}

interface PopoverComponent
    extends React.FC<React.PropsWithChildren<PopoverProps>> {
    OpenButton: PopoverOpenButtonComponent;
}

const Popover: PopoverComponent = ({
    children,
    className,
    id,
    closingBehavior = 'normal',
    ...attrs
}) => {
    const popoverType = popoverClosingBehaviorLookup[closingBehavior];

    return (
        <dialog
            // eslint-disable-next-line react/no-unknown-property
            popover={popoverType}
            id={id}
            className={classNames(
                'tw-preflight tw-absolute tw-border tw-border-solid tw-border-black/10',
                className,
            )}
            {...attrs}
        >
            {children}
        </dialog>
    );
};

Popover.OpenButton = PopoverOpenButton;

export default Popover;
