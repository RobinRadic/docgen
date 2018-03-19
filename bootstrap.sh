#!/bin/bash

yarn install
cd src/sassdoc-theme
yarn install
make clean
make dist
cd ..
cd ..
yarn build
