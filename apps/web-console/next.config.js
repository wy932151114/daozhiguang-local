/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['echarts', 'echarts-for-react'],
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // 开发模式下使用 rewrite 代理到后端
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:4000/api/:path*',
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
