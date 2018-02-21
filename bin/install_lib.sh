#!/usr/bin/env bash

if [ -d src/lib ]; then
    rm -rf src/lib
fi

git clone git@github.com:motionwerkGmbH/sharecharge-core-client-lib.git src/lib
cd src/lib && npm install