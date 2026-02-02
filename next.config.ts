import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    reactCompiler: true,
    typedRoutes: true,
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
                            "style-src 'self' 'unsafe-inline'",
                            "frame-src 'self' https://challenges.cloudflare.com",
                            "connect-src 'self' https://challenges.cloudflare.com https://*.supabase.co wss://*.supabase.co",
                            "img-src 'self' data: blob:",
                            "font-src 'self' data:",
                        ].join('; '),
                    },
                ],
            },
        ]
    },
}

export default nextConfig
