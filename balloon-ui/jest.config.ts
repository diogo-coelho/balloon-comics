import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const customJestConfig: Config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
  roots: ['<rootDir>/tests'],
  testMatch: ['<rootDir>/tests/**/*.spec.{ts,tsx}'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'hooks/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    'store/**/*.{ts,tsx}',
    'providers/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'shared/**/*.{ts,tsx}',
    'auth/**/*.{ts,tsx}',
    '!**/*.d.ts',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageThreshold: {
    global: {
      statements: 80,
      lines: 80,
    },
  },
};

export default createJestConfig(customJestConfig);
