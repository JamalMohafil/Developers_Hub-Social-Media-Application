/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "**", protocol: "https" }],
  },
};

export default nextConfig;
