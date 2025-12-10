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
        ],
      },
    ];
  },

};

export default nextConfig;
