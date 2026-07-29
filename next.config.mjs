/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: "standalone",
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', '@base-ui/react', 'sonner'],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/uploads/:path*',
          destination: '/api/serve-uploads/:path*',
        },
      ],
    }
  }
}

export default nextConfig
