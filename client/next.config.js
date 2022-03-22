module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://14.51.232.120:3000/api/:path*',
      },
    ]
  },
}
