#!/usr/bin/env bash

SCRIPT_FOLDER="$(dirname $(readlink $0))"

ts-node --swc "$SCRIPT_FOLDER/nrfconnect-license.ts" "$@"
