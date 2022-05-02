#!/usr/bin/env bash

ts-node --swc "$(dirname $0)/check-for-typescript.ts" "$@"
