// Allows jest to test files that import the electron package.

module.exports = {
    require: jest.fn(),
    match: jest.fn(),
    app: jest.fn(),
    dialog: jest.fn(),
    remote: {
        require: jest.fn(),
    },
    ipcRenderer: {
        once: jest.fn(),
        send: jest.fn(),
    },
};
