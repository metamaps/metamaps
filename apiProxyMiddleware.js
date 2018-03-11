/*
This file takes appropriate requests from our UI client
and pipes them through to the API, proxying the response
back to the client. To do this, it needs to pass
the _Metamaps_session cookie in particular,
in order to make authorized requests
*/

const request = require('request')
const { API_PROTOCOL, API_HOST } = process.env

const API_URL = `${API_PROTOCOL}://${API_HOST}`

function apiProxyMiddleware (req, res, next) {
    // TODO: tidy this up!
    if (!(req.xhr || req.headers['content-type'] === 'application/json' || req.originalUrl.indexOf('.json') > -1 || req.method !== 'GET')) {
        return next()
    }
    const method = req.method.toLowerCase()
    req.pipe(
        request[method](API_URL + req.originalUrl, {
            headers: {
                ...req.headers,
                cookie: `_Metamaps_session=${req.cookies._Metamaps_session}`,
                host: API_HOST
            },
            followRedirect: false
        })
    )
    .on('error', (err) => console.log(err))
    .pipe(res)
}

module.exports = apiProxyMiddleware