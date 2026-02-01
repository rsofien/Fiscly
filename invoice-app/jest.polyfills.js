// Polyfills for Jest test environment
// This file runs before the test framework is installed

// Import fetch and Request polyfills
require('whatwg-fetch')

// Ensure Request, Response, and other Web API globals are available
if (typeof Request === 'undefined') {
  global.Request = require('whatwg-fetch').Request
}
if (typeof Response === 'undefined') {
  global.Response = require('whatwg-fetch').Response
}
if (typeof Headers === 'undefined') {
  global.Headers = require('whatwg-fetch').Headers
}
