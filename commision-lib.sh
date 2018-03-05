#!/usr/bin/env bash

echo Building contracts

cd ./contracts/
#truffle networks --clean
truffle migrate

echo Deploying Contracts

export LIB=../lib
npm run deploy
cd ..

echo Building lib

cd lib/
npm run deploy
cd ..

echo Updating package

npm install -u sharecharge-lib
