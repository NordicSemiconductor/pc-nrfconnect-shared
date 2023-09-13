/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type {
    AutoDetectTypes,
    SetOptions,
    UpdateOptions,
} from '@serialport/bindings-cpp';
import type { SerialPortOpenOptions } from 'serialport';

import { SerialPort } from '../SerialPort/SerialPort';
import {
    shellParser as CreateShellParser,
    ShellParserSettings,
    XTerminalShellParser,
} from './shellParser';

jest.useFakeTimers();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let onResponseCallback = (data: Uint8Array) => {};

const setupMocks = () => {
    const mockOnData = jest.fn((handler: (data: Uint8Array) => void) => {
        onResponseCallback = handler;
        return () => {};
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mockOnClose = jest.fn((_handler: () => void) => () => {});

    const mockOnUpdate = jest.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_handler: (newOptions: UpdateOptions) => void) => () => {}
    );

    const mockOnSet = jest.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_handler: (newOptions: SetOptions) => void) => () => {}
    );

    const mockOnChange = jest.fn(
        (
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                _handler: (
                    newOptions: SerialPortOpenOptions<AutoDetectTypes>
                ) => void
            ) =>
            () => {}
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let onDataWrittenCallback = (data: Uint8Array) => {};
    const mockOnDataWritten = jest.fn(
        (handler: (data: Uint8Array) => void) => () => {
            onDataWrittenCallback = handler;
            return () => {};
        }
    );

    const mockClose = jest.fn(async () => {});
    const mockWrite = jest.fn((data: string | number[] | Buffer) =>
        Promise.resolve(onDataWrittenCallback(Buffer.from(data)))
    );

    const mockIsOpen = jest.fn(
        () =>
            new Promise<boolean>(resolve => {
                resolve(true);
            })
    );
    const mockGetOptions = jest.fn(
        () => new Promise<SerialPortOpenOptions<AutoDetectTypes>>(() => {})
    );
    const mockUpdate = jest.fn(() => Promise.resolve());
    const mockSet = jest.fn(() => Promise.resolve());

    const mockOnAnyCommandResponse = jest.fn(() => '');
    const mockOnShellLogging = jest.fn(() => '');
    const mockOnUnknown = jest.fn(() => '');

    const mockOnSuccess = jest.fn(() => '');
    const mockOnError = jest.fn(() => '');

    const settings: ShellParserSettings = {
        shellPromptUart: 'uart:~$',
        logRegex:
            /[[][0-9]{2,}:[0-9]{2}:[0-9]{2}.[0-9]{3},[0-9]{3}] <([^<^>]+)> ([^:]+): .*(\r\n|\r|\n)$/,
        errorRegex: /error: /,
        timeout: 1000,
        columnWidth: 80,
    };

    const mockModem = jest.fn<SerialPort, []>(() => ({
        path: 'fakePort',
        write: mockWrite,
        close: mockClose,
        isOpen: mockIsOpen,
        getOptions: mockGetOptions,
        update: mockUpdate,
        set: mockSet,
        onData: mockOnData,
        onClosed: mockOnClose,
        onUpdate: mockOnUpdate,
        onSet: mockOnSet,
        onChange: mockOnChange,
        onDataWritten: mockOnDataWritten,
    }));

    let terminalBuffer = '';

    const mockGetTerminalData = jest.fn(() => terminalBuffer);
    const mockClear = jest.fn(() => {
        terminalBuffer = '';
    });
    const mockGetLastLine = jest.fn(
        () => terminalBuffer.split('\r\n').pop() as string
    );
    const mockTerminalWrite = jest.fn(
        (data: string, callback: () => void | undefined) => {
            if (data !== '\r' && data !== '\n') {
                terminalBuffer += data;
            }
            callback();
        }
    );

    const mockTerminal = jest.fn<XTerminalShellParser, []>(() => ({
        getTerminalData: mockGetTerminalData,
        clear: mockClear,
        getLastLine: mockGetLastLine,
        write: mockTerminalWrite,
    }));

    return {
        getTerminalBuffer: () => terminalBuffer,
        setTerminalBuffer: (value: string) => {
            terminalBuffer = value;
        },
        mockIsOpen,
        mockModem,
        mockOnError,
        mockOnResponse: mockOnData,
        mockOnAnyCommandResponse,
        mockOnShellLogging,
        mockOnSuccess,
        mockOnUnknown,
        mockTerminal,
        mockWrite,
        mockClose,
        settings,
    };
};

const {
    setTerminalBuffer,
    mockIsOpen,
    mockModem,
    mockOnError,
    mockOnAnyCommandResponse,
    mockOnShellLogging,
    mockOnSuccess,
    mockOnUnknown,
    mockTerminal,
    mockWrite,
    mockClose,
    settings,
} = setupMocks();

describe('shell command parser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setTerminalBuffer(settings.shellPromptUart ?? 'uart:~$');
        mockIsOpen.mockReturnValue(
            new Promise<boolean>(resolve => {
                resolve(true);
            })
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onResponseCallback = (data: Uint8Array) => {};
    });

    test('Verify that shell init char is sent on open', async () => {
        await CreateShellParser(mockModem(), mockTerminal());

        expect(mockWrite).toBeCalledTimes(1);
        expect(mockWrite).toBeCalledWith(
            `${String.fromCharCode(12).toString()}${String.fromCharCode(
                21
            ).toString()}`
        );
    });

    test('Verify that no callback is called until we get a response', async () => {
        mockIsOpen.mockReturnValue(
            new Promise<boolean>(resolve => {
                resolve(false);
            })
        );

        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal()
        );

        (await shellParser).onShellLoggingEvent(mockOnShellLogging);
        shellParser.onUnknownCommand(mockOnUnknown);

        await shellParser.enqueueRequest('Test Command');

        expect(mockClose).toBeCalledTimes(0);
        expect(mockWrite).toBeCalledTimes(0);

        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);

        expect(mockOnSuccess).toBeCalledTimes(0);
        expect(mockOnError).toBeCalledTimes(0);
    });

    test('Verify that enqueued not sent if modem is closed', async () => {
        mockIsOpen.mockReturnValue(
            new Promise<boolean>(resolve => {
                resolve(false);
            })
        );

        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal()
        );
        await shellParser.enqueueRequest('Test Command');

        expect(mockWrite).toBeCalledTimes(0);
    });

    test('Verify one time onSuccess callback is called when we have a response in one stream', async () => {
        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal(),
            settings
        );

        shellParser.onShellLoggingEvent(mockOnShellLogging);
        shellParser.onUnknownCommand(mockOnUnknown);

        await shellParser.enqueueRequest('Test Command', {
            onSuccess: mockOnSuccess,
            onError: mockOnError,
        });

        expect(mockOnSuccess).toBeCalledTimes(0);

        onResponseCallback(
            Buffer.from('Test Command\r\nResponse Value\r\nuart:~$')
        );

        expect(mockOnSuccess).toBeCalledTimes(1);
        expect(mockOnSuccess).toBeCalledWith('Response Value', 'Test Command');

        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
        expect(mockOnError).toBeCalledTimes(0);
    });

    test('Verify one time onSuccess callback is called when we have a response in multiple streams', async () => {
        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal(),
            settings
        );

        shellParser.onShellLoggingEvent(mockOnShellLogging);
        shellParser.onUnknownCommand(mockOnUnknown);

        await shellParser.enqueueRequest('Test Command', {
            onSuccess: mockOnSuccess,
            onError: mockOnError,
        });

        expect(mockOnSuccess).toBeCalledTimes(0);

        onResponseCallback(Buffer.from('Test Command\r\nResponse Val'));

        expect(mockOnSuccess).toBeCalledTimes(0);

        onResponseCallback(Buffer.from('ue\r\nuart:~$'));

        expect(mockOnSuccess).toBeCalledTimes(1);
        expect(mockOnSuccess).toBeCalledWith('Response Value', 'Test Command');

        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
        expect(mockOnError).toBeCalledTimes(0);
    });

    test('Verify one time onFail callback is called when we have a response in one stream', async () => {
        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal(),
            settings
        );

        shellParser.onShellLoggingEvent(mockOnShellLogging);
        shellParser.onUnknownCommand(mockOnUnknown);

        await shellParser.enqueueRequest('Test Command', {
            onSuccess: mockOnSuccess,
            onError: mockOnError,
        });

        expect(mockOnError).toBeCalledTimes(0);

        onResponseCallback(
            Buffer.from('Test Command\r\nerror: Response Value\r\nuart:~$')
        );

        expect(mockOnError).toBeCalledTimes(1);
        expect(mockOnError).toBeCalledWith(
            'error: Response Value',
            'Test Command'
        );

        expect(mockOnSuccess).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify one time onFail callback is called when we have a response in multiple streams', async () => {
        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal(),
            settings
        );

        shellParser.onShellLoggingEvent(mockOnShellLogging);
        shellParser.onUnknownCommand(mockOnUnknown);

        await shellParser.enqueueRequest('Test Command', {
            onSuccess: mockOnSuccess,
            onError: mockOnError,
        });

        expect(mockOnError).toBeCalledTimes(0);

        onResponseCallback(Buffer.from('Test Command\r\nerror: Re'));

        onResponseCallback(Buffer.from('sponse Value\r\nuart'));

        expect(mockOnError).toBeCalledTimes(0);

        onResponseCallback(Buffer.from(':~$'));

        expect(mockOnError).toBeCalledTimes(1);
        expect(mockOnError).toBeCalledWith(
            'error: Response Value',
            'Test Command'
        );

        expect(mockOnSuccess).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify that only one command is send at a time until we get a response', async () => {
        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal(),
            settings
        );

        shellParser.onShellLoggingEvent(mockOnShellLogging);
        shellParser.onUnknownCommand(mockOnUnknown);

        await shellParser.enqueueRequest('Test Command 1', {
            onSuccess: mockOnSuccess,
            onError: mockOnError,
        });

        await shellParser.enqueueRequest('Test Command 2', {
            onSuccess: mockOnSuccess,
            onError: mockOnError,
        });

        expect(mockOnSuccess).toBeCalledTimes(0);

        onResponseCallback(
            Buffer.from('Test Command 1\r\nResponse Value 1\r\nuart:~$')
        );

        expect(mockOnSuccess).toBeCalledTimes(1);
        expect(mockOnSuccess).toBeCalledWith(
            'Response Value 1',
            'Test Command 1'
        );

        onResponseCallback(
            Buffer.from('Test Command 2\r\nResponse Value 2\r\nuart:~$')
        );

        expect(mockOnSuccess).toBeCalledTimes(2);
        expect(mockOnSuccess).toBeCalledWith(
            'Response Value 2',
            'Test Command 2'
        );

        expect(mockOnError).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify that onSuccess is called for the appropriate responses', async () => {
        const mockOnSuccess1 = jest.fn(() => '');
        const mockOnSuccess2 = jest.fn(() => '');

        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal(),
            settings
        );

        shellParser.onShellLoggingEvent(mockOnShellLogging);
        shellParser.onUnknownCommand(mockOnUnknown);

        await shellParser.enqueueRequest('Test Command 1', {
            onSuccess: mockOnSuccess1,
            onError: mockOnError,
        });

        await shellParser.enqueueRequest('Test Command 2', {
            onSuccess: mockOnSuccess2,
            onError: mockOnError,
        });

        expect(mockOnSuccess1).toBeCalledTimes(0);

        onResponseCallback(
            Buffer.from(
                'Test Command 1\r\nResponse Value 1\r\nuart:~$Test Command 2\r\nResponse Value 2\r\nuart:~$'
            )
        );

        expect(mockOnSuccess1).toBeCalledTimes(1);
        expect(mockOnSuccess1).toBeCalledWith(
            'Response Value 1',
            'Test Command 1'
        );

        expect(mockOnSuccess2).toBeCalledTimes(1);
        expect(mockOnSuccess2).toBeCalledWith(
            'Response Value 2',
            'Test Command 2'
        );

        expect(mockOnError).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify onError and onSuccess is called for the appropriate responses', async () => {
        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal(),
            settings
        );

        shellParser.onShellLoggingEvent(mockOnShellLogging);
        shellParser.onUnknownCommand(mockOnUnknown);

        await shellParser.enqueueRequest('Test Command 1', {
            onSuccess: mockOnSuccess,
            onError: mockOnError,
        });

        await shellParser.enqueueRequest('Test Command 2', {
            onSuccess: mockOnSuccess,
            onError: mockOnError,
        });

        expect(mockOnError).toBeCalledTimes(0);

        onResponseCallback(
            Buffer.from(
                'Test Command 1\r\nerror: Response Value 1\r\nuart:~$Test Command 2\r\nResponse Value 2\r\nuart:~$'
            )
        );

        expect(mockOnError).toBeCalledTimes(1);
        expect(mockOnError).toBeCalledWith(
            'error: Response Value 1',
            'Test Command 1'
        );

        expect(mockOnSuccess).toBeCalledTimes(1);
        expect(mockOnSuccess).toBeCalledWith(
            'Response Value 2',
            'Test Command 2'
        );

        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify permanent onSuccess callback is called when we have a response in one stream', async () => {
        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal(),
            settings
        );

        shellParser.registerCommandCallback(
            'Test Command',
            mockOnSuccess,
            mockOnError
        );

        shellParser.onShellLoggingEvent(mockOnShellLogging);
        shellParser.onUnknownCommand(mockOnUnknown);

        await shellParser.enqueueRequest('Test Command');

        expect(mockOnSuccess).toBeCalledTimes(0);

        onResponseCallback(
            Buffer.from('Test Command\r\nResponse Value\r\nuart:~$')
        );

        expect(mockOnSuccess).toBeCalledTimes(1);
        expect(mockOnSuccess).toBeCalledWith('Response Value', 'Test Command');

        await shellParser.enqueueRequest('Test Command');

        onResponseCallback(
            Buffer.from('Test Command\r\nResponse Value\r\nuart:~$')
        );

        expect(mockOnSuccess).toBeCalledTimes(2);
        expect(mockOnSuccess).toBeCalledWith('Response Value', 'Test Command');

        expect(mockOnError).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify permanent onSuccess callback is called when we have a response in multiple streams', async () => {
        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal(),
            settings
        );

        shellParser.onShellLoggingEvent(mockOnShellLogging);
        shellParser.onUnknownCommand(mockOnUnknown);

        shellParser.registerCommandCallback(
            'Test Command',
            mockOnSuccess,
            mockOnError
        );
        await shellParser.enqueueRequest('Test Command');

        expect(mockOnSuccess).toBeCalledTimes(0);

        onResponseCallback(Buffer.from('Test Com'));

        onResponseCallback(Buffer.from('mand\r\nResponse Val'));

        expect(mockOnSuccess).toBeCalledTimes(0);

        onResponseCallback(Buffer.from('ue\r\nuart:~$'));

        expect(mockOnSuccess).toBeCalledTimes(1);
        expect(mockOnSuccess).toBeCalledWith('Response Value', 'Test Command');

        expect(mockOnError).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify onAnyCommand is called with success when we have a response', async () => {
        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal(),
            settings
        );

        shellParser.onAnyCommandResponse(mockOnAnyCommandResponse);

        await shellParser.enqueueRequest('Test Command');

        onResponseCallback(
            Buffer.from('Test Command\r\nResponse Value\r\nuart:~$')
        );

        expect(mockOnAnyCommandResponse).toBeCalledTimes(1);
        expect(mockOnAnyCommandResponse).toBeCalledWith({
            response: 'Response Value',
            command: 'Test Command',
            error: false,
        });
    });

    test('Verify onAnyCommand is called with error when we have a response', async () => {
        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal(),
            settings
        );

        shellParser.onAnyCommandResponse(mockOnAnyCommandResponse);

        await shellParser.enqueueRequest('Test Command');

        onResponseCallback(
            Buffer.from('Test Command\r\nResponse Value\r\nuart:~$')
        );

        expect(mockOnAnyCommandResponse).toBeCalledTimes(1);
        expect(mockOnAnyCommandResponse).toBeCalledWith({
            response: 'Response Value',
            command: 'Test Command',
            error: false,
        });
    });

    test('Verify permanent onFail callback is called when we have a response in one stream', async () => {
        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal(),
            settings
        );

        shellParser.onShellLoggingEvent(mockOnShellLogging);
        shellParser.onUnknownCommand(mockOnUnknown);

        shellParser.registerCommandCallback(
            'Test Command',
            mockOnSuccess,
            mockOnError
        );
        await shellParser.enqueueRequest('Test Command');

        expect(mockOnError).toBeCalledTimes(0);

        onResponseCallback(
            Buffer.from('Test Command\r\nerror: Response Value\r\nuart:~$')
        );

        expect(mockOnError).toBeCalledTimes(1);
        expect(mockOnError).toBeCalledWith(
            'error: Response Value',
            'Test Command'
        );

        expect(mockOnSuccess).toBeCalledTimes(0);

        onResponseCallback(
            Buffer.from('Test Command\r\nerror: Response Value\r\nuart:~$')
        );

        expect(mockOnError).toBeCalledTimes(2);
        expect(mockOnError).toBeCalledWith(
            'error: Response Value',
            'Test Command'
        );

        expect(mockOnSuccess).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify one time onFail callback is called when we have a response in multiple streams', async () => {
        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal(),
            settings
        );

        shellParser.onShellLoggingEvent(mockOnShellLogging);
        shellParser.onUnknownCommand(mockOnUnknown);

        shellParser.registerCommandCallback(
            'Test Command',
            mockOnSuccess,
            mockOnError
        );
        await shellParser.enqueueRequest('Test Command');

        expect(mockOnError).toBeCalledTimes(0);

        onResponseCallback(Buffer.from('Test Command\r\nerror: Re'));

        onResponseCallback(Buffer.from('sponse Value\r\nuart'));

        expect(mockOnError).toBeCalledTimes(0);

        onResponseCallback(Buffer.from(':~$'));

        expect(mockOnError).toBeCalledTimes(1);
        expect(mockOnError).toBeCalledWith(
            'error: Response Value',
            'Test Command'
        );

        expect(mockOnSuccess).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify permanent and one time onSuccess both callback is called when we have a response', async () => {
        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal(),
            settings
        );

        shellParser.onShellLoggingEvent(mockOnShellLogging);
        shellParser.onUnknownCommand(mockOnUnknown);

        shellParser.registerCommandCallback(
            'Test Command',
            mockOnSuccess,
            mockOnError
        );

        await shellParser.enqueueRequest('Test Command', {
            onSuccess: mockOnSuccess,
            onError: mockOnError,
        });

        expect(mockOnSuccess).toBeCalledTimes(0);

        onResponseCallback(
            Buffer.from('Test Command\r\nResponse Value\r\nuart:~$')
        );

        expect(mockOnSuccess).toBeCalledTimes(2);
        expect(mockOnSuccess).toBeCalledWith('Response Value', 'Test Command');

        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
        expect(mockOnError).toBeCalledTimes(0);
    });

    test('Verify permanent and one time onFail callback is called when we have a response', async () => {
        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal(),
            settings
        );

        shellParser.onShellLoggingEvent(mockOnShellLogging);
        shellParser.onUnknownCommand(mockOnUnknown);

        shellParser.registerCommandCallback(
            'Test Command',
            mockOnSuccess,
            mockOnError
        );
        await shellParser.enqueueRequest('Test Command', {
            onSuccess: mockOnSuccess,
            onError: mockOnError,
        });

        expect(mockOnError).toBeCalledTimes(0);

        onResponseCallback(
            Buffer.from('Test Command\r\nerror: Response Value\r\nuart:~$')
        );

        expect(mockOnError).toBeCalledTimes(2);
        expect(mockOnError).toBeCalledWith(
            'error: Response Value',
            'Test Command'
        );

        expect(mockOnSuccess).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify onShellLogging callback is called when we have a response logging shell in one stream', async () => {
        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal(),
            settings
        );

        shellParser.onShellLoggingEvent(mockOnShellLogging);
        shellParser.onUnknownCommand(mockOnUnknown);

        onResponseCallback(
            Buffer.from(
                '[00:01:46.862,640] <inf> main: v=3.595881,i=0.176776\r\n'
            )
        );

        expect(mockOnShellLogging).toBeCalledTimes(1);
        expect(mockOnShellLogging).toBeCalledWith(
            '[00:01:46.862,640] <inf> main: v=3.595881,i=0.176776'
        );

        expect(mockOnError).toBeCalledTimes(0);
        expect(mockOnSuccess).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify onShellLogging callback is called when we have a response logging shell in multiple streams', async () => {
        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal(),
            settings
        );

        shellParser.onShellLoggingEvent(mockOnShellLogging);
        shellParser.onUnknownCommand(mockOnUnknown);

        onResponseCallback(
            Buffer.from('[00:00:01.114,532] <inf> main: v=3.595881,i=0')
        );

        expect(mockOnShellLogging).toBeCalledTimes(0);

        onResponseCallback(Buffer.from('.176776\r\n'));

        expect(mockOnShellLogging).toBeCalledTimes(1);
        expect(mockOnShellLogging).toBeCalledWith(
            '[00:00:01.114,532] <inf> main: v=3.595881,i=0.176776'
        );

        expect(mockOnError).toBeCalledTimes(0);
        expect(mockOnSuccess).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify onShellLogging callback is called large timestamp', async () => {
        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal(),
            settings
        );

        shellParser.onShellLoggingEvent(mockOnShellLogging);
        shellParser.onUnknownCommand(mockOnUnknown);

        onResponseCallback(
            Buffer.from(
                '[1000:00:01.114,532] <inf> main: v=3.595881,i=0.176776\r\n'
            )
        );

        expect(mockOnShellLogging).toBeCalledTimes(1);
        expect(mockOnShellLogging).toBeCalledWith(
            '[1000:00:01.114,532] <inf> main: v=3.595881,i=0.176776'
        );

        expect(mockOnError).toBeCalledTimes(0);
        expect(mockOnSuccess).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify onUnknown callback is called when we have a response that is not logging nor is it a registered command one stream', async () => {
        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal(),
            settings
        );

        shellParser.onShellLoggingEvent(mockOnShellLogging);
        shellParser.onUnknownCommand(mockOnUnknown);

        onResponseCallback(
            Buffer.from('Test Command\r\nResponse Value\r\nuart:~$')
        );

        expect(mockOnUnknown).toBeCalledTimes(1);
        expect(mockOnUnknown).toBeCalledWith('Test Command\r\nResponse Value');

        expect(mockOnError).toBeCalledTimes(0);
        expect(mockOnSuccess).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
    });

    test('Verify onUnknown callback is called when we have a response that is not logging nor is it a registered command multiple streams', async () => {
        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal(),
            settings
        );
        expect(mockOnUnknown).toBeCalledTimes(0);

        shellParser.onShellLoggingEvent(mockOnShellLogging);
        shellParser.onUnknownCommand(mockOnUnknown);

        onResponseCallback(Buffer.from('Test Command\r\nRespons'));

        expect(mockOnUnknown).toBeCalledTimes(0);

        onResponseCallback(Buffer.from('e Value\r\nuart:~$'));

        expect(mockOnUnknown).toBeCalledTimes(1);
        expect(mockOnUnknown).toBeCalledWith('Test Command\r\nResponse Value');

        expect(mockOnError).toBeCalledTimes(0);
        expect(mockOnSuccess).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
    });

    test('Verify permanent callback unregister removes the callback', async () => {
        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal(),
            settings
        );

        shellParser.onShellLoggingEvent(mockOnShellLogging);
        shellParser.onUnknownCommand(mockOnUnknown);

        const unregister = shellParser.registerCommandCallback(
            'Test Command',
            mockOnSuccess,
            mockOnError
        );

        await shellParser.enqueueRequest('Test Command');

        onResponseCallback(
            Buffer.from('Test Command\r\nResponse Value\r\nuart:~$')
        );

        expect(mockOnSuccess).toBeCalledTimes(1);
        expect(mockOnSuccess).toBeCalledWith('Response Value', 'Test Command');

        unregister();

        await shellParser.enqueueRequest('Test Command');

        onResponseCallback(
            Buffer.from('Test Command\r\nResponse Value\r\nuart:~$')
        );

        expect(mockOnSuccess).toBeCalledTimes(1);
        expect(mockOnUnknown).toBeCalledTimes(0);
        expect(mockOnError).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
    });

    test('Verify permanent callback unregister removes the right callback', async () => {
        const mockOnSuccess1 = jest.fn(() => '');
        const mockOnSuccess2 = jest.fn(() => '');
        const mockOnSuccess3 = jest.fn(() => '');

        const shellParser = await CreateShellParser(
            mockModem(),
            mockTerminal(),
            settings
        );

        shellParser.onShellLoggingEvent(mockOnShellLogging);
        shellParser.onUnknownCommand(mockOnUnknown);

        shellParser.registerCommandCallback(
            'Test Command',
            mockOnSuccess1,
            mockOnError
        );

        const unregister2 = shellParser.registerCommandCallback(
            'Test Command',
            mockOnSuccess2,
            mockOnError
        );

        const unregister3 = shellParser.registerCommandCallback(
            'Test Command',
            mockOnSuccess3,
            mockOnError
        );

        await shellParser.enqueueRequest('Test Command');

        onResponseCallback(
            Buffer.from('Test Command\r\nResponse Value\r\nuart:~$')
        );

        expect(mockOnSuccess1).toBeCalledTimes(1);
        expect(mockOnSuccess1).toBeCalledWith('Response Value', 'Test Command');

        expect(mockOnSuccess2).toBeCalledTimes(1);
        expect(mockOnSuccess2).toBeCalledWith('Response Value', 'Test Command');

        expect(mockOnSuccess3).toBeCalledTimes(1);
        expect(mockOnSuccess3).toBeCalledWith('Response Value', 'Test Command');

        unregister2();

        await shellParser.enqueueRequest('Test Command');

        onResponseCallback(
            Buffer.from('Test Command\r\nResponse Value\r\nuart:~$')
        );

        expect(mockOnSuccess1).toBeCalledTimes(2);
        expect(mockOnSuccess1).toBeCalledWith('Response Value', 'Test Command');

        expect(mockOnSuccess2).toBeCalledTimes(1);

        expect(mockOnSuccess3).toBeCalledTimes(2);
        expect(mockOnSuccess3).toBeCalledWith('Response Value', 'Test Command');

        unregister3();

        await shellParser.enqueueRequest('Test Command');

        onResponseCallback(
            Buffer.from('Test Command\r\nResponse Value\r\nuart:~$')
        );

        expect(mockOnSuccess1).toBeCalledTimes(3);
        expect(mockOnSuccess1).toBeCalledWith('Response Value', 'Test Command');
        expect(mockOnSuccess2).toBeCalledTimes(1);
        expect(mockOnSuccess3).toBeCalledTimes(2);

        expect(mockOnUnknown).toBeCalledTimes(0);
        expect(mockOnError).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
    });
});

export {};
