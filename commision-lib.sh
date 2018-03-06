#!/usr/bin/env bash

set -e
export wd=$(pwd)

echo Building contracts

cd ../sharecharge-contracts/
#truffle networks --clean
truffle migrate

echo Deploying Contracts

export LIB=../sharecharge-lib
npm run deploy
cd $wd

echo Building lib

cd $LIB
npm run deploy
cd $wd

echo Updating package

npm install -U sharecharge-lib --save
