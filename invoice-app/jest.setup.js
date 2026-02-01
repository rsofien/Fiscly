import '@testing-library/jest-dom'

// Polyfill Web API globals for Node.js environment
import 'whatwg-fetch'

// Ensure Request/Response are available globally
global.Request = global.Request || require('whatwg-fetch').Request
global.Response = global.Response || require('whatwg-fetch').Response
global.Headers = global.Headers || require('whatwg-fetch').Headers

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
      pathname: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock next-auth - mock the entire module
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}))

// Mock next-auth/jwt to avoid ES module issues
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
  decode: jest.fn(),
}))

// Mock openid-client ES modules
jest.mock('openid-client', () => ({
  Issuer: {
    discover: jest.fn(),
  },
  generators: {
    codeVerifier: jest.fn(() => 'mock-code-verifier'),
    codeChallenge: jest.fn(() => 'mock-code-challenge'),
  },
}))

// Mock fetch globally
global.fetch = jest.fn()

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
})
