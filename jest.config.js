module.exports = {
    testEnvironment: 'jsdom',
    moduleNameMapper: {
      '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
      '\\.(gif|ttf|eot|svg)$': '<rootDir>/__mocks__/fileMock.js',
    },
    setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
    testRegex: '(/test/.*|(\\.|/)(test|spec))\\.jsx?$'
  };