// Ensure tests run with test environment without cross-env (Windows-friendly)
process.env.NODE_ENV = process.env.NODE_ENV || 'test'
require('dotenv-flow').config()
