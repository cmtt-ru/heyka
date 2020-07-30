#!/bin/bash

# REMOVES LOCAL git BRANCHES THAT GONE FROM REMOTE

cd "$( dirname "${BASH_SOURCE[0]}" )"

for branch in $(git branch -vv | grep ': gone]' | awk '{print $1}'); do git branch -D $branch; done
