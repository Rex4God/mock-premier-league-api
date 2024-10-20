const config = require("./jest.config");

config.testPathIgnorePatterns = [
    ...config.testPathIgnorePatterns,
    "integration.*",
];

console.log("RUNNING UNIT TESTS");

module.exports = config;
