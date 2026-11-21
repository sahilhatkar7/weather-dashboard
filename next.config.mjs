
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: process.env.GITHUB_ACTIONS ? "/weather-dashboard" : "",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
