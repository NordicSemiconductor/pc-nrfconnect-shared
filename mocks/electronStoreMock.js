// Allows jest to test files that import the electron-store package.

export default jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
}));
