import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "React Foundation store preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function StoreOGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f4fbfd",
        }}
      >
        {/* React Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 30,
          }}
        >
          <svg
            width="100"
            height="100"
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
            fontSize: 64,
            fontWeight: 700,
            color: "#18202b",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          React Foundation
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "#566173",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.3,
            marginBottom: 50,
          }}
        >
          A preview of planned React Foundation merchandise
        </div>

        {/* Tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 12,
            paddingBottom: 12,
            backgroundColor: "#ffffff",
            borderRadius: 999,
            fontSize: 18,
            color: "#344054",
            border: "1px solid #d8e1e8",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: "#61DAFB",
            }}
          />
          <span>Store preview · Checkout unavailable</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
