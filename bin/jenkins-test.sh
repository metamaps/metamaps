#!/bin/bash -l

#prerequisites
#sudo aptitude -q -y install libpq-dev

source "$HOME/.rvm/scripts/rvm"
rvm install $(cat .ruby-version)
rvm gemset use $(cat .ruby-gemset)
gem install bundler

set -x

#configure environment
export RAILS_ENV=test
cp .example-env .env
sed -i -e "s/DB_USERNAME='.*'/DB_USERNAME='jenkins'/" .env

#test
bundle install
rake db:create db:test:prepare
bundle exec rspec
