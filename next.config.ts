import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // 클릭재킹 방지
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()', // 불필요한 기능 차단
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // MIME Sniffing 방지
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // 민감한 URL 정보 보호
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self';", // XSS 방지 (개발 편의상 unsafe-inline 허용)
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
