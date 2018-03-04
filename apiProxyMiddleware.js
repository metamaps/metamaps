const request = require('request')

function apiProxyMiddleware (req, res, next) {
    if (!req.xhr) {
        return next()
    }
    const method = req.method.toLowerCase()
    req.pipe(
        request[method](process.env.API + req.originalUrl, {
            headers: {
                ...req.headers,
                host: process.env.API
            },
            followRedirect: false
        })
    )
    .pipe(res)
}

module.exports = apiProxyMiddleware