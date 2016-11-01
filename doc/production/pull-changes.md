## How to pull changes from github to an instance:

These are the steps we use to pull production code to our server. Feel free to adapt them to your own use. We are using an Ubuntu 14.04 server.

First, run one of these two code blocks. The first is if you've merged the code into the instance/mycoolinstance already. The second is if you'd like to make the merge on the server.

EITHER THIS

    git checkout instance/mycoolinstance
    git fetch origin/instance/mycoolinstance
    git reset --hard origin/instance/mycoolinstance

OR

    git checkout instance/mycoolinstance
    git fetch origin master
    git merge origin/master

Now that you have the code, run these commands:

    export RAILS_ENV=production
    export NODE_ENV=production
    source .env

    bundle install
    npm install
    rails db:migrate
    rails assets:precompile # includes `npm run build` and `bin/build-apidocs.sh`
    rails perms:fix
    passenger-config restart-app .

    forever list #find the uid of the realtime server, e.g. xQKv
    forever restart xQKv

    sudo service metamaps_delayed_job restart
