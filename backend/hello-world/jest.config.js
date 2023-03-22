require('dotenv/config')

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    setupFiles: [
        'dotenv/config'
    ],
    testTimeout: 300000,
    preset: 'ts-jest',
    testEnvironment: 'node',
};
