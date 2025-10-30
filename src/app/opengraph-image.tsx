import { ImageResponse } from 'next/og';
import { ecosystemLibraries } from '@/lib/maintainer-tiers';

export const runtime = 'edge';
export const alt = 'React Foundation - Supporting the React Ecosystem';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          backgroundImage: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(99, 102, 241, 0.15) 50%, rgba(168, 85, 247, 0.15) 100%)',
        }}
      >
        {/* React Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="-10.5 -9.45 21 18.9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="0" cy="0" r="2" fill="#61DAFB" />
            <g stroke="#61DAFB" strokeWidth="1" fill="none">
              <ellipse rx="10" ry="4.5" />
              <ellipse rx="10" ry="4.5" transform="rotate(60)" />
              <ellipse rx="10" ry="4.5" transform="rotate(120)" />
            </g>
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: 'white',
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          React Foundation
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          Supporting the React ecosystem through community funding
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: 60,
            marginTop: 60,
            fontSize: 24,
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#34D399',
              }}
            />
            <span>{ecosystemLibraries.length} Libraries Supported</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#38BDF8',
              }}
            />
            <span>100% Transparent</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#F472B6',
              }}
            />
            <span>Community Driven</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
