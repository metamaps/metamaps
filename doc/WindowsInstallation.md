## Install dependencies

Setting up Ruby on Windows is more of a challenge than using macOS or Linux, but there are a number of tools to make the setup easier. The five components you will need to get started are:

1. Ruby - the files for the programming language, including the program `gem` which enables you to install additional ruby libraries
2. Ruby Development Kit - extra tools from rubyinstaller.org to make building rails on Windows possible.
3. Node.js - Javascript package manager
4. Git - a version control system.
5. Postgresql 9.2: the database used in Metamaps.

### Ruby, Ruby Development Kit, and Node.js

http://blog.teamtreehouse.com/installing-rails-5-windows is an excellent tutorial that guides you through installing the first three components; in case the tutorial isn't working, you can also find what you need at http://rubyinstaller.org and https://nodejs.org.

To verify that ruby installed correctly, install your first rubygem by running:

    gem install bundler

To verify that node.js installed correctly, install your first npm package by running:

    npm install webpack

### Git

Git can be downloaded from https://github.com/git-for-windows/git/releases. Using the latest release ending in "64-bit.exe" should be fine. After installing, you can verify it works and set up your environment by running these commands in the command prompt:

    git config --global user.name "John Doe"
    git config --global user.email "johndoe@example.com"

### PostgreSQL 9.2 Database

PostgreSQL 9.2 can be downloaded from http://www.enterprisedb.com/products-services-training/pgdownload. During the installation, you'll need to choose a database password. Anything is fine, just note down what you choose.

## Build Metamaps

Once you are ready, create a new folder to hold this and any other git repositories. As an example, let's pretend you've chose C:\git, and made that folder writable by your user account.

Now you are ready to clone the Metamaps git repository:

    cd \git
    git clone https://github.com/metamaps/metamaps.git --branch develop
    cd metamaps
    gem install bundler
    bundle install

The `bundle install` command downloads and installs the rubygem dependencies of Metamaps. `gem install bundler` is only needed if you didn't run it earlier.

The next step is to install the ES6 code from the nodejs repositories:

    npm install
    npm run build

At this point you should be in C:\git\metamaps. The next step is to set up your database configuration. From the metamaps directory, run

    start config

This command will open a Windows Explorer window of the "config" directory of Metamaps. Copy `.example-env`, and rename the copy to `.env`. Edit the file and set the DB_PASSWORD to be whatever you set up with postgres earlier. Once you're done, then move back into the command prompt. The next few commands will fail unless `.env` is correctly configured and Postgres is running.

    rake db:create
    rake db:schema:load
    rake db:fixtures:load

And you're set up! At this point, you should be able to run the server at any time with only one command; you don't need to repeat any of the previous steps again. The command to run the server is:

    rails s

Navigate your browser to localhost:3000 once you have the server running

Sign in with the default account

    email:    user@user.com
    password: toolsplusconsciousness

OR create a new account at /join, and use access code 'qwertyui'

Start mapping and programming!
