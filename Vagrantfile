# -*- mode: ruby -*-
# vi: set ft=ruby :

$script = <<SCRIPT

# install base req's
sudo apt-get update
sudo apt-get install git curl -y

# rvm and ruby
su - vagrant -c 'curl -sSL https://rvm.io/mpapis.asc | gpg --import -'
su - vagrant -c 'curl -sSL https://get.rvm.io | bash -s stable --ruby=2.1.3'

# install some other deps
sudo apt-get install nodejs -y
sudo apt-get install npm -y
sudo apt-get install postgresql -y
sudo apt-get install libpq-dev -y
sudo apt-get install redis-server -y

# get imagemagick
sudo apt-get install imagemagick --fix-missing

# Install node
ln -fs /usr/bin/nodejs /usr/bin/node

# install forever for running the node server
sudo npm install forever -g

# set the postgres password
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '3112';"

SCRIPT

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "trusty64"
  config.vm.box_url = "http://cloud-images.ubuntu.com/vagrant/trusty/current/trusty-server-cloudimg-amd64-vagrant-disk1.box"
  config.vm.network :forwarded_port, guest: 3000, host: 3000
  config.vm.network :forwarded_port, guest: 5001, host: 5001
  config.vm.network "private_network", ip: "10.0.1.11"
  config.vm.synced_folder ".", "/vagrant", :nfs => true

  config.vm.provision "shell", inline: $script
end
