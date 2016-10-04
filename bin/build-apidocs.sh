#!/bin/bash

# Note: you need to run `npm install` before using this script or raml2html won't be installed

if [[ ! -x ./node_modules/.bin/raml2html ]]; then
  npm install
fi

./node_modules/.bin/raml2html -i ./doc/api/api.raml -o ./public/api/index.html
