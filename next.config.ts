import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    reactCompiler: true,
    typedRoutes: true,
    experimental: {
        optimizeCss: true,
        optimizePackageImports: ['lucide-react', '@radix-ui/react-separator'],
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
}

export default nextConfig
