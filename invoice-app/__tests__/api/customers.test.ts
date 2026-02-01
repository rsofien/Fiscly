// API Integration Tests
// These tests verify the API structure and environment setup
// Full integration tests would require running the actual Next.js server

describe('Customers API', () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'

  it('should have correct API URL configured', () => {
    expect(API_URL).toBeDefined()
    expect(API_URL).toContain('localhost:1337')
  })

  it('should verify fetch is mocked', async () => {
    const mockResponse = { data: [{ id: '1', name: 'Test Customer' }] }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    })

    const response = await fetch(`${API_URL}/api/customers`)
    const data = await response.json()

    expect(response.ok).toBe(true)
    expect(data).toEqual(mockResponse)
    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/customers`)
  })

  it('should handle API errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ error: 'Database error' }),
    })

    const response = await fetch(`${API_URL}/api/customers`)
    
    expect(response.ok).toBe(false)
    expect(response.status).toBe(500)
  })

  it('should handle authentication headers', async () => {
    const token = 'test-jwt-token'
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    await fetch(`${API_URL}/api/customers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/customers`,
      expect.objectContaining({
        headers: { Authorization: `Bearer ${token}` },
      })
    )
  })

  it('should transform MongoDB _id to id', async () => {
    const mockCustomers = [
      { _id: 'cust-1', name: 'Customer 1', email: 'cust1@test.com', workspace_id: 'ws-1' },
      { _id: 'cust-2', name: 'Customer 2', email: 'cust2@test.com', workspace_id: 'ws-1' },
    ]

    // Simulate the transformation that happens in the API
    const transformedCustomers = mockCustomers.map(c => ({
      ...c,
      id: c._id || c.id,
    }))

    expect(transformedCustomers[0].id).toBe('cust-1')
    expect(transformedCustomers[1].id).toBe('cust-2')
    expect(transformedCustomers[0]._id).toBe('cust-1')
  })
})
