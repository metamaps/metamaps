Before you begin, you'll need to install stuff:

Ruby, Git, and Rails: http://railsinstaller.org/en
PostgreSQL 9.2:       http://www.enterprisedb.com/products-services-training/pgdownload
nodejs:               http://nodejs.org/download

During the installation of the PostgreSQL database, you'll need to choose a
database password. Anything is fine, just note down what you choose.

Once you are ready, create a new folder to hold this and any other git
repositories. As an example, let's pretend you've chose C:\git, and made that
folder writable by your user account.

Now you are ready to clone the Metamaps git repository:

    git clone https://github.com/metamaps/metamaps_gen002.git --branch develop
    cd metamaps_gen002
    bundle install

The third `bundle install` command downloads and installs the rubygem
dependencies of Metamaps.
  
At this point you should be in C:\git\metamaps_gen002, or whatever equivalent
directory you've chosen. The next step is to set up your database
configuration. From the metamaps_gen002 directory, run

    start config

This command will open a Windows Explorer window of the "config" directory of
Metamaps. Copy `.example-env`, and rename the copy to `.env`. Edit the file and
set the DB_PASSWORD to be whatever you set up with postgres earlier. Once
you're done, then move back into the command prompt. The next few commands will
fail unless `.env` is correctly configured and Postgres is running.

    rake db:create
    rake db:schema:load
    rake db:fixtures:load

And you're set up! At this point, you should be able to run the server at any
time with only one command; you don't need to repeat any of the previous steps
again. The command to run the server is:

    rails s
  
Navigate your browser to localhost:3000 once you have the server running

Sign in with the default account

    email:    user@user.com
    password: toolsplusconsciousness

OR create a new account at /join, and use access code 'qwertyui'

Start mapping and programming!
