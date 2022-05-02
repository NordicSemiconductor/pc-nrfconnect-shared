#!/usr/bin/env bash

set -o errexit -o pipefail

ts-node --swc ./node_modules/pc-nrfconnect-shared/scripts/nrfconnect-license.ts "$@"
