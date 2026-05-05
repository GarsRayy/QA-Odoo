/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.watchOptions = {
      ignored: ['**/node_modules/**', '**/test-results/**', '**/tests/**', 'C:/**'],
    };
    return config;
  },
};

export default nextConfig;
