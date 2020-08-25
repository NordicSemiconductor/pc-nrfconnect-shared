## Version 4.8.11
### Fixed
- Fixed the fix of installation failure in local apps

## Version 4.8.10
### Added
- Added toggle component

## Version 4.8.9
### Updated
- Updated several design elements for the release of the new RSSI app

## Version 4.8.8
### Fixed
- Fixed installation failure in local apps
### Updated
- Updated several design elements for the release of the new RSSI app

## Version 4.8.7
### Updated
- Made the device picker, sidepanel, and log UI elements optional

## Version 4.8.6
### Updated
- Updated confirmation dialog style

## Version 4.8.5
### Fixed
- The remote property on the electron mock was noch mocked correctly
### Changed
- Render all panes of the App, but only the current is visible

## Version 4.8.4
### Added
- Favorite and nickname in device selector for new design
- Exported array bleChannels to provide a list of all BLE channels and some
  convenience properties on it
### Changed
- Disabled the ESLint rule react/require-default-props, you should remove your
  local overrides when upgrading to this version and might also reconsider
  using defaultProps when not really needed
- Updated the new design in many details

## Version 4.8.3
### Changed
- Updated Google Analytics account and set IP as anonymized

## Version 4.8.2
### Fixed
- The mock fix in 4.8.1 broke mocks in another way 🤦‍♂️

## Version 4.8.1
### Fixed
- Added missing mocks for nrf-device-lister and nrf-device-setup to jest config.

### Changed
- Updated dependencies
- Removed mocking *.less files from the jest configuration, as we do not use them.

## Version 4.8
### Changed
- Create and connect store in App component, so this does not need to be done
  in each app (unless they want to do it themselves).
- New design for apps using the new app architecture.
- Update many dependencies
- Turned react, react-dom and react-redux into peerDependencies. So when using pc-nrfconnect-shared you might need to add them as dependencies.

## Version 4.7
### Changed
- Add a few peer dependencies

## Version 4.6
### Added
- Enable to send user data

## Version 4.5
### Added
- Enable to publish existing artifact instead of packing from source

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
