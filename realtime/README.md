## Node.js realtime server

To run the server, you need to install the dependencies and run the server.
Please ensure you have followed the OS-specific instructions in doc/ to
install NodeJS. Once you have node, then you can proceed to install the
node packages for the realtime server:

    cd realtime
    npm install #creates node_modules directory
    node realtime-server.js

That's it!

To run the server as a daemon that will be re-run if it crashes, you can
use the forever node package.

    sudo npm install -g forever
    forever start realtime-server.js
