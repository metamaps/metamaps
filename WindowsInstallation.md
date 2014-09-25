First off, Metamaps runs on Ruby On Rails. Ruby 1.9.3 and Rails 3.2. You'll need to get Ruby and Rails installed on your computer if you don't already have it. We recommend using the Rails Installer, which you can download from Mac or Windows at http://railsinstaller.org/en (see the notes below about Ubuntu). This will get you set up perfectly with the right versions of Ruby, and Rails for running your local version of Metamaps.

It uses postgreSQL 9.2 as a database. You can install that for your computer from here: http://www.enterprisedb.com/products-services-training/pgdownload . During installation you can choose whatever database password you like. Make sure to note it down!

Once you install those, open a 'command prompt with ruby and rails'. 

Navigate to the folder that you want to download the metamaps files to and run the following: (use your forked git repository address if it's different than this repo. You will also need to go to your Github account settings and add the SSH key that was placed in your clipboard earlier)

    git clone https://github.com/Connoropolous/metamaps_gen002.git
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
