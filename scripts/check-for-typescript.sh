#!/usr/bin/env bash

set -o errexit -o pipefail

ts-node ./node_modules/pc-nrfconnect-shared/scripts/check-for-typescript.ts "$@"
