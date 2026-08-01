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
  },
  async redirects() {
    return [
      { source: '/contact', destination: '/lien-he', permanent: true },
      { source: '/faq', destination: '/hoi-dap', permanent: true },
      { source: '/blog', destination: '/tin-tuc', permanent: true },
      { source: '/blog/tin-tuc/:slug*', destination: '/tin-tuc/:slug*', permanent: true },
      { source: '/product/:slug*', destination: '/san-pham/:slug*', permanent: true },
      { source: '/products', destination: '/san-pham', permanent: true },
      { source: '/products/:slug*', destination: '/san-pham/:slug*', permanent: true },
      { source: '/category/:slug*', destination: '/danh-muc/:slug*', permanent: true },
      { source: '/post/:slug*', destination: '/tin-tuc/:slug*', permanent: true },
      { source: '/posts/:slug*', destination: '/tin-tuc/:slug*', permanent: true },
      { source: '/danh-muc', destination: '/san-pham', permanent: true },
    ]
  }
}

export default nextConfig
