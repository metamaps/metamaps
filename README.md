
Make sure you have `nodemon` and `node-sass` installed
`$ npm install -g nodemon node-sass`


Run the following at the same time, in two terminals

```
$ API=http://localhost:3001 nodemon server.js
$ node-sass -w sass/application.scss public/css/application.css
```

To run the server as a daemon that will be re-run if it crashes, you can
use the forever node package.
```
$ npm install -g forever
$ forever start server.js
```

Run the metamaps api in another terminal using
`$ rails s -p 3001`