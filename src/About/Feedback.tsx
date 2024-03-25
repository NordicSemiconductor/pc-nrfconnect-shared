/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useMemo, useState } from 'react';

import { DialogButton, GenericDialog } from '../Dialog/Dialog';
import Dropdown, { DropdownItem } from '../Dropdown/Dropdown';
import logger from '../logging';
import describeError from '../logging/describeError';
import AboutButton from './AboutButton';
import sendFeedback from './sendFeedback';

export interface FeedbackPaneProps {
    isVisible: boolean;
    onHide: () => void;
    categories?: string[];
}

const FeedbackDialog = ({
    categories,
    onHide,
    isVisible,
}: FeedbackPaneProps) => {
    const [feedback, setFeedback] = useState('');
    const [sayThankYou, setSayThankYou] = useState(false);
    const [sendingFeedback, setSendingFeedback] = useState(false);

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

    return (
        <GenericDialog
            isVisible={isVisible}
            onHide={onHide}
            closeOnUnfocus
            title="Feedback"
            showSpinner={sendingFeedback}
            footer={
                <>
                    {sayThankYou ? (
                        <DialogButton
                            variant="secondary"
                            onClick={() => {
                                setSayThankYou(false);
                                setFeedback('');
                            }}
                        >
                            Give more feedback
                        </DialogButton>
                    ) : (
                        <DialogButton
                            variant="primary"
                            onClick={() => {
                                setSendingFeedback(true);
                                handleFormData(
                                    feedback,
                                    setSayThankYou,
                                    selectedCategory?.value
                                ).then(() => setSendingFeedback(false));
                            }}
                            disabled={feedback === '' || sendingFeedback}
                        >
                            Send feedback
                        </DialogButton>
                    )}
                    <DialogButton onClick={onHide}>Close</DialogButton>
                </>
            }
        >
            <div className="tw-flex tw-flex-col tw-items-start tw-justify-center tw-bg-white">
                {sayThankYou ? (
                    <>
                        <b className="tw-mb-3">Thank you!</b>
                        <p>
                            Thank you for providing feedback about how to
                            improve nRF Connect for Desktop applications.
                        </p>
                    </>
                ) : (
                    <>
                        <p>
                            We value your feedback and any ideas you may have
                            for improving nRF Connect for Desktop applications.
                            Use the form below.
                        </p>
                        <p>
                            We only collect the following information when you
                            send feedback:
                        </p>
                        <ul className="tw-list-disc tw-pl-8">
                            <li>Application name</li>
                            <li>Your feedback</li>
                            <li>Operating system</li>
                        </ul>
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
                            <div className="tw-pt-4">
                                <textarea
                                    name="feedback-text"
                                    className="tw-h-32 tw-w-full tw-border tw-border-gray-700 tw-p-2"
                                    required
                                    value={feedback}
                                    onChange={e => setFeedback(e.target.value)}
                                />
                            </div>
                        </form>
                    </>
                )}
            </div>
        </GenericDialog>
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

export default ({ categories }: { categories?: string[] }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <>
            <AboutButton
                label="Give Feedback"
                onClick={() => setIsVisible(true)}
            />
            <FeedbackDialog
                isVisible={isVisible}
                categories={categories}
                onHide={() => setIsVisible(false)}
            />
        </>
    );
};
