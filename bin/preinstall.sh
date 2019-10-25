#!/bin/bash
if [[ -v NETLIFY_IMAGE ]]
then
  nvm install 12.13.0 && nvm use 12.13.0
fi

