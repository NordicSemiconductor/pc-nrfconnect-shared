/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';

import {
    Alert,
    Button,
    Card,
    ConfirmationDialog,
    Dropdown,
    InlineInput,
    Logo,
    NumberInlineInput,
    Slider,
    Spinner,
    StartStopButton,
    StateSelector,
    Steppers,
    Toggle,
} from '../../../src';

const AlertPage = () => {
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

    return (
        <>
            <h1>Something</h1>
            <h1>Alert</h1>
            <Alert variant="info" label="Label">
                Alert with a label
            </Alert>

            <Alert variant="warning">Alert without a label</Alert>
            <Alert variant="danger" dismissable>
                Dismissable alert
            </Alert>
            <Alert
                variant="success"
                dismissable
                onClose={() => alert('onClose!')}
            >
                Dismissable alert with close handler
            </Alert>

            <h1>Button</h1>
            <Button
                variant="primary"
                onClick={() => {
                    alert('Button clicked');
                }}
            >
                Button
            </Button>

            <h1>Card</h1>
            <Card title="Card title">Card content</Card>

            <h1>Dialog</h1>
            <Button
                variant="primary"
                onClick={() => setShowConfirmationDialog(true)}
            >
                Open dialog
            </Button>

            <ConfirmationDialog
                isVisible={showConfirmationDialog}
                confirmLabel="Ok button"
                cancelLabel="Cancel button"
                onConfirm={() => {
                    setShowConfirmationDialog(false);
                }}
                onCancel={() => {
                    setShowConfirmationDialog(false);
                }}
            >
                Content of confirmation dialog
            </ConfirmationDialog>

            <h1>Spinner</h1>
            <Spinner />

            <h1>Drowdown</h1>

            <Dropdown
                items={[{ label: 'Label', value: 'Value' }]}
                onSelect={item => alert(`Selected ${item.value}`)}
                selectedItem={{ label: 'Label', value: 'Value' }}
            />

            <h1>Inline Input</h1>
            <span>
                Input here:{' '}
                <InlineInput value="Some value" onChange={() => {}} />
                and a number inline input{' '}
                <NumberInlineInput
                    range={{ min: 0, max: 10 }}
                    onChange={() => {}}
                    value={0}
                />
            </span>

            <h1>Logo</h1>
            <Logo changeWithDeviceState={false} />

            <h1>Slider</h1>
            <Slider onChange={[]} values={[2]} range={{ min: 0, max: 10 }} />

            <h1>StartStopButton</h1>
            <StartStopButton started={false} onClick={() => {}} />
            <StartStopButton started onClick={() => {}} />

            <h1>StateSelector</h1>
            <StateSelector
                items={['A', 'B']}
                onSelect={() => {}}
                selectedItem="A"
            />

            <h1>Toggle</h1>
            <Toggle isToggled={false} />
            <Toggle isToggled />

            <div className="my-3" />

            <Steppers
                steps={[
                    { title: 'Active', caption: 'active', state: 'active' },
                    { title: 'Warning', caption: 'warning', state: 'warning' },
                    { title: 'Success', caption: 'success', state: 'success' },
                    { title: 'Failure', caption: 'failure', state: 'failure' },
                    { title: 'Step 5', caption: 'some caption' },
                    { title: 'Step 6', caption: 'some tooltip' },
                ]}
            />
        </>
    );
};

export default AlertPage;
