#!/bin/bash

# Note: you need to run `npm install` before using this script or raml2html won't be installed

OLD_DIR=$(pwd)
cd $(dirname $0)/..

if [[ ! -x ./node_modules/.bin/raml2html ]]; then
  npm install
fi

./node_modules/.bin/raml2html -i ./doc/api/api.raml -o ./public/api/index.html -t doc/api/templates/template.nunjucks
if [[ -x $(which open) ]]; then
  open public/api/index.html
fi

cd $OLD_DIR
