/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useMemo, useState } from 'react';

import Button from '../Button/Button';
import Dropdown, { DropdownItem } from '../Dropdown/Dropdown';
import logger from '../logging';
import { isDevelopment } from '../utils/environment';
import packageJson from '../utils/packageJson';

export interface FeedbackPaneProps {
    categories?: string[];
}

export default ({ categories }: FeedbackPaneProps) => {
    const [feedback, setFeedback] = useState('');
    const [sayThankYou, setSayThankYou] = useState(false);

    const categoryItems = useMemo(() => {
        if (!categories?.length) return undefined;

        const items = ['Select a category', ...categories].map(category => ({
            label: category,
            value: category,
        }));
        return items;
    }, [categories]);

    const [selectedCategory, setSelectedCategory] = useState<
        DropdownItem | undefined
    >(categoryItems ? categoryItems[0] : undefined);

    if (sayThankYou === true) {
        return (
            <div className="w-100 d-flex justify-content-center">
                <div className="d-flex flex-column justify-content-center align-items-start bg-white px-3 py-4">
                    <b className="mb-3">Thank you!</b>
                    <section>
                        <p>
                            We value your feedback and any ideas you may have
                            for improving our applications.
                        </p>
                        <p>
                            Click the button below in order to send more
                            feedback.
                        </p>
                    </section>
                    <Button
                        large
                        className="align-self-end"
                        onClick={() => {
                            setSayThankYou(false);
                            setFeedback('');
                        }}
                        variant="secondary"
                    >
                        Give more feedback
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-100 d-flex justify-content-center">
            <div className="d-flex flex-column justify-content-center align-items-start bg-white px-3 py-4">
                <b className="mb-3">Give Feedback</b>
                <section>
                    <p>
                        We value your feedback and any ideas you may have for
                        improving our applications. Please use the form below to
                        give feedback.
                    </p>
                    <p>
                        Note: this is not a support channel, and you will not
                        receive a response. For help and support, visit the{' '}
                        <a
                            href="https://devzone.nordicsemi.com/"
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            Nordic DevZone
                        </a>
                        .
                    </p>
                </section>
                <form className="d-flex flex-column w-100">
                    {categoryItems?.length && (
                        <Dropdown
                            items={categoryItems}
                            onSelect={setSelectedCategory}
                            selectedItem={selectedCategory || categoryItems[0]}
                        />
                    )}
                    <label htmlFor="feedback-text">
                        <b>What is your feedback?</b>
                        <textarea
                            name="feedback-text"
                            className="w-100 mb-3"
                            style={{ height: '8rem' }}
                            required
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                        />
                    </label>
                </form>
                <section>
                    <p>
                        We only collect this information when you send feedback:
                    </p>
                    <ul>
                        <li>Application name</li>
                        <li>Your feedback</li>
                        <li>Operating system</li>
                    </ul>
                </section>
                <Button
                    large
                    className="align-self-end"
                    variant="primary"
                    onClick={() =>
                        handleFormData(
                            feedback,
                            setSayThankYou,
                            selectedCategory?.value
                        )
                    }
                    disabled={feedback === ''}
                >
                    Send Feedback
                </Button>
            </div>
        </div>
    );
};

const formURL =
    isDevelopment === true
        ? 'https://formkeep.com/f/8deb409a565'
        : 'https://formkeep.com/f/36b394b92851';

const handleFormData = async (
    feedback: string,
    setResponse: (response: boolean) => void,
    category?: string
) => {
    const data: Record<string, unknown> = {
        name: getAppName(),
        feedback,
        platform: process.platform,
    };

    if (category && category !== 'Select a category') {
        data.category = category;
    }

    try {
        const response = await fetch(formURL, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                enctype: 'multipart/form-data',
            },
        });

        if (response.ok) {
            setResponse(true);
            return;
        }

        logger.error(
            `FeedbackForm: Server responded with status code ${response.status}`
        );
    } catch (error: unknown) {
        logger.error(
            `FeedbackForm: Could not send feedback. ${JSON.stringify(error)}`
        );
    }
};

const getAppName = () => packageJson().name;
