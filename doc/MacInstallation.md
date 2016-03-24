# OSX Install

If you are doing an upgrade and or recent pull for changes you will need to change your default ruby package from 2.1.1 to ruby 2.1.2

Some of these steps are pulled from http://www.moncefbelyamani.com/how-to-install-postgresql-on-a-mac-with-homebrew-and-lunchy/

Install homebrew

    \curl -sSL https://get.rvm.io | bash -s stable --rails
    rvm install 2.1.3 --with-gcc=clang
    rvm use 2.1.3
    gem install lunchy 

Now install homebrew. 

    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

Then install nodejs

    brew install nodejs

And postgresql:

    brew install postgresql
    ln -sfv /usr/local/opt/postgresql/*.plist ~/Library/LaunchAgents
    createuser metamaps -P -s -d

Set a password, then start the service:

    lunchy start postgres

Change directory to the metamaps git repository, and run:

    bundle install

Copy the .example-env file and rename it to .env. Then modify the DB_USERNAME and DB_PASSWORD values to match the postgres username and password you set

    rake db:create
    rake db:schema:load
    rake db:fixtures:load
    rails server

Now open a browser to http://localhost:3000!
