#!/usr/bin/env bash

set -e
export wd=$(pwd)

echo usage ./bin/commision-lib.sh from the core client base path.

echo Building contracts

cd ../sharecharge-contracts/
truffle networks --clean
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

echo Reinstalling package
npm install sharecharge-lib --save --force