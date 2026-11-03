/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/docs/theming-guide', '<rootDir>/scripts'],
  testMatch: ['**/*.test.{ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      { jsc: { parser: { syntax: 'typescript', tsx: true }, transform: { react: { runtime: 'automatic' } } } },
    ],
  },
  moduleNameMapper: {
    '^storybook/test$': '<rootDir>/test/storybook-test.ts',
    '^design-system-test$': '<rootDir>/src/index.ts',
    'samples/minimal\\.ts\\?raw$': '<rootDir>/test/rawMinimal.cjs',
    '\\.(css|scss)$': 'identity-obj-proxy',
    '\\.(svg|png|jpg|avif)$': '<rootDir>/test/fileMock.cjs',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.stories.{ts,tsx}', '!src/**/index.ts'],
  coverageThreshold: { global: { branches: 80, functions: 80, lines: 80, statements: 80 } },
  clearMocks: true,
};
