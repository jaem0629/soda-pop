import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    reactCompiler: true,
    typedRoutes: true,
    experimental: {
        optimizeCss: true,
    },
}

export default nextConfig
