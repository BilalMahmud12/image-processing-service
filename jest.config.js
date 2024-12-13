/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testTimeout: 20000,
  preset: 'ts-jest',
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  }
};