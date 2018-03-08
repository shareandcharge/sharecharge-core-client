#!/usr/bin/env bash

set -e
export wd=$(pwd)

echo Building contracts

cd ../sharecharge-contracts/
#truffle networks --clean
truffle compile
truffle migrate

echo Deploying Contracts

export LIB=../sharecharge-lib
npm run deploy
cd $wd

echo Building lib

cd $LIB
npm run deploy
cd $wd

echo Uninstall package
npm uninstall sharecharge-lib --no-save

echo Reinstalling package
npm install sharecharge-lib --save
