If you have any trouble with this process, contact us at team@metamaps.cc, and one of our developers may be able to help you out.

First, http://railsinstaller.org/en. This will install Ruby, Rails, and Git for you.

Once you've done that, you will need to download PostgreSQL and node.js:

 - http://nodejs.org/en/download/
 - http://www.postgresql.org/download/windows/

Now open a terminal, and navigate to the folder that you want to download the metamaps files to and run the following:

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
