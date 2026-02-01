// Test utilities and helpers
import { render } from '@testing-library/react'
import { ReactElement } from 'react'

// Custom render function with providers if needed
export function renderWithProviders(ui: ReactElement) {
  return render(ui)
}

// Mock session data helpers
export const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    token: 'mock-jwt-token',
  },
  expires: '2024-12-31T00:00:00.000Z',
}

export const mockAuthenticatedSession = {
  data: mockSession,
  status: 'authenticated',
}

export const mockUnauthenticatedSession = {
  data: null,
  status: 'unauthenticated',
}

export const mockLoadingSession = {
  data: null,
  status: 'loading',
}
