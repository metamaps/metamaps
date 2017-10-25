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

    sudo apt-get install postgresql-9.4
    # make sure you have development headers for postgres. The package name might be different on your distribution.
    sudo apt-get install libpq-dev
    sudo -u postgres psql
    postgres=# CREATE USER metamaps WITH PASSWORD 'mycoolpassword' CREATEDB;
    postgres=# CREATE DATABASE metamaps_production OWNER metamaps;
    postgres=# \q

On some deploys, we have had problems with unicode encoding when trying to run `db:setup`. Running the commands in this Github gist resolved the issue: https://gist.github.com/amolkhanorkar/8706915. Try this link if you have problems

#### Install Node for javascript building

    # this first line lets us use up-to-date versions of node.js
    # instead of the old versions in the Ubuntu repositories
    curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
    sudo apt-get install nodejs
    sudo ln -s /usr/bin/nodejs /usr/bin/node

### Install redis server for action cable

    sudo apt-get install redis-server

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
    cat metamaps/.ruby-version

The last line tells you what version of ruby you need to install. For example, at the time of writing the version is 2.3.0. As your normal sudo-enabled user, run

    sudo rvm install 2.3.0

Now switch back to the metamaps user and continue

    cd /home/metamaps/metamaps
    gem install bundler
    RAILS_ENV=production bundle install

#### Connect rails database

Run this in the metamaps directory, still as metamaps:

    # fill in DB_* values, and realtime server at least. Change the 
    # SECRET_KEY_BASE to something new. Ctrl+X to save/exit from nano.
    cp .example-env .env
    nano .env

    # Set up environment variables in your current session
    source .env
    export RAILS_ENV=production
    export NODE_ENV=production

    # create, load schema, seed
    bundle exec rails db:setup

#### Precompile assets

Note that `rails assets:precompile` will normally call `npm install` and `bin/build-apidocs.sh` as part of its process. Both of these latter commands require `npm install` to be run first. We suggest you run all five commands separately this time (like below) to better catch any errors. In the future, you won't need to run the second and third commands separately.

    npm install
    npm run build
    bin/build-apidocs.sh
    bundle exec rails assets:precompile
    bundle exec rails perms:fix

#### Nginx and SSL

We recommand using Passenger + Nginx to serve your website. You can contact us for our nginx configuration.

Get an SSL certificate and encrypt it for the realtime video.

#### And finally

    passenger-config restart-app /home/metamaps/metamaps

If this command fails, it may be helpful for debugging to run a test
server to see what problems show up:

    RAILS_ENV=production rails server

#### Realtime server:

    sudo npm install -g forever
    (sudo crontab -u metamaps -l 2>/dev/null; echo "@reboot NODE_REALTIME_PORT=5000 /usr/bin/forever --minUptime 1000 --spinSleepTime 1000 --append -l /home/metamaps/logs/forever.realtime.log -c /home/metamaps/metamaps/node_modules/.bin/babel-node --workingDir /home/metamaps/metamaps start /home/metamaps/metamaps/realtime/realtime-server.js") | sudo crontab -u metamaps

    mkdir -p /home/metamaps/logs
    /usr/bin/forever --minUptime 1000 --spinSleepTime 1000 \
      --append -l /home/metamaps/logs/forever.realtime.log \
      -c /home/metamaps/metamaps/node_modules/.bin/babel-node \
      --workingDir /home/metamaps/metamaps \
      start /home/metamaps/metamaps/realtime/realtime-server.js

#### Upstart service for delayed_worker:

If your system uses upstart for init scripts, put the following code into `/etc/init/metamaps_delayed_job.conf`:

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
    
    exec bundle exec rails jobs:work

Then start the service and check the last ten lines of the log file to make sure it's running OK:

    sudo service metamaps_delayed_job start
    tail /var/log/upstart/metamaps_delayed_job.log

#### Systemd service for delayed_worker:

If your system uses systemd for init scripts, ptu the following code into `/etc/systemd/system/metamaps_delayed_job.service`:

    [Unit]
    Description=metamaps delayed job service
    After=network-online.target

    [Service]
    ExecStart=/usr/local/rvm/gems/ruby-2.3.0@metamaps/bin/bundle exec rails jobs:work
    WorkingDirectory=/home/metamaps/metamaps
    Restart=always
    User=metamaps
    Group=metamaps
    Environment=HOME=/home/metamaps
    Environment=PATH=/usr/local/rvm/gems/ruby-2.3.0@metamaps/bin:/usr/local/rvm/gems/ruby-2.3.0@global/bin:/usr/local/rvm/rubies/ruby-2.3.0/bin:/usr/local/rvm/bin:/usr/local/bin:/usr/bin:/bin
    Environment=GEM_PATH=/usr/local/rvm/gems/ruby-2.3.0@metamaps:/usr/local/rvm/gems/ruby-2.3.0@global
    Environment=RAILS_ENV=production

    [Install]
    WantedBy=multi-user.target

Then start the service and check the last ten lines of the log file to make sure it's running OK:

    sudo systemctl start metamaps_delayed_job
    # ??? how the heck do you check systemd logs??
    
##### initial service startup
    sudo systemctl enable metamaps_delayed_job
    sudo systemctl start metamaps_delayed_job
    sudo systemctl status metamaps_delayed_job

##### after changing
    sudo systemctl daemon-reload
    sudo systemctl restart metamaps_delayed_job
    sudo systemctl status metamaps_delayed_job
