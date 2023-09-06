/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useMemo, useState } from 'react';

import Button from '../Button/Button';
import Dropdown, { DropdownItem } from '../Dropdown/Dropdown';
import logger from '../logging';
import describeError from '../logging/describeError';
import sendFeedback from './sendFeedback';

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
            <div className="tw-preflight tw-flex tw-w-full tw-justify-center">
                <div className="tw-mb-3 tw-flex tw-flex-col tw-items-start tw-justify-center tw-bg-white tw-px-3 tw-py-4">
                    <b className="tw-mb-3">Thank you!</b>
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
                        size="lg"
                        className="tw-align-self-end tw-self-end"
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
        <div className="tw-preflight tw-flex tw-w-full tw-justify-center">
            <div className="tw-mb-3 tw-flex tw-flex-col tw-items-start tw-justify-center tw-gap-4 tw-bg-white tw-px-3 tw-py-4">
                <b>Give Feedback</b>
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
                        className="tw-text-nordicBlue"
                    >
                        Nordic DevZone
                    </a>
                    .
                </p>
                <form className="tw-flex tw-w-full tw-flex-col tw-gap-4">
                    {categoryItems?.length && (
                        <div className="tw-w-52">
                            <Dropdown
                                items={categoryItems}
                                onSelect={setSelectedCategory}
                                selectedItem={
                                    selectedCategory || categoryItems[0]
                                }
                            />
                        </div>
                    )}
                    <div>
                        <b>What is your feedback?</b>
                        <textarea
                            name="feedback-text"
                            className="tw-h-32 tw-w-full tw-border tw-border-gray-700"
                            required
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                        />
                    </div>
                </form>
                <p>We only collect this information when you send feedback:</p>
                <ul className="tw-list-disc tw-pl-8">
                    <li>Application name</li>
                    <li>Your feedback</li>
                    <li>Operating system</li>
                </ul>
                <Button
                    size="lg"
                    className="tw-self-end"
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

const handleFormData = async (
    feedback: string,
    setResponse: (response: boolean) => void,
    category?: string
) => {
    try {
        await sendFeedback(feedback, category);

        setResponse(true);
    } catch (error: unknown) {
        logger.error(
            `FeedbackForm: Could not send feedback. ${describeError(error)}`
        );
    }
};
