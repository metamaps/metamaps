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

    PATH=$PATH:$HOME/.rvm/bin # Add RVM to PATH for scripting

    [[ -s "$HOME/.profile" ]] && source "$HOME/.profile"

    [[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm"

    source ~/.rvm/scripts/rvm

now we can actually install RVM

    rvm requirements

running this will check your system for requirements as well so you will need to put your system password in.

alright now we can download metamaps from the master using git

    git clone https://github.com/Connoropolous/metamaps_gen002.git

now there is a couple other things we are going to need which is nodejs, postgresql, libpq-dev and redis-server

    sudo apt-get install nodejs

    sudo apt-get install postgresql

    sudo apt-get install libpq-dev

    sudo apt-get install redis-server

Install the specific version of ruby needed this will take some time *Note you will get a warning about this being an outdated version*

    rvm install ruby-1.9.3-p125

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

and dont forget to run realtime too open a new terminal

navigate to ./realtime and run 

    nodejs realtime-server.js

Now you're all set enjoy your personal server of metamaps :)

Navigate your browser to localhost:3000 once you have the server running

Sign in with the default account

email: user@user.com

password: toolsplusconsciousness

OR create a new account at /join, and use access code 'qwertyui'

Start mapping and programming!
