const { rateLimit, ipKeyGenerator } = require('express-rate-limit')

function getClientIpFromForwardedHeader(forwardedHeader) {
  if (!forwardedHeader || typeof forwardedHeader !== 'string') {
    return null
  }

  const firstEntry = forwardedHeader.split(',')[0]
  const match = firstEntry.match(/for=("?)(\[[^\]]+\]|[^;,"]+)\1/i)

  if (!match) {
    return null
  }

  return match[2].replace(/^\[/, '').replace(/\]$/, '')
}

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const forwardedHeaderIp = getClientIpFromForwardedHeader(req.headers.forwarded)

    if (forwardedHeaderIp) {
      return forwardedHeaderIp
    }

    if (req.ip) {
      return ipKeyGenerator(req.ip)
    }

    if (req.headers['x-forwarded-for']) {
      return String(req.headers['x-forwarded-for']).split(',')[0].trim()
    }

    if (req.socket && req.socket.remoteAddress) {
      return ipKeyGenerator(req.socket.remoteAddress)
    }

    return 'unknown'
  },
  message: {
    status: 'error',
    message: 'Too many requests, please try again later',
  },
})

module.exports = limiter