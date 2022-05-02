#!/usr/bin/env bash

ts-node --swc "$(dirname $0)/nrfconnect-license.ts" "$@"
