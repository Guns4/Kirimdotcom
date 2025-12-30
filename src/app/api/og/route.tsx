import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get query params
    const resi = searchParams.get('resi') || 'N/A';
    const courier = searchParams.get('courier') || 'Unknown';
    const status = searchParams.get('status') || 'Dalam Pengiriman';

    // Determine status color and icon
    const isDelivered =
      status.toLowerCase().includes('delivered') ||
      status.toLowerCase().includes('terkirim');

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
          }}
        >
          {/* Logo/Icon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '48px' }}>📦</span>
            </div>
            <h1
              style={{
                fontSize: '64px',
                fontWeight: 'bold',
                color: 'white',
                margin: 0,
              }}
            >
              CekKirim
            </h1>
          </div>

          {/* Status Badge */}
          <div
            style={{
              background: isDelivered ? '#10b981' : '#eab308',
              borderRadius: '50px',
              padding: '20px 40px',
              marginBottom: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '40px' }}>
              {isDelivered ? '✅' : '🚚'}
            </span>
            <span
              style={{
                fontSize: '40px',
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              {isDelivered ? 'TERKIRIM' : 'DALAM PENGIRIMAN'}
            </span>
          </div>

          {/* Tracking Info */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '24px',
              padding: '40px 60px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              minWidth: '600px',
            }}
          >
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <span
                style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.7)' }}
              >
                Nomor Resi
              </span>
              <span
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: 'white',
                  fontFamily: 'monospace',
                }}
              >
                {resi}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '40px' }}>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <span
                  style={{
                    fontSize: '20px',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  Kurir
                </span>
                <span
                  style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  {courier.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: '40px',
              fontSize: '24px',
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            Lacak paket Anda di cekkirim.com
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG Image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
