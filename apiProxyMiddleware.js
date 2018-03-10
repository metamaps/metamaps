const request = require('request')

function apiProxyMiddleware (req, res, next) {
    // TODO: tidy this up!
    if (!(req.xhr || req.headers['content-type'] === 'application/json' || req.originalUrl.indexOf('.json') > -1 || req.method !== 'GET')) {
        return next()
    }
    const method = req.method.toLowerCase()
    req.pipe(
        request[method](process.env.API + req.originalUrl, {
            headers: {
                ...req.headers,
                cookie: `_Metamaps_session=${req.cookies._Metamaps_session}`,
                host: 'localhost:3001'
            },
            followRedirect: false
        })
    )
    .on('error', (err) => console.log(err))
    .pipe(res)
}

module.exports = apiProxyMiddleware