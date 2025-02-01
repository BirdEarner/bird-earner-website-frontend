/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'cloud.appwrite.io'
      }
    ]
  },
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
  }
}

module.exports = nextConfig 