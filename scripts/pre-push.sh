#!/bin/bash

set -o errexit -o pipefail

[ "$GIT_SKIP_LINT_ON_PUSH" ] || npm run lint
[ "$GIT_SKIP_TEST_ON_PUSH" ] || npm run test
