import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const contentType = 'image/png'
export const size = { width: 32, height: 32 }
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#3b82f6',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '6px',
        }}
      >
        F
      </div>
    ),
    {
      ...size,
    }
  )
}
