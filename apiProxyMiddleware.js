import request from 'request'

function apiProxyMiddleware (req, res, next) {
    if (true) { // is application/json
        return next()
    }
    console.log(req.get('Content-Type'))
    const method = req.method.toLowerCase()
    req.pipe(
        request[method](url, {
            headers: {
                ...req.headers,
                host: process.env.API
            },
            followRedirect: false
        })
    )
    .pipe(res)
}

export default apiProxyMiddleware