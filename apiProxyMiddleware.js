const request = require('request')

function apiProxyMiddleware (req, res, next) {
    if (!(req.xhr || req.originalUrl.indexOf('.json') > -1 || req.method !== 'GET')) {
        return next()
    }
    console.log('xhr request', req.originalUrl)
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
    .on('error', console.log)
    .pipe(res)
}

module.exports = apiProxyMiddleware