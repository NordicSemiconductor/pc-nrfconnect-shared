# Shared commodities for developing nRF Connect for Desktop

This project provides shared commodities for developing nRF Connect for Desktop
apps and their launcher:

- React components
- Build scripts
- Configurations
- Test facilities

## Developing a new feature or fixing an error

Whenever something is changed in pc-nrfconnect-shared, an entry should be added
to `Changelog.md`.

If there is no latest entry there yet, and you do not intend to release the
change as a new version right ahead, add a new section with the heading
`## Unreleased` at the top.

## Releasing

To release, two files must be up-to-date:

- `package.json` contain the correct version number (one more than the last
  release).
- `Changelog.md` must contain an entry, with that version number and today's
  date.

By running `npm run prepare-shared-release` you update the version in
`package.json` and in `Changelog.md` a potential `## Unreleased` heading is
updated to the right version and today‘s date.

When those conditions are met, a new release of shared will automatically be
created when the according PR is merged into main.

## Unpublishing a version

If you need to unpublish a specific version from npm (e.g., due to a critical
bug), you can use the "Unpublish npm version" GitHub Action:

1. Go to the
   [Unpublish npm version GitHub Action](https://github.com/NordicSemiconductor/pc-nrfconnect-shared/actions/workflows/unpublish-npm-version.yml)
   and run the workflow.
1. Enter the version to unpublish (e.g., `221.0.0`)

**Warning:** Unpublishing a version from npm is irreversible and should only be
done in exceptional circumstances (e.g., security vulnerabilities, critical
bugs).
