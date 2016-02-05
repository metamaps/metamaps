#!/bin/bash -l

# jenkins machine prerequisites
# sudo aptitude -q -y install libpq-dev
# install rvm with user gemsets

source "$HOME/.rvm/scripts/rvm"
rvm use $(cat .ruby-version) || \
  rvm install $(cat .ruby-version)
rvm gemset use $(cat .ruby-gemset) || \
  rvm gemset create $(cat .ruby-gemset) && \
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
COVERAGE=on bundle exec rspec
