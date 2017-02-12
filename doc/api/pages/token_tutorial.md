You can create a token by using the API, or you can get your first token at https://metamaps.cc/tokens/new. Once you have this token, you can append it to a request. For example, opening a private window in your browser and browsing to `https://metamaps.cc/api/v2/users/current?token=...token here...` would show you your current user, even without logging in by another means.

To get a list of your current tokens (while logged in to the main site), you can run the following fetch request in your browser console (assuming the current tab is on some page within the `metamaps.cc` website. The token you need to append to the url will look something like `T1ZI012rseqF1XZWFBVj4JSXR5g3OpYC`, but this example token won't work for you. You need your own.

```
fetch('/api/v2/tokens', {
  method: 'GET',
  credentials: 'same-origin', // needed so the API knows which account you're logged in to
}).then(response => {
  return response.json()
}).then(console.log).catch(console.error)
```

If this is your first time accessing the API, this list wil be empty. You can create a token over the API using a similar method:

```
fetch('/api/v2/tokens?token=T1ZI012rseqF1XZWFBVj4JSXR5g3OpYC', {
  method: 'POST'
}).then(response => {
  return response.json()
}).then(payload => {
  console.log(payload)
}).catch(console.error)
```

`payload.data.token` will contain a string which you can use to append to requests to access the API from anywhere.
