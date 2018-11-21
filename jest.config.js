module.exports = {
    "roots": [
      "<rootDir>/e2e"
    ],
    "testRunner": "jest-circus/runner",
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
    "moduleFileExtensions": [
      "ts",
      "tsx",
      "js",
      "jsx",
      "json",
      "node"
    ],
    "verbose": true
}
  