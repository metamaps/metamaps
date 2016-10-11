[Skip ahead to the endpoints.](#endpoints)

There are three ways to log in: cookie-based authentication, token-based authentication, or OAuth 2.

### 1. Cookie-based authentication

One way to access the API is through your browser. Log into metamaps.cc normally, then browse manually to https://metamaps.cc/api/v2/user/current. You should see a JSON description of your own user object in the database. You can browse any GET endpoint by simply going to that URL and appending query parameters in the URI.

To run a POST or DELETE request, you can use the Fetch API. See the example in the next section.

### 2. Token-based authentication

If you are logged into the API via another means, you can create a token. Once you have this token, you can append it to a request. For example, opening a private window in your browser and browsing to `https://metamaps.cc/api/v2/user/current?token=...token here...` would show you your current user, even without logging in by another means.

To get a list of your current tokens, you can log in using cookie-based authentication and run the following fetch request in your browser console (assuming the current tab is on some page within the `metamaps.cc` website.

```
fetch('/api/v2/tokens', {
  method: 'GET',
  credentials: 'same-origin' // needed to use the cookie-based auth
}).then(response => {
  return response.json()
}).then(console.log).catch(console.error)
```

If this is your first time accessing the API, this list wil be empty. You can create a token using a similar method:

```
fetch('/api/v2/tokens', {
  method: 'POST',
  credentials: 'same-origin'
}).then(response => {
  return response.json()
}).then(console.log).catch(console.error)
```

`payload.data.token` will contain a string which you can use to append to requests to access the API from anywhere.

### 3. OAuth 2 Authentication

We use a flow for Oauth 2 authentication called Authorization Code. It basically consists of an exchange of an `authorization` token for an `access token`. For more detailed info, check out the [RFC spec here](http://tools.ietf.org/html/rfc6749#section-4.1)

The first step is to register your client app.

#### Registering the client

Set up a new client in `/oauth/applications/new`. For testing purposes, you should fill in the redirect URI field with `urn:ietf:wg:oauth:2.0:oob`. This will tell it to display the authorization code instead of redirecting to a client application (that you don't have now).

#### Requesting authorization

To request the authorization token, you should visit the `/oauth/authorize` endpoint. You can do that either by clicking in the link to the authorization page in the app details or by visiting manually the URL:

```
http://metamaps.cc/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code
```

Once you are there, you should sign in and click on `Authorize`.
You will then see a response that contains your "authorization code", which you need to exchange for an access token.

#### Requesting the access token

To request the access token, you should use the returned code and exchange it for an access token. To do that you can use any HTTP client. Here's an example with `fetch`

```javascript
fetch('https://metamaps.cc/oauth/token?client_id=THE_ID&client_secret=THE_SECRET&code=RETURNED_CODE&grant_type=authorization_code&redirect_uri=urn:ietf:wg:oauth:2.0:oob', {
  method: 'POST',
  credentials: 'same-origin'
}).then(response => {
  return response.json()
}).then(console.log).catch(console.error)

# The response will be like
{
 "access_token": "de6780bc506a0446309bd9362820ba8aed28aa506c71eedbe1c5c4f9dd350e54",
 "token_type": "bearer", 
 "expires_in": 7200,
 "refresh_token": "8257e65c97202ed1726cf9571600918f3bffb2544b26e00a61df9897668c33a1"
}
```

You can now make requests to the API with the access token returned.
