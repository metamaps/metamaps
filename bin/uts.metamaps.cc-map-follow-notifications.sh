#!/bin/bash

cd /home/metamaps/uts.metamaps.cc/

date

# Load RVM into a shell session *as a function*
if [[ -s "$HOME/.rvm/scripts/rvm" ]] ; then
  source "$HOME/.rvm/scripts/rvm"
elif [[ -s "/usr/local/rvm/scripts/rvm" ]] ; then
  source "/usr/local/rvm/scripts/rvm"
else
  printf "ERROR: An RVM installation was not found.\n"
  exit 1
fi
VERSION="$(cat .ruby-version)"
GEMSET="$(cat .ruby-gemset)"
rvm use ${VERSION}@${GEMSET}

source .env
bundle exec rake metamaps:deliver_map_activity_emails
echo ""
