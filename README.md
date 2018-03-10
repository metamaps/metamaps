[![Build Status](https://travis-ci.org/metamaps/metamaps-ui.svg?branch=master)](https://travis-ci.org/metamaps/metamaps-ui)

Make sure you're running a good up to date LTS version of `node`, like 8.9.4

Make sure you have `node-sass` installed
`$ npm install -g node-sass`

Run the following at the same time, in TWO SEPARATE terminals. We tell the server where the backend process is running with the API environment variable
JS files, and CSS will rebuild automatically, just refresh the page
If coding the server itself, you will have to use nodemon, or kill and restart the server process manually
```
$ API=http://localhost:3001 node server.js
$ node-sass -w sass/application.scss public/css/application.css
```

To make sure the css files get built, use the following in another terminal
```
touch sass/application.scss
```

Run the metamaps api in another terminal using (on port 3001, so the UI can talk to it)
For now, make sure you are running on the `add-user-route` branch of Metamaps, and that it's up to date with the latest on that branch
`$ rails s -p 3001`

open up http://localhost:3000 and start coding!

Checklist
- [x] Get the Import lightbox working, and not conflicting on screen
- [x] Handling CSRF
- [x] Fix images referenced in the JS
- [x] Figure out how authentication of requests from the frontend to the API works
- [x] Figure out how to combine the nodejs realtime server into server.js
- [x] Notifications: make sure loading states are working for popup and page
- [x] Request unreadNotificationCount
- [x] Request invite code
- [x] Request user object itself
- [x] Load the metacodes
- [x] move ImportDialog lightbox into main app
- [x] create topic form
- [x] Fork map lightbox / component

- [ ] fix other places where metacode sets are used
- [ ] make newtopic form load metacodes from users selected ones
- [ ] create synapse form
- [ ] replace old loader with react loader
- [ ] ensure exports of maps work
- [ ] Notifications: make sure notifications either look nice, or redirect
- [ ] Notifications: pagination
- [ ] Notifications: Request unreadNotificationCount
- [ ] Notifications: CSS fixes related to 'controller-x' in body classes
- [ ] Make sure loading state for explore maps pages work
- [ ] Get actioncable working
- [ ] lightboxes
- [ ] About lightbox
- [ ] Switch Metacodes lightbox / component
- [ ] break up index.html into parts
- [ ] Handle CSS metacode colors
- [ ] Fix Request An Invite page
- [ ] Make 'new map' action work
- [ ] Modify the remaining rails templates into JSX templates
  - [x] notifications list
  - [x] notification page
  - [x] list metacodes
  - [x] new metacode
  - [x] edit metacode
  - [x] list metacode_sets
  - [x] new metacode set
  - [x] edit metacode set
  - [ ] authorized apps
  - [ ] registered apps
  - [ ] authorize
  - [ ] user passwords
- [ ] Modify the RubyOnRails app to only serve JSON responses, no HTML pages anymore
- [ ] Modify the frontend to request that data from the API which is necessary at first to load the page
  - [x] Load the metacode sets

To run the server as a daemon that will be re-run if it crashes, you can
use the forever node package.
```
$ npm install -g forever
$ forever start server.js
```