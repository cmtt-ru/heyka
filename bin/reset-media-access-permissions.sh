#!/bin/bash

# Get app bundle id for next step
# mdls -name kMDItemCFBundleIdentifier -r SomeApp.app

tccutil reset Camera com.googlecode.iterm2
tccutil reset Microphone com.googlecode.iterm2
tccutil reset ScreenCapture com.googlecode.iterm2
