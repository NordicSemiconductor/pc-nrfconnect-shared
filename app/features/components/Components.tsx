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
                onClick={() => {
                    alert('Button clicked');
                }}
            >
                Button
            </Button>

            <h1>Card</h1>
            <Card title="Card title">Card content</Card>

            <h1>Dialog</h1>
            <Button onClick={() => setShowConfirmationDialog(true)}>
                Open dialog
            </Button>

            <ConfirmationDialog
                isVisible={showConfirmationDialog}
                okButtonText="Ok button"
                cancelButtonText="Cancel button"
                text="Text property"
                onOk={() => {
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
            <StartStopButton onClick={() => {}} />

            <h1>StateSelector</h1>
            <StateSelector
                items={['A', 'B']}
                onSelect={() => {}}
                selectedItem="A"
            />

            <h1>Toggle</h1>
            <Toggle isToggled={false} />
            <Toggle isToggled />
        </>
    );
};

export default AlertPage;
