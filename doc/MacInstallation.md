# OSX Install

Install rvm (ruby version manager)

    \curl -sSL https://get.rvm.io | bash -s stable --rails
 
Use rvm to install Ruby version 2.3.0

    rvm install 2.3.0 --with-gcc=clang
    rvm use 2.3.0

Now install homebrew. (a package manager for mac)

    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

Then install nodejs (make sure its version 6.11.1 or greater)

    brew install nodejs
    npm install
    npm run build

And postgresql:

    brew install postgresql
    ln -sfv /usr/local/opt/postgresql/*.plist ~/Library/LaunchAgents
    createuser metamaps -P -s -d

Set a password, then start the service:

    brew services start postgresql

Change directory to the metamaps git repository, and run:

    bundle install

Copy the .example-env file and rename it to .env. Then modify the DB_USERNAME and DB_PASSWORD values to match the postgres username and password you set

Now use rake to create and set up the database

    rake db:create
    rake db:setup

To start the rails server:

    rails server
    
To start the realtime server:

    node realtime/realtime-server.js
    
NOTE: if you want to actively develop on the javascript in `/frontend` use

    npm run build:watch
to start a webpack build process that updates the build everytime you make code changes

Now open a browser to http://localhost:3000!
    
Sign in with the default account

    email: user@user.com
    password: toolsplusconsciousness

OR create a new account at /join, and use access code 'qwertyui'

Start mapping and programming!
