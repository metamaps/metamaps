#### Install passenger (e.g. Ubuntu Trusty like this:)

    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 \
      --recv-keys 561F9B9CAC40B2F7
    sudo apt-get install -y apt-transport-https ca-certificates

    # Add APT repository
    sudo sh -c 'echo deb https://oss-binaries.phusionpassenger.com/apt/passenger trusty main > /etc/apt/sources.list.d/passenger.list'
    sudo apt-get update

    # Install Passenger + Nginx (try apache if you would rather not change
    # nginx)
    sudo apt-get install -y nginx-extras passenger

#### Setup Postgres

    sudo apt-get install postgresql-9.4 #specify version!!
    sudo -u postgres psql
    postgres=# CREATE USER metamaps WITH PASSWORD 'mycoolpassword' CREATEDB;
    postgres=# CREATE DATABASE metamap002_production OWNER metamaps;
    postgres=# \q

#### Install system-wide rvm:

    sudo gpg --keyserver hkp://keys.gnupg.net \
      --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
    \curl -sSL https://get.rvm.io | sudo bash -s stable
    echo "gem: --no-ri --no-rdoc" | sudo tee -a /etc/gemrc

#### Create user and setup gemsets for that user

    sudo adduser --disabled-password metamaps
    sudo adduser metamaps rvm

#### Clone github repo and install gems

    sudo su - metamaps
    rvm user gemsets
    git clone https://github.com/metamaps/metamaps \
      --branch instance/mycoolinstance
    rvm install $(cat metamaps/.ruby-version) #ensure ruby is installed
    cd metamaps
    gem install bundle
    bundle install

#### Connect rails database

Run this in the metamaps directory, still as metamaps:

    # fill in DB_* values, and realtime server at least. Change the 
    # SECRET_KEY_BASE to something new. Ctrl+X to save/exit from nano.
    cp .example-env .env
    nano .env

    # Set up environment variables in your current session
    source .env
    export RAILS_ENV=production

    # create, load schema, seed
    rake db:setup

Now set up nginx - config stored on Linode, including relevant environment 
variables.

Get an SSL certificate and encrypt it for the realtime video.

#### And finally

    passenger-config restart-app /home/metamaps/metamaps

If this command fails, it may be helpful for debugging to run a test
server to see what problems show up:

    RAILS_ENV=production rails server

#### Realtime server:

    sudo aptitude install nodejs npm
    sudo ln -s /usr/bin/nodejs /usr/bin/node
    sudo npm install -g forever
    (crontab -u metamaps -l 2>/dev/null; echo "@reboot $(which forever) --append -l /home/metamaps/logs/forever.realtime.log start /home/metamaps/metamaps/realtime/realtime-server.js") | crontab -u metamaps -

    cd /home/metamaps/metamaps/realtime
    npm install
    mkdir -p /home/metamaps/logs
    forever --append -l /home/metamaps/logs/forever.realtime.log \
      start /home/metamaps/metamaps/realtime/realtime-server.js

#### Upstart service for delayed_worker:

Put the following code into `/etc/init/metamaps_delayed_worker.conf`:

    description "Delayed Jobs Worker for Metamaps"
    
    start on runlevel [2345]
    stop on runlevel [!2345]
    
    setuid metamaps
    setgid metamaps
    chdir /home/metamaps/metamaps
    
    env HOME=/home/metamaps
    env PATH="/usr/local/rvm/gems/ruby-2.3.0@metamaps/bin:/usr/local/rvm/gems/ruby-2.3.0@global/bin:/usr/local/rvm/rubies/ruby-2.3.0/bin:/usr/local/rvm/bin:/usr/local/bin:/usr/bin:/bin"
    env GEM_PATH="/usr/local/rvm/gems/ruby-2.3.0@metamaps:/usr/local/rvm/gems/ruby-2.3.0@global"
    env RAILS_ENV="production"
    
    respawn
    respawn limit 3 30
    
    exec bundle exec rake jobs:work

Then start the service and check the last ten lines of the log file to make sure it's running OK:

    sudo service metamaps_delayed_job start
    tail /var/log/upstart/metamaps_delayed_job.log
