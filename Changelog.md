## 4.9.6
### Added
- Added optional range.decimals to be validated for NumberInlineInput
- Updated index.d.ts with rangeShape

## 4.9.5
### Fixed
- More type enhancements:
  - Correct `systemReport` signature
  - Limit array types to readonly where possible
  - Do not use void as a callback return value
- Make linting fail if the type check fails
- Remove conflicting ESLint rule 'quotes'
- Lint all JavaScript files in this project, not just the ones in src/

## 4.9.4
### Fixes
- Fix app's dependencies in webpack config

## 4.9.3
### Added
- Added focus-visible dependency and disabled focus styles when clicked

## Version 4.9.2
### Fixed
- Some types

## Version 4.9.1
### Fixed
- Relax ESLint rule regarding @ts-ignore comments

## Version 4.9.0
### Added
- Default `tsconfig.json` for other projects to use
- Additional checks during linting:
  - Check for a `tsconfig.json` if the project uses TypeScript (if there are
    any files with the endings `.ts` or `.tsx`)
  - Run `tsc --noEmit` if there is a `tsconfig.json` to check the TypeScript
    types
### Fixed
- Type error in bleChannels
### Steps to upgrade when using this package
- If you want to use the settings from `config/tsconfig.json` in a
  TypeScript project, then put this into a `tsconfig.json` in the
  root of your project:
  ```
  {
    "extends": "./node_modules/pc-nrfconnect-shared/config/tsconfig.json",
  }
  ```
  Please note that `tsconfig.json` is _not_ used for the compilation of your
  project. We use the TypeScript transform plugin of babel for compilation and
  [that does not use the settings from
  `tsconfig.json`](https://babeljs.io/docs/en/next/babel-plugin-transform-typescript.html#caveats).
  But the settings in `tsconfig.json` are useful nonetheless, because they
  respected by many IDEs and editors as well as when you run `tsc`.

  If you want to override any settings from the default `tsconfig.json` you
  are free to do so. We put `strict` on `true` in there because that is what
  we aim for but you may want to relax that a bit when transitioning existing
  projects.

## Version 4.8.19
### Fixed
- Version number for 4.8.18 release was wrong in `package.json`.

## Version 4.8.18
### Updated
- Added `prettier.config.js` to existing script `npm run lint-init`

## Version 4.8.17
### Updated
- New design, device selector: Add PCA number, better alignment for port names,
  removed wrong line below port names

## Version 4.8.16
## Added
- Added support for files written in TypeScript
- Added Prettier formatting

### Steps to upgrade when using this package
- Note that apps using this version should add the following entry to their `package.json` file:

  `{ "prettier": "./node_modules/pc-nrfconnect-shared/config/prettier.config.js" }`

  If this isn't added, the Prettier defaults will be used, which differ from our style choices
  in a number of ways.

  On first run, the linting is likely to fail due to the prevalence of formatting errors.
  The majority of these can be fixed automatically, by running `npm run lint -- --fix`.

## Version 4.8.15
### Added
- Added onChangeComplete to InlineInput and NumberInlineInput

## Version 4.8.14
### Fixed
- Restyle device selector
- Fix scrollbars for old apps

## Version 4.8.13
### Added
- Added optional chars prop to define number of characters of NumberInput
- Added optional decimals prop to range of Slider

## Version 4.8.12
### Fixed
- Fixed the Toggle components state in case it's controlled from outside

## Version 4.8.11
### Fixed
- Fixed the fix of installation failure in local apps

## Version 4.8.10
### Added
- Added toggle component

## Version 4.8.9
### Updated
- Updated several design elements for the release of the new RSSI app
### Steps to upgrade when using this package
- Apps using the new design need to be adapted in areas were a scrollbar might
  be shown. Add a `@include scrollbars(BACKGROUND-COLOUR);` with an
  appropriate replacement for `BACKGROUND-COLOUR` to the fitting selector in
  the SCSS files. When searching for `@include scrollbars` you can find [an
  example for this in the source code of
  `pc-nrfconnect-shared`](https://github.com/NordicSemiconductor/pc-nrfconnect-shared/blob/cef186fcc4631d6c737ce4c5d299fef53a0ffcc2/src/Device/DeviceSelector/DeviceList/device-list.scss#L7).

## Version 4.8.8
### Fixed
- Fixed installation failure in local apps

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
- Disabled the ESLint rule `react/require-default-props`
- Updated the new design in many details
### Steps to upgrade when using this package
- Remove local overrides for the ESLint rule `react/require-default-props` and
  also reconsider using defaultProps when not really needed

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
- Turned `react`, `react-dom` and `react-redux` into peerDependencies
### Steps to upgrade when using this package
- Add `react`, `react-dom` and `react-redux` to your dev dependencies (you can
  omit any you do not strictly need, but most projects need all of them). Usually
  the easiest way to do this is by running `npm install --save-dev --save-exact
  react react-redux react-dom`.
- The linting rules were slightly strengthened so often some new errors pop up
  there. Many can be auto fixed, so run `npm run lint -- --fix` first and then
  review the changes made as well as the remaining issues.
- Also run the tests and check whether something needs to be corrected (e.g.
  because jest was updated). E.g. in the BLE app, references to
  `require.requireActual` needed to be corrected to `jest.requireActual`.

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
- Ease configuration of git hooks #40.
### Steps to upgrade when using this package
- If you want to automatically run the `lint` and `test` scripts before pushing
  changes, add a file `.huskyrc.json` to your project with this content:
```json
{
    "hooks": {
        "pre-push": "bash node_modules/pc-nrfconnect-shared/scripts/pre-push.sh"
    }
}
```
  Remember that in a case of emergency you can do `git push --no-verify` if you need to push even though tests might fail.

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
