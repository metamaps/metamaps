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

    rake db:create
    rake db:schema:load
    rake db:seed
    rails server

Now open a browser to http://localhost:3000!

To start the realtime server:

    cd realtime
    node realtime-server.js
