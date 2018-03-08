
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

Checklist
- [x] Get the Import lightbox working, and not conflicting on screen
- [x] Handling CSRF
- [x] Fix images referenced in the JS
- [x] Figure out how authentication of requests from the frontend to the API works
- [x] Figure out how to combine the nodejs realtime server into server.js
- [x] Notifications: make sure loading states are working for popup and page
- [ ] Notifications: make sure notifications either look nice, or redirect
- [ ] Notifications: pagination
- [ ] Get actioncable working
- [ ] lightboxes
- [x] Request unreadNotificationCount
- [x] Request invite code
- [x] Request user object itself
- [ ] About lightbox
- [ ] break up index.html into parts
- [ ] Handle CSS metacode colors
- [ ] Fix Request An Invite page
- [ ] Make 'new map' action work
- [ ] Modify the remaining rails templates into JSX templates
  - [x] notifications list
  - [x] notification page
  - [ ] list metacodes
  - [ ] new metacode
  - [ ] edit metacode
  - [ ] list metacode_sets
  - [ ] new metacode set
  - [ ] edit metacode set
  - [ ] authorized apps
  - [ ] registered apps
  - [ ] authorize
  - [ ] user passwords
- [ ] Modify the RubyOnRails app to only serve JSON responses, no HTML pages anymore
- [ ] Modify the RubyOnRails app to include an endpoint that responds with basic data the front end needs to display (such as the invite code for the user, and the current metamaps build) (a bunch of the data found here: https://github.com/metamaps/metamaps/blob/frontendonly/Metamaps.ServerData.js.erb)
- [ ] Modify the frontend to request that data from the API which is necessary at first to load the page
- [x] Load the metacodes
- [ ] Load the metacode sets
