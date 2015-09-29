#!/usr/bin/env bash
node -e "require('./api').runUpdater(function(){process.exit(0);});"
