/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/openenv/reset",
        destination: "/api/openenv/reset",
      },
      {
        source: "/openenv/validate",
        destination: "/api/openenv/validate",
      },
    ];
  },
};

module.exports = nextConfig;
