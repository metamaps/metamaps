Firstly this walkthrough is done with a 14.04 32bit install of Ubuntu.
Let's check if all updates for the system are installed first. In a
terminal type:

    sudo apt-get update

Now we need to install git:

    sudo apt-get install git

Now let's get our RVM installed (Ruby Version Manager). Now this is fun
because the package you will get from apt-get is outdated. So we are going
to use CURL to get RVM

    sudo apt-get install curl

Then lets install RVM with curl like this

    gpg --keyserver hkp://keys.gnupg.net \
      --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
    \curl -sSL https://get.rvm.io | bash -s stable
    PATH=$PATH:$HOME/.rvm/bin
    [[ -s "$HOME/.profile" ]] && source "$HOME/.profile"
    [[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm"
    source ~/.rvm/scripts/rvm

Now we can actually install RVM

    rvm requirements

Running this will check your system for requirements as well so you will need to put your system password in.

All right now we can download metamaps from the master using git

    git clone https://github.com/metamaps/metamaps_gen002.git

Now there is a couple other things we are going to need which is nodejs, postgresql, libpq-dev and redis-server

    sudo apt-get install nodejs npm
    sudo ln -s /usr/bin/nodejs /usr/bin/node
    sudo apt-get install postgresql
    sudo apt-get install libpq-dev
    sudo apt-get install redis-server

Furthermore, if you want to be able to work on profile picture uploading,
or use it you'll need ImageMagick. On Ubuntu, you can just go find
ImageMagick in the Ubuntu Software Centre

Install the specific version of ruby needed this will take some time

    rvm install $(cat metamaps_gen002/.ruby-version)

Now we also need to copy .example-env to a new file named .env. Review the
configuration in here to see if you need any changes.

    cp .example-env .env

Now run inside your metamaps_gen002 folder:

    gem install bundle
    bundle install

in your top level directory for metamaps. This is a lengthy process so you might want to go and make a coffee or something :)

All right now we need to make sure your postgres password is the same as
it is listed in the .env file so we are going to set it by

    sudo -u postgres psql

Use these commands to set the password to 3112 and then quit:

    \password postgres
    \q

now we can use rake to create, load the schema into, and load db/seeds.rb
into the postgres database:

    rake db:setup

Open a new terminal, navigate to the metamaps directory, and execute the
server: 
    
    rails s

and dont forget to run the other server for realtime...

    cd realtime
    npm install
    node realtime-server.js

Now you're all set enjoy your personal server of metamaps :) Navigate your browser to localhost:3000 once you have the server running. Sign in with the default account

    email: user@user.com
    password: toolsplusconsciousness

OR create a new account at /join, and use access code 'qwertyui'

Start mapping and programming!
