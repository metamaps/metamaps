First off, Metamaps runs on Ruby On Rails. Ruby 2.1.3 and Rails 3.2. You'll need to get Ruby and Rails installed on your computer if you don't already have it. Go to here for Ruby http://rubyinstaller.org/downloads/

You'll also need GIT: http://git-scm.com/download/win

It uses postgreSQL 9.2 as a database. You can install that for your computer from here: http://www.enterprisedb.com/products-services-training/pgdownload . During installation you can choose whatever database password you like. Make sure to note it down!

Once you install those, open a 'command prompt with ruby'. 

to install rails
    gem install rails -v 3.2
    
also download node.js, which is also needed http://nodejs.org/download/

Navigate to the folder that you want to download the metamaps files to and run the following: (use your forked git repository address if it's different than this repo. You will also need to go to your Github account settings and add the SSH key that was placed in your clipboard earlier)

    git clone https://github.com/metamaps/metamaps_gen002.git --branch develop
    cd metamaps_gen002
  
Now you're in the main directory. 

Install all the gems needed for Metamaps by running

    bundle install

Setting up the database:

1) Copy /config/database.yml.default and rename the copy to /config/database.yml then edit database.yml with your text editor and set the password to whatever you chose when you set up the PostGres database.
 
2) In a terminal:

    rake db:create
    rake db:schema:load
    rake db:fixtures:load

Running the server:

    rails s
  
Navigate your browser to localhost:3000 once you have the server running

Sign in with the default account

email: user@user.com

password: toolsplusconsciousness

OR create a new account at /join, and use access code 'qwertyui'

Start mapping and programming!
