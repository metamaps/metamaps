Firstly this walkthrough is done with a 14.04 32bit install of Ubuntu.

All commands that I could are terminal based.

Lets check if all updates for the system are installed first

in terminal type

    sudo apt-get update

now we need to install git

    sudo apt-get install git

lets get our RVM installed (Ruby Version Manager) now this is fun because the package you will get from apt-get is outdated.

so we are going to use CURL to get RVM

    sudo apt-get install curl

then lets install RVM with curl like this

    curl -L get.rvm.io | bash -s stable

    PATH=$PATH:$HOME/.rvm/bin

    [[ -s "$HOME/.profile" ]] && source "$HOME/.profile"

    [[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm"

    source ~/.rvm/scripts/rvm

now we can actually install RVM

    rvm requirements

running this will check your system for requirements as well so you will need to put your system password in.

alright now we can download metamaps from the master using git

    git clone https://github.com/metamaps/metamaps_gen002.git

now there is a couple other things we are going to need which is phantomjs, nodejs, postgresql, libpq-dev and redis-server

    
    // 64 bit ubuntu
    cd /usr/local/share
    sudo wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.7-linux-x86_64.tar.bz2
    sudo tar xjf phantomjs-1.9.7-linux-x86_64.tar.bz2
    sudo ln -s /usr/local/share/phantomjs-1.9.7-linux-x86_64/bin/phantomjs /usr/local/share/phantomjs
    sudo ln -s /usr/local/share/phantomjs-1.9.7-linux-x86_64/bin/phantomjs /usr/local/bin/phantomjs
    sudo ln -s /usr/local/share/phantomjs-1.9.7-linux-x86_64/bin/phantomjs /usr/bin/phantomjs
    
    
    // 32 bit ubuntu
    cd /usr/local/share
    sudo wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.7-linux-i686.tar.bz2
    sudo tar xjf phantomjs-1.9.7-linux-i686.tar.bz2
    sudo ln -s /usr/local/share/phantomjs-1.9.7-linux-i686/bin/phantomjs /usr/local/share/phantomjs
    sudo ln -s /usr/local/share/phantomjs-1.9.7-linux-i686/bin/phantomjs /usr/local/bin/phantomjs
    sudo ln -s /usr/local/share/phantomjs-1.9.7-linux-i686/bin/phantomjs /usr/bin/phantomjs
    
    // on either running
    phantomjs -v
    // will confirm it's installed

    sudo apt-get install nodejs

    sudo apt-get install postgresql

    sudo apt-get install libpq-dev

    sudo apt-get install redis-server

Furthermore, if you want to be able to work on profile picture uploading, or use it
you'll need ImageMagick. On Ubuntu, you can just go find ImageMagick in the Ubuntu Software Centre

Install the specific version of ruby needed this will take some time

    rvm install ruby-2.1.3

Now we also need to rename your database file which is in ./config/database.default.yml to database.yml

now run inside your metamaps_gen002 folder

    bundle install

in your top lvl directory for metamaps this is a lengthy process so you might want to go and make a coffee or something :)

alright now we need to make sure your postgres password is the same as it is listed in the DB file so we are going to set it by

    sudo -u postgres psql

Select postgres like this

    \password postgres

set the password to 3112

Then to quit

    \q

now we can run the rake install and db creation

    rake db:create

    rake db:schema:load
 
    rake db:fixtures:load

Execute the server: 
    
    rails s

and dont forget to run the two other servers, for sidekiq, and realtime...
open a new terminal
navigate to ./realtime and run 

    sudo apt-get install npm
    npm install
    nodejs realtime-server.js

open a new terminal
navigate to the main directory and run 

    sidekiq

Now you're all set enjoy your personal server of metamaps :)

Navigate your browser to localhost:3000 once you have the server running

Sign in with the default account

email: user@user.com

password: toolsplusconsciousness

OR create a new account at /join, and use access code 'qwertyui'

Start mapping and programming!
