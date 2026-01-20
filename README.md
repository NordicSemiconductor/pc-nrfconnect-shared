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

## Disabled Sass warnings

Because we still use an outdated version of Bootstrap, we would get several Sass
warnings when using the latest version of Sass. Our goal is to move away from
Bootstrap (and mostly also plain CSS/Sass) but until that is accomplished we
would get those warnings. Because of that, some Sass warnings are silenced. If
you want to see all Sass warnings, set the env variable
`ENABLE_ALL_SASS_WARNINGS` to `true` while building an app or shared, e.g. by
calling `ENABLE_ALL_SASS_WARNINGS=true npm run build:dev`.

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
