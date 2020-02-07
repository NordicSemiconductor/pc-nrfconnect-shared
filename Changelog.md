## Version 4.4
- Update Jest

## Version 4.3
### Added
- Ease configuration of git hooks #40. If you want to automatically run the `lint` and `test` scripts before pushing changes, add a file `.huskyrc.json` to your project with this content:
```json
{
    "hooks": {
        "pre-push": "bash node_modules/pc-nrfconnect-shared/scripts/pre-push.sh"
    }
}
```

## Version 4.2
### Changed
- Enhanced handling custom devices
- Remove dependency of react-infinite. #38

## Version 4.1
### Changed
- Enhanced error dialogs:
    - Made URLs in error messages clickable (and more generally interpret them as markdown)
    - Made error messages selectable again (regression) to enable copy&pasting them.
    - Enabled custom error resolutions

## Version 4.0
### Breaking change
- This package was renamed to “pc-nrfconnect-shared”. If you refer to it anywhere under
  the old name (e.g. in a package.json or import a component from it) then you must
  update these references when upgrading to version 4.

## Version 3.6
### Changed
- Moved the shared components from core to this project (They can now be used by importing
  “pc-nrfconnect-devdep”)
- Provide a babel config for apps, instead of requiring them to provide one themselves.

## Version 3.5
### Added
- Possibility to use the new architecture through “nrfconnect/shared”
### Changed
- Updated dependencies

## Version 3.4
### Added
- Internal publishing

## Version 3.3
### Added
- Upload Changelog.md of apps when publishing

## Version 3.2
### Changed
- Switch from node-sass to dart-sass

## Version 3.1
### Changed
- Updated many dependencies

## Version 3.0
### Changed
- Updated dependencies, most notably Bootstrap to 4
### Added
- lint-init
- electronMock
