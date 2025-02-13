module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'clipboard-write=*, clipboard-read=*',
          },
        ],
      },
    ]
  },
} 