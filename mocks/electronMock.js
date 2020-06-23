// Allows jest to test files that import the electron package.

module.exports = {
    require: jest.fn(),
    match: jest.fn(),
    app: jest.fn(),
    remote: jest.fn(),
    dialog: jest.fn(),
    ipcRenderer: {
        once: jest.fn(),
        send: jest.fn(),
    },
};
