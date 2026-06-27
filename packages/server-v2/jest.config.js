"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': ['ts-jest', {
                tsconfig: 'tsconfig.json',
                diagnostics: false,
            }],
    },
    collectCoverageFrom: ['src/**/*.(t|j)s'],
    coverageDirectory: './coverage',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@common/(.*)$': '<rootDir>/src/common/$1',
        '^@modules/(.*)$': '<rootDir>/src/modules/$1',
        '^@database/(.*)$': '<rootDir>/src/database/$1',
        '^@events/(.*)$': '<rootDir>/src/events/$1',
        '^@dzs/shared$': '<rootDir>/../shared/src/index.ts',
        '^@dzs/protocols$': '<rootDir>/../dzs-protocols/src/index.ts',
        '^@dzs/utils$': '<rootDir>/../utils/src/index.ts',
    },
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
};
exports.default = config;
