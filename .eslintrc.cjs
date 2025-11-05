module.exports = {
  env: {
    node: true, // Enable Node.js global variables and Node.js scoping.
    es2021: true // Enable ES2021 global variables.
  },
  extends: ['standard','prettier'], // Extend the Standard JavaScript style.
  parserOptions: {
    ecmaVersion: 12, // Allow parsing of ECMAScript 2021 features.
    sourceType: 'script' // Indicate CommonJS module usage.
  },
  ignorePatterns: ["test/*"]
}
