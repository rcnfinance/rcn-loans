#!/bin/bash
if [[ -v IS_NETLIFY ]]
then
  echo "is netlify"
  nvm install 12.13.0 && nvm use 12.13.0
else
  echo "skipping nvm"
fi

