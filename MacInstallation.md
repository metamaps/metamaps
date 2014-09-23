install homebrew

    \curl -sSL https://get.rvm.io | bash -s stable --rails

    rvm install 1.9.3 --with-gcc=clang

    rvm use 1.9.3

    gem install lunchy 

(http://www.moncefbelyamani.com/how-to-install-postgresql-on-a-mac-with-homebrew-and-lunchy/)


    brew install postgresql
    ln -sfv /usr/local/opt/postgresql/*.plist ~/Library/LaunchAgents
    createuser metamaps -P -s -d

set a password

    lunchy start postgres


cd into the metamaps directory

    bundle install


copy the database.yml.default file and rename it database.yml
make sure the username and password match the POSTGRES username and password you set


http://nodejs.org/ hit install, download, open, install


    rake db:create
    rake db:schema:load
    rake db:fixtures:load
    rails s 
    
( to start the server) 
