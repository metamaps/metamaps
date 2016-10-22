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
