import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeExternalLinks from 'rehype-external-links';

import classNames from '../utils/classNames';

interface MarkdownProps
    extends Pick<React.ComponentPropsWithRef<'div'>, 'ref' | 'className'> {
    children?: string;
}

const Markdown: React.FC<MarkdownProps> = ({
    className,
    children,
    ...attrs
}) => {
    const externalLinksPlugin = rehypeExternalLinks({
        target: '_blank',
    });

    return (
        <div
            className={classNames(
                'tw-preflight tw-flex tw-flex-col tw-gap-4 [&_h1]:tw-text-lg [&_h1]:tw-font-medium [&_h2]:tw-text-lg [&_h2]:tw-font-medium [&_h3]:tw-text-lg [&_h3]:tw-font-medium [&_h4]:tw-text-lg [&_h4]:tw-font-medium [&_h5]:tw-text-lg [&_h5]:tw-font-medium [&_h6]:tw-text-lg [&_h6]:tw-font-medium [&_ol]:tw-list-inside [&_ol]:tw-list-decimal [&_ul]:tw-list-inside [&_ul]:tw-list-disc',
                className,
            )}
            {...attrs}
        >
            <ReactMarkdown rehypePlugins={[externalLinksPlugin]}>
                {children}
            </ReactMarkdown>
        </div>
    );
};

export default Markdown;
