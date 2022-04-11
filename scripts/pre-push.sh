#!/bin/bash

set -o errexit -o pipefail

[ "$GIT_SKIP_LINT_ON_PUSH" ] || npm run check
[ "$GIT_SKIP_TEST_ON_PUSH" ] || npm run test
