# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project does _not_ adhere to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html) but contrary to it
every new version is a new major version.

## 109 - 2023-09-21

### Changed

-   Improve `Nrfutil Sandbox` error messages.

### Added

-   `Overlay` component.

## 108 - 2023-09-15

### Fixed

-   `MasonryLayout` Reacts to dropdown component making its height bigger.

## 107 - 2023-09-13

### Fixed

-   Fixed get `getAppDir()` path.

## 106 - 2023-09-13

### Added

-   `shellParser` utility
-   `StartStopButton` now also takes in optional `title` property

## 105 - 2023-09-11

### Added

-   Log warning for any nrfutil device that was not enumerated

### Fixed

-   Log device list errors.

## 104 - 2023-09-08

### Changed

-   `Nrfutil Device` batch now generate batch JSON using the CLI. Requires
    nrfutil device 1.4.2

### Fixed

-   Batch programming will now cleanup temporary files
-   Device list will use the passed devices traits

## 103 - 2023-09-06

### Added

-   Explicit export of `sendFeedback` which was a part of the `FeedbackPane`.

### Changed

-   `Button` no longer has a div wrapper
-   `Dialog.Footer` now now uses `tw-preflight`

### Steps to upgrade

-   Update `nrfConnectForDesktop.nrfutil` to version 1.4.2 in `package.json`

## 102 - 2023-09-05

### Fixed

-   Trace logging did not work in production

## 101 - 2023-09-05

### Fixed

-   Removed un styled variant type `link` from of `Button` component

### Removed

-   `link` variant type from of `Button` component.

## 100 - 2023-09-05

### Fixed

-   Unable to use nrfutil device in production due to issue with nrfutil device
    logging when set to off.

## 99 - 2023-09-04

### Added

-   nrfutil device list now supports optional timeout parameter

### Changed

-   Nrfutil device list now default to 3000ms timeout when enumerating (was
    1000ms)
-   Nrfutil device now support nrfutil device 1.4.x only
-   Nrfutil device will not log in production unless verbose logging is on

### Fixed

-   Nrfutil device std error message string
-   When SDFU MCU State change fails, wait for device is now canceled

### Removed

-   Logging for nrf-probe-lib version

## 98 - 2023-08-30

### Added

-   Logging for nrf-probe-lib
-   Persisted api keys securely using `getPersistedApiKey` and `persistApiKey`
-   `xl` size for `Button` component with bigger font.
-   `ExternalLink` component.
-   `FileLink` component.

### Fixed

-   `MasonryLayout` ResizeObserver loop limit exceeded error

### Changed

-   `Button` component now uses a `size` property instead of a boolean `large`.

### Removed

-   `link` variant of `Button` component.

### Steps to upgrade

-   Replace `large` properties of the `Button` component with `size="lg"`
-   Replace any occurrence of `link` variant `Button`s with `ExternalLink` or
    `FileLink`.

## 97 - 2023-08-29

### Added

-   Functions to invoke functionality in the main process via IPC:
    -   `safeStorage.encryptionAvailable()`
    -   `safeStorage.encryptString(plainText)`
    -   `safeStorage.decryptString(encrypted)`
-   Icons and links for:
    -   `PCA10152`
    -   `PCA10153`
    -   `PCA20049`

## 96 - 2023-08-25

### Added

-   Exported type `NrfutilDeviceWithSerialnumber`

### Changed

-   Nrfutil device list `stop` callback is now an optional parameter

## 95 - 2023-08-25

### Fixed

-   Worked around an issue where the esbuild currently has issues with
    .css-files that are named the same as their components.

## 94 - 2023-08-25

### Changed

-   Updated react to v18

## 93 - 2023-08-25

### Added

-   Nrfutil progress now has a new property `totalProgressPercentage` that
    computes the progress across all steps

### Changed

-   Nrfutil progress properties `step` and `amountOfSteps` are now always
    present
-   Nrfutil progress properties `progressPercentage` has been renamed to
    `stepProgressPercentage`

### Steps to upgrade

-   Any usage of Nrfutil property `progressPercentage` need to be renamed to
    `stepProgressPercentage`

## 92 - 2023-08-24

### Added

-   Add functionality to send metrics and traces to telemetry.

## 91 - 2023-08-23

### Changed

-   Assert that the properties of objects in `nrfConnectForDesktop.nrfutil` in
    `package.json` are really arrays with at least one entry. So e.g. all of
    these entries would be rejected:

```json
{
    "nrfConnectForDesktop": {
        "nrfutil": {
            "device": [], // Wrong: Empty array
            "legacy": null, // Wrong: null
            "toolchain-manager": "1.0.0" // Wrong: Not an array
        }
    }
}
```

### Removed

-   Exported, obsolete function `getDeviceLibContext()`.
-   Peer dependency and any remaining support for
    `@nordicsemiconductor/nrf-device-lib-js`.

## 90 - 2023-08-21

### Changed

-   Replaced `device-lib-js` with `nrfutil device`.

### Steps to upgrade

-   Any usage in the app of `@nordicsemiconductor/pc-nrfconnect-shared` should
    be replaced with the functions in `NrfutilDeviceLib` that can be imported
    from `@nordicsemiconductor/pc-nrfconnect-shared/nrfutil`.
-   Apps must add `nrfConnectForDesktop.nrfutil.device` and an array of
    supported versions in there package.json file. Example

```json
{
    "nrfConnectForDesktop": {
        "nrfutil": {
            "device": ["1.3.0"]
        }
    }
}
```

### Fixed

-   Fixed get `getAppData()` path.

## 89 - 2023-08-17

### Changed

-   Updated nrf-device-lib-js to version 0.7.1.

## 88 - 2023-08-17

### Changed

-   `html` package json property has been moved to `nrfConnectForDesktop.html`.
-   `nrfConnectForDesktop.html` is now opt-in and apps can be built without it.

### Steps to upgrade

-   Change `html` to `nrfConnectForDesktop.html` in the app package json.

## 87 - 2023-08-14

### Fixed

-   Spinner in `Dialog` components was not inlined.

## 86 - 2023-08-14

### Changed

-   Use npmignore instead of files array in package.json for deciding what gets
    packed.

### Fixed

-   `Spinner` now has old padding which was mistakenly removed.

## 85 - 2023-08-14

### Fixed

-   `getDisplayedDeviceName` could return an empty string.

## 84 - 2023-08-14

### Changed

-   Re-added underline (mistakenly removed) on hover for `link` variant of
    `Button` component.
-   Apps now have to load themselves, i.e. there is no `ReactDOM.render` done
    from the launcher anymore. The app chooses which html-page will be the
    entrypoint.
-   Passing devices of type nrf-device-lib-js `Device` to calls from
    `deviceInfo.ts` is not allowed. Passing the nrf-device-lib-js version of
    `Device` is now allowed.
-   `ErrorBoundary` now only requires nrf-device-lib-js `Device` type.
-   `systemreport` now only required nrf-device-lib-js `Device` type.

### Steps to upgrade when using this package

-   Following this step will make the app incompatible with the currently
    released launcher (v4.1.2): Add an `index`-property to package.json. The
    following example will use the index bundled with shared that works with our
    apps, but apps can also make their own instead if needed.

```json
{
    "html": "dist/index.html"
}
```

-   Render the app

```typescript
import { App, render } from '@nordicsemiconductor/pc-nrfconnect-shared';
...
render(<App />);
```

## 83 - 2023-08-11

### Added

-   `Spinner` component.

## 82 - 2023-08-09

### Fixed

-   Jest tests were broken due to missing config changes.

## 81 - 2023-08-09

### Changed

-   New name for the shared package, it is now under the `@nordicsemiconductor`
    namespace on npm. The idea is that apps will now install shared from npm,
    and use the new name `@nordicsemiconductor/pc-nrfconnect-shared` when
    importing components from shared

### Steps to upgrade when using this package

-   Remove the old dependency by running `npm rm pc-nrfconnect-shared`.
-   Change all references from `pc-nrfconnect-shared` to
    `@nordicsemiconductor/pc-nrfconnect-shared`

```diff
- import { App } from 'pc-nrfconnect-shared';
+ import { App } from '@nordicsemiconductor/pc-nrfconnect-shared';
```

-   Also check references in `tsconfig.json`, `jest.config.js` and
    `.scss`-files.

The tsconfig can use the namespace directly like this

```json
{
    "extends": "@nordicsemiconductor/pc-nrfconnect-shared/config/tsconfig.json"
}
```

The package.json can be changed as follows:

```json
{
    "eslintConfig": {
        "extends": "./node_modules/@nordicsemiconductor/pc-nrfconnect-shared/config/eslintrc"
    },
    "prettier": "@nordicsemiconductor/pc-nrfconnect-shared/config/prettier.config.js"
}
```

## 80 - 2023-08-07

### Changed

-   Linux: Check for and log `nrf-udev` install on startup.

## 79 - 2023-08-04

### Added

-   Export app utility functions (like `isInstalled`) and types.

## 78 - 2023-08-03

### Changed

-   Shared now only uses `device.jlink.boardversion` instead of
    `jlink.boardVersion`.

### Fixed

-   `deviceInfo` can now be used in applications that don't make use of the
    shared redux store.

## 77 - 2023-08-01

### Added

-   Functions to invoke functionality in the main process via IPC:

    -   `apps.getDownloadableApps()`
    -   `apps.installDownloadableApp(app, version?)`
    -   `openWindow.openApp(app, openAppOptions?)` (This was previously exported
        as `openAppWindow``)
    -   `openWindow.openLauncher()`
    -   `preventSleep.start()`
    -   `preventSleep.end(id)`

### Removed

-   Export of the serialport IPC channel names.

### Changed

-   On the build server the generated types are removed before regenerating
    them, so we make sure that we do not have stale declaration files for source
    files we already removed.

### Steps to upgrade when using this package

-   Replace all code that still uses `ipcRenderer` with invocations of the
    appropriate functions.
-   Replace invocations of `openAppWindow` with `openWindow.openApp`.

## 76 - 2023-07-28

### Changed

-   Turn on tree-shaking for tailwind classes during a development build.

## 75 - 2023-07-26

### Added

-   Material UI color shades 50-900 for 'red', 'indigo', 'amber', 'purple',
    'green', 'deepPurple', 'orange', 'lime', 'lightGreen', 'lightBlue', 'pink',
    such as e.g. `tw-bg-red-300`
-   Default Material UI color for 'red', 'indigo', 'amber', 'purple', 'green',
    'deepPurple', 'orange', 'lime', 'lightGreen', 'lightBlue', 'pink' which uses
    the 500 shade e.g `tw-bg-red`
-   NordicBlue shades 50-900 e.g. `tw-bg-nordicBlue-300`
-   `NumberInputSliderWithUnit` component that merges a number input with unit
    and a slider with one element
-   `Button` variant `link-button` with white background, and nordic blue text
    and border

### Changed

-   `Button` converted to tailwind
-   `DisplayConflictingSettings` converted to tailwind
-   `About` converted to tailwind
-   `Feedback` converted to tailwind

### Fixed

-   `DisplayConflictingSettings` spacing and minor UI inconsistencies

## 74 - 2023-07-18

### Fixed

-   `ConflictingSettingsDialog` used stale/old `active` serial settings
    information.

## 73 - 2023-07-14

### Removed

-   `custom` variant for the `Button` component.

### Steps to upgrade when using this package

-   `custom` variant `Button`s have to be replaced with `button` elements.

## 72 - 2023-07-13

### Added

-   export `persistNickname` and `getPersistedNickname`.

## 71 - 2023-07-11

### Fixed

-   `SwitchToApplicationMode` does not call on success when device is already in
    application mode

## 70 - 2023-07-07

### Fixed

-   `Dropdown` UI broken due to lack of `tw-preflight` class

## 69 - 2023-07-07

### Added

-   Turn off tree-shaking for tailwind classes during a development build.
-   Added .tw-preflight css class to be used when transitioning to tailwind. For
    more details:
    https://github.com/NordicSemiconductor/pc-nrfconnect-shared/blob/main/src/App/preflight.scss

### Changed

-   Borders for all button variants except `secondary` are now the same as their
    background colour.
-   The project specific tailwind config will now be used for post-processing if
    it exists.
-   Device setup dialog hides prompt message while in progress.

### Fixed

-   Button x-padding adapts to large vs small button
-   Device setup fails report sdfu different FW version
-   Device setup does not show the choices radio boxes

## 68 - 2023-07-05

### Added

-   `prettier-plugin-tailwindcss` for ordering Tailwind classes.

### Fixed

-   A fresh npm i without `package-lock.json` and no `node_modules` folder
    resulted in `util.promisify` is not a function
-   Button lost x-padding with the addition of tailwind

## 67 - 2023-07-04

### Added

-   Tailwind support. Use `tw-` prefix for tailwind classes and no prefix for
    bootstrap classes.

### Fixed

-   Usage data (`insights` object) was possibly undefined.

### Steps to upgrade when using this package

-   While technically not necessary in production, to use the tailwind language
    server you will have to create a `tailwind.config.js` file with the
    following contents in your project root:

```js
/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const baseConfig = require('pc-nrfconnect-shared/config/tailwind.config.js');

module.exports = {
    ...baseConfig,
};
```

## 66 - 2023-07-03

### Fixed

-   `Restart application with verbose logging` button did not restart
    application
-   Margin on feedback pane
-   Improve `NavBar` layout when there are a lot of tabs

## 65 - 2023-07-03

### Changed

-   'AppThunk<ReturnType>' to 'AppThunk<AppLayout, ReturnType>'

### Steps to upgrade when using this package

-   If 'AppThunk' is used with return type generic, add AppLayout (RootState)
    'AppThunk<AppLayout, ReturnType>'

## 64 - 2023-07-03

### Added

-   Export 'AppThunk<ReturnType>' for apps to use
-   Export 'AppDispatch' for apps to use

### Changed

-   Replace Google Analytics with Application Insights.

## 63 - 2023-06-27

### Added

-   Hook `useFocusedOnVisible` to focus an element when a dialog becomes
    visible.

### Changed

-   Flash Messages: slide-in effect duration reduced to 300ms.
-   Flash Messages: loader effect ends before slide-out effect begins.

## 62 - 2023-06-26

### Added

-   Slide-out effect for Flash messages.

### Changed

-   Reduced time for CopiedFlashMessage, from 12s to 3s.
-   Faster slide-in effect for Flash messages.

## 61 - 2023-06-23

### Added

-   `Dropdown` component now accepts className.
-   `feedback` property in `App` component to add the feedback pane and
    alternatively add custom categories.

### Changed

-   `documentation` is now supplied to the `About` pane through props.

### Removed

-   `FeedbackPane` is no longer exported.

### Steps to upgrade when using this package

-   If you want to include the `FeedbackPane` in your app, provide the
    `feedback` property to the `App` component.

## 60 - 2023-06-21

### Added

-   Exported `getWaitForDevice` hance allowing apps to resort previous state if
    needed

### Added

-   Flash Messages feature. Comes with convenience thunk functions in order to
    create info, success, warning, and error messages.

### Changed

-   FeedbackPane: Change **Platform** to **Operating system**, and remove the
    link, which opened nodejs documentation.

### Fixed

-   Device remains selected if waiting for device is ongoing and
    `clearWaitForDevice` is called
-   `DeviceSetup` on reject `isExpectedFirmware` used to fail silently

### Removed

-   Support for `LegacyPane`

### Steps to upgrade when using this package

-   Replace all instances of `LegacyPane` with `Pane` in the `panes` property of
    `App`.

## 59 - 2023-06-16

### Added

-   `StartStopButton` added new optional property `showIcon`

### Fixed

-   `StartSop` button `large` false not working

## 58 - 2023-06-14

### Changed

-   Opening port with error `FAILED_DIFFERENT_SETTINGS` will now log a warning
    not error

## 57 - 2023-06-09

### Added

-   AutoReconnect Mode `WaitForDevice.when` now support an new mode a custom
    function for more flexibility

## 56 - 2023-06-09

### Changed

-   Device setup progress bar style
-   The internal handling of the Redux store shaped was changed. Because apps
    should not make any assumptions about that, this should not break any apps
    that only go through the API. If it still breaks something, feel free to
    reach out to Marko. :-)

## 55 - 2023-06-08

### Added

-   AutoReconnect Mode `WaitForDevice.when` now support an new mode `sameTraits`

### Changed

-   AutoReconnect Mode `WaitForDevice.when` mode `BootLoaderMode` has been
    renamed to `dfuBootLoaderMode`

### Steps to upgrade when using this package

-   Replace all instances of `BootLoaderMode` to `dfuBootLoaderMode` in all
    `WaitForDevice.when`

## 54 - 2023-06-05

### Removed

-   `react-dom` is no longer listed as an external package due to launcher
    requiring it for bundling.

## 53 - 2023-06-05

### Added

-   `Toggle` parameter `label` now allows React.ReactNode.
-   `StartStop` parameter `startText` now allows React.ReactNode.
-   `StartStop` parameter `stopText` now allows React.ReactNode.

## 52 - 2023-06-02

### Changed

-   Error dialog: If there are multiple errors, state so more clearly.
-   Error dialog: Add the option to provide details to each error. To use this,
    pass a third parameter to the action creator
    `ErrorDialogActions.showDialog`.

## 51 - 2023-05-31

### Added

-   `Dropdown` parameter `label` now allows React.ReactNode.

## 50 - 2023-05-30

### Fixed

-   `dialog` text wrapping opts to keep words as whole of possible.

## 49 - 2023-05-30

### Fixed

-   `dialog` body text can now wrap and not overflow.

## 48 - 2023-05-30

### Added

-   `DropdownItem` parameter `label` now allows React.ReactNode.

## 47 - 2023-05-22

### Added

-   `needSerialport` parameter for `jprogDeviceSetup` and `sdfuDeviceSetup`.
-   Optional `confirmMessage` to `DeviceSetup`
-   Optional `choiceMessage` to `DeviceSetup`
-   `react-dom` is now listed as an external package.

### Changed

-   `IDeviceSetup` renamed to `DeviceSetup`
-   `DeviceSetup` renamed to `DeviceSetupConfig`

### Removed

-   `needSerialport` property from `DeviceSetup`.
-   `releaseCurrentDevice` callback from `DeviceSelector`.

### Steps to upgrade when using this package

-   `needSerialport` has been removed from `IDeviceSetup`. If needed, it should
    be placed into the `supportsProgrammingMode` callback or can be passed as a
    parameter to the `jprogDeviceSetup` or `sdfuDeviceSetup` wrappers.
-   Replace type `DeviceSetup` with `DeviceSetupConfig`
-   Replace type `IDeviceSetup` with `DeviceSetup`

## 46 - 2023-05-19

### Added

-   Progress bar to device setup dialog
-   `prepareDevice` function is now and can be used to program devices on demand
-   Custom device setups can be now done by implementing `IDeviceSetup` and
    passing it as the `deviceSetup` array in `DeviceSetup`

### Changed

-   FeedbackPane headers is now 14px, similar to all text, but is bold.
-   FeedbackPane Buttons are moved to the bottom right corner, from bottom left.
-   API for device Setup has been reworked
-   `switchToBootloaderMode` no longer take dispatch as a parameter and it is
    directly dispatch-able
-   `switchToApplicationMode` no longer take dispatch as a parameter and it is
    directly dispatch-able

### Steps to upgrade when using this package

-   Device Setup no longer accepts dfu and jprog instead deviceSetups are to be
    used. Examples:
    -   To replace dfu look at this example:
        `dfu: { pca10059: { application: getAppFile('fw/rssi-10059.hex'), semver: 'rssi_cdc_acm 2.0.0+dfuMay-22-2018-10-43-22', params: {}, }, }`
        is to be replaced by:
        `sdfuDeviceSetup([ { key: 'pca10059', application: getAppFile('fw/rssi-10059.hex'), semver: 'rssi_cdc_acm 2.0.0+dfuMay-22-2018-10-43-22', params: {}, }, ])`
    -   To replace jprog look at this example:
        `jprog: { nrf52_family: { fw: getAppFile('fw/rssi-10040.hex'), fwVersion: 'rssi-fw-1.0.0', fwIdAddress: 0x2000, }, }`
        is to be replaced by:
        `jprogDeviceSetup([ { key: 'nrf52_family', fw: getAppFile('fw/rssi-10040.hex'), fwVersion: 'rssi-fw-1.0.0', fwIdAddress: 0x2000, }, ])`
-   `switchToBootloaderMode` remove the second parameter `dispatch` and call
    this function using the dispatch function i.e
    `dispatch(switchToBootloaderMode(...`
-   `switchToApplicationMode ` remove the second parameter `dispatch` and call
    this function using the dispatch function i.e
    `dispatch(switchToApplicationMode(...`

## 45 - 2023-05-09

### Fixed

-   useStopwatch unmount clean up

### Changed

-   StateSelector property `items` now allows {key: string , renderItem:
    React.ReactElement} as content in addition to string
-   StateSelector property `selectedItem` now allows {key: string , renderItem:
    React.ReactElement} as content in addition to string

## 44 - 2023-05-05

### Fixed

-   Feedback pane link to Nordiv DevZone did not open in the browser.
-   Properly update package version when running the prepare script on windows.

### Changed

-   Persistent store now allows to send more options to the internal store.

## 43 - 2023-05-05

### Changed

-   Use the new property from launcher ipc to determine the app path. This is
    used for logging when the application starts up.

## 42 - 2023-05-04

### Changed

-   Updated `swc/core`. This was done to fix issues related to npm run check
    resulting in Error: @swc/core threw an error when attempting to validate swc
    compiler option. You may be using an old version of swc which does not
    support the options used by ts-node.

## 41 - 2023-05-03

### Changed

-   Updated `eslint-plugin-simple-import-sort`. This might lead to linting
    errors but they should be resolvable automatically by running autofix on
    them.

### Fixed

-   `ConflictingSettingsDialog` displayed wrong app name in the conflict
    overview. Now it will only display Active- and Selected settings.

## 40 - 2023-04-28

### Added

-   ConflictingSettingsDialog component to be utilized when SerialPort from
    pc-nrfconnect-shared is used, and the serial port may have been claimed by
    another app.

## 39 - 2023-04-28

### Added

-   SerialPort `getOptions` function in order to request the settings that was
    used to open the serial port.
-   Extended SERIALPORT_CHANNEL with entry GET_OPTIONS.

## 38 - 2023-04-28

### Fixed

-   Dropdowns allow using their scrollbars by clicking and dragging.
-   Dropdown scrollbars are styled correctly.

## 37 - 2023-04-28

### Changed

-   Updated `nrf-device-lib-js` to version 0.6.8.

## 36 - 2023-04-26

### Added

-   Scripts `prepare-shared-release` and `release-shared` to ease releasing new
    versions of shared.
-   Property `id` to `Dropdown` component.

## 35 - 2023-04-20

### Fixed

-   "Warning: validateDOMNesting(...): `<div>` cannot appear as a descendant of
    `<p>`."

## 34 - 2023-04-19

### Fixed

-   Made `InfoDialog` close when unfocusing again, which was removed during the
    previous version.

## 33 - 2023-04-19

### Added

-   Generic progress dialog.

### Changed

-   Dialog spinner has moved next to the title.

### Fixed

-   Confirmation dialog closes on ESC.
-   Information dialog closes on ESC.

### Removed

-   Exported component `Spinner`.

### Steps to upgrade when using this package

-   Move the `showSpinner` property from `Dialog.Footer` to `Dialog.Header`.

## 32 - 2023-04-14

### Added

-   New option `--create-source` to script `nordic-publish` to create a new
    source when publishing an app.

### Changed

-   Update TypeScript to 4.9.
-   Update Prettier to 2.8.7.
-   Allow setting more sizes in dialogs.
-   Use swc instead of babel to transform code for jest.

### Removed

-   Unused dependency camelcase-keys.

### Fixed

-   Error loading SVGs introduced in v31.
-   `InlineInput` only calls `onChange` and `onChangeComplete` if value has
    changed.

## 31 - 2023-04-03

### Changed

-   `nrf-device-lib-js` became a peer dependency.
-   `npm@7` or later must now be used when developing `shared`.

### Fixed

-   Autoreconnected devices were not passed with persisted data to the
    `onDeviceSelected`/`onDeviceIsReady` callbacks.

### Removed

-   Support for buiding apps with webpack. If you want to continue to use
    webpack, you now have to provide the configuration and install the needed
    dependencies yourself.

### Steps to upgrade when using this package

-   If your app declared an ambient module declaration for
    `!!@svgr/webpack!_.svg` you now have to change it to `!!@svgr!_.svg`.
-   You should use at least version 7 of `npm` starting with this version of
    shared, otherwise not all needed peer dependencies are installed and you
    need to provide them yourself.

## 30 - 2023-03-30

### Changed

-   Update `nrf-device-lib-js` to version 0.6.5.

## 29 - 2023-03-29

### Added

-   Dialog helpers (`InfoDialog`, `ErrorDialog`, `ConfirmationDialog`) all
    expose the `className` property now.

## 28 - 2023-03-28

### Added

-   Linux: If a device fails to be identified based on parameters which point to
    a missing nrf-udev installation, recommend user to install nrf-udev.

### Fixed

-   Linux: Apps would crash when identifying certain devices if nrf-udev
    installation was missing.

## 27 - 2023-03-27

### Fixed

-   Clear timeout state after timeout has elapsed.

## 26 - 2023-03-24

### Fixed

-   Retrieving persisted serialport options on windows would lead to crashes.

## 25 - 2023-03-23

### Added

-   `Stepper` caption can now have action buttons
-   `Stepper` caption can now have tooltips

### Changed

-   `Stepper` step now has an id property

### Steps to upgrade when using this package

-   `Steppers` has been renamed to `Stepper` rename all references to `Stepper`
-   `Step` add unique id to all steps.

### Fixed

-   `MasonryLayout` adapts to child elements changes that do not resize the main
    DOM element.
-   `Dropdown` will keep the list open if rerendered

## 24 - 2023-03-20

### Added

-   `updateHasReadbackProtection` now checks whether the currently selected
    device has readbackprotection enabled and updates redux store.
-   `Device` objects now contain a `persistedSerialPortOptions` property when it
    is available.

### Changed

-   `persistSerialPortOptions` is now a Redux Action and only requires a
    `SerialPortOpenOptions<AutoDetectTypes>` to be passed.

### Fixed

-   Devices now receive persisted data on first enumation.
-   Safe guard against retaining stale wait for device request if a new device
    is selected

### Removed

-   `getPersistedSerialPortOptions` export has been removed as it is an optional
    property in `Device` now.

### Steps to upgrade when using this package

-   Wrap `persistSerialPortOptions` in a `dispatch` call and only pass
    `SerialPortOptions` as parameters.
-   Replace `getPersistedSerialPortOptions` calls with the
    `persistedSerialPortOptions` property in the `Device` type (accessible from
    the DeviceSelector callbacks or through `dispatch(selectedDevice())`)

## 23 - 2023-03-16

### Added

-   `getWaitingToAutoReselect` to tell when We are waiting to auto reconnect as
    `getAutoReselect` is true
-   `getWaitingForDeviceTimeout` to tell when `setWaitForDevice` timeout has
    started
-   `clearWaitForDevice` to cancel when `setWaitForDevice`

### Changed

-   `setWaitForDevice` with `undefined` can no longer be used to cancel timeouts
    instead one should use `clearWaitForDevice`

## 22 - 2023-03-15

### Changed

-   Update `nrf-device-lib-js` to version 0.6.2.

## 21 - 2023-03-15

### Added

-   `useStopWatch` hook

### Fix

-   `ErrorBoundary` `Button` are now large.

## 20 - 2023-03-14

### Added

-   Steppers component which allows to add states for success, failure and
    warning.

## 19 - 2023-03-13

### Added

-   `ErrorBoundary` use the shared `Button` component

### Changed

-   Update `nrf-device-lib-js` to version 0.6.0.

## 18 - 2023-03-09

### Added

-   FeedbackPane component, to be added in the `Main` entry of a panes entry.
-   Switch to next pane left, in order to navigate both ways.

### Fixed

-   Switch pane hotkey crashed the applications when it was fired.

### Changed

-   Do not resend close() if event that port was closed externally was emitted
-   Add retry to open port on error `PORT_IS_ALREADY_BEING_OPENED`
-   `Button` styles match the UX design guidelines.
-   `Button` has `variant` property to assign it the designated style
-   `Dialogs` use the shared `Button` component
-   `AboutButton` use the shared `Button` component
-   `ShortcutButton` use the shared `Button` component
-   `SupportCard` use the shared `Button` component
-   `FactoryResetButton` use the shared `Button` component
-   `NavMenuItem` use the shared `Button` component
-   `FeedbackPane` use the shared `Button` component

## 17 - 2023-03-08

### Added

-   Allow apps to see if auto-reconnect is enabled.

## 16 - 2023-03-03

### Fixed

-   Selecting a device will no longer stop and start hotplug events
-   Long Serial number and device names will now render correctly

## 15 - 2023-03-03

### Added

-   `Update Bootloader` prompt and `sdfu` programming for it.
-   Reconnecting status in device selector.
-   `setWaitForDevice` can be dispatched by apps to wait for a temporary
    disconnect.
-   During device setup, if device is in bootloader mode and user declines to
    program, device is automatically switched to Application mode

### Fixed

-   Blocking dialog when disconnecting a device when the Programming dialog is
    open.
-   No longer auto reselect to the least disconnected device if is is in the
    device list when clicking the `Auto Reconnect` Toggle.
-   Dispatch `deviceSetupError` when `sdfu` programming fails.

### Changed

-   Device Enumeration is only done once in the app life cycle
-   Only one instance of the hot plug events.
-   `setWaitForDevice` is callback based and this calls that reboot the device
    do not need to be awaited.
-   Update `nrf-device-lib-js` to version 0.5.0.

## 14 - 2023-02-28

### Fixed

-   `MasonryLayout` Update layout more frequently.
-   `MasonryLayout` Hidden items can become visible and not remain hidden for
    the full app life cycle.

## 13 - 2023-02-24

### Fixed

-   Wrongly import of `electron/renderer`, now changed to `electron`.

## 12 - 2023-02-23

### Added

-   `openAppWindow` sends IPC call to launcher, in order to open an app,
    identified by its `name` and `source`. And gives the ability to provide
    `openAppOptions` with `device` and `serialPortPath`, in order to directly
    connect to a device, and its serial port.
-   Optional `className` property on `MasonryLayout`.

### Changed

-   Improved `MasonryLayout` algorithm
-   `MasonryLayout` Items with no height are hidden

## 11 - 2023-02-22

### Changed

-   `shasum` property on apps became optional.

## 10 - 2023-02-16

### Fixed

-   Masonry layout Max height generation algorithm
-   Regression with dropdown items on hover effect

## 9 - 2023-02-16

### Added

-   Masonry Layout

## 8 - 2023-02-15

### Changed

-   Better Redux dev tools configuration: More actions (100 instead of 50) and
    show some more objects, e.g. Maps and Sets.
-   Updated `StartStopButton` to be a controlled component

## 7 - 2023-02-13

### Changed

-   Switched to use only major versions for releases of `shared`.
-   Check for `Changelog.md` entry in `files` in `package.json`. We need it in
    our tarballs and for `npm@7` and later it is not added automatically any
    longer when running `npm pack`.

## 6.18.14 - 2023-02-07

### Changed

-   Readback status is now maintained separate from the device itself.

## 6.18.13 - 2023-02-06

### Fixed

-   `Button` :focus background to white

## 6.18.12 - 2023-02-06

### Changed

-   `Button` font size to 14px

## 6.18.11 - 2023-02-06

### Fixed

-   `Button` remain styled as `click` after key mouse key is released

### Added

-   `large` Property to `Button` to make its height at 32px
-   `large` Property to `StartStopButton` to make its height at 32px

### Changed

-   `StartStopButton` default to large

## 6.18.10 - 2023-02-04

### Added

-   Allow apps to see if selected device has readback protection enabled.

## 6.18.9 - 2023-02-03

### Fixed

-   `SidePanel` bottom margin of the last component

## 6.18.8 - 2023-02-03

### Fixed

-   `persistentStore` logging message of terminal settings, missing `vCom-`
-   Types for bleChannels.

## 6.18.7 - 2023-02-03

### Fixed

-   Programming DFU devices from device selector on macOS.

## 6.18.6 - 2023-02-03

### Fixed

-   `persistentStore` logging to persistent store missing `vCom-`

## 6.18.5 - 2023-02-02

### Changed

-   `PersistedSerialPort` takes app name fom json
-   `TerminalSettings` vCom Index is append with `vCom-` in persist store

## 6.18.4 - 2023-02-01

### Changed

-   Updated `serialport` to emit events and have more than one subscriber
-   Export `DropdownItem`

## 6.18.3 - 2023-02-01

### Fixed

-   Only auto reconnect to device if traits are the same

## 6.18.2 - 2023-02-01

### Fixed

-   No device selected if `serialNumber` is an empty string

## 6.18.1 - 2023-01-30

### Fixed

-   Reloading with verbose logging enabled did not enable verbose logging on
    after restart.

### Removed

-   Hover colour for `Dropdown` and `StartStopButton` components.

## 6.18.0 - 2023-01-26

### Changed

-   Updated nrf-device-lib-js to 0.5.0-pre7.

### Fixed

-   Some types needed by the launcher were not exported.

## 6.17.3 - 2023-01-24

### Fixed

-   When the `dependencies` field in `package.json` is empty (which e.g. can be
    caused by the more recent versions of `npm`), the builds failed.

## 6.17.2 - 2023-01-24

### Fixed

-   `husky install` sometimes was ran even if `shared` was installed only as a
    dependency. That was wrong and also failed, because it found no `.git`
    directory.

## 6.17.1 - 2023-01-19

### Fixed

-   The components `ErrorBoundary` and `Logo` were broken if the Redux state
    wasn't in a supported state.

## 6.17.0 - 2023-01-18

### Added

-   Component `RootErrorDialog` (which is the `ErrorDialog` wrongly removed in
    6.15.0).

### Changed

-   Generate types automatically

## 6.16.0 - 2023-01-17

### Added

-   OnConnect Event when device is connected via USB
-   OnDisconnect Event when device is disconnected via USB
-   Persistent Storage for the last Successful Serial Connection which use the
    Device SN and app name as key
-   Persistent Storage for the last Terminal settings use which use the Device
    SN and vComIndex as key
-   Add toggle to device list for apps to use and enable Auto Reconnect for that
    session
-   Optional auto reconnect to the last connected device for the app runtime
    session

### Fix

-   Event `onDeviceDeselected` not emitted when connecting to new device without
    eject old device

### Changes

-   Do nothing if the same connected device is reselected

## 6.15.3 - 2023-01-13

### Fixed

-   `ConfirmationDialog` confirm button used wrong style.
-   All `Dialog` related types were exported wrongly.

## 6.15.2 - 2023-01-13

### Changed

-   Updated nrf-device-lib-js to 0.5.0-pre4.

## 6.15.1 - 2023-01-13

### Fix

-   `SerialPort` Salt IPC channel with COM port so apps can multiplex data for
    different COMs.

## 6.15.0 - 2023-01-12

### Added

-   `Dialog` component with new style.
-   Shorthand creator functions for generic dialog use cases.

### Removed

-   `ConfirmationDialog` component.
-   Previous `ErrorDialog` component.

### Steps to upgrade when using this package

-   Any use of the `ConfirmationDialog` component has to be replaced with the
    new `Dialog` component or one of it's creator functions.

## 6.14.4 - 2023-01-11

### Changed

-   App check on origin url is more relaxed.

## 6.14.3 - 2023-01-04

### Changed

-   Update electron to 22.0.0

## 6.14.2 - 2023-01-04

### Changed

-   Update device lib to 0.5.0

## 6.14.1 - 2023-01-04

### Fixed

-   Chevron was not visible on a Collapsible Group.

## 6.14.0 - 2023-01-02

### Changed

-   Property `apps` in type `SourceJson` became mandatory.
-   Renamed type `AppJson` to `AppInfo`.
-   Renamed property `latest` to `latestVersion` in type `AppInfo`.
-   Exported type `AppVersions` and renamed property `tarball` to `tarballUrl`.
-   Bumped target for TypeScript to `ES2020`.

## 6.13.2 - 2022-12-19

### Changed

-   Fix imports that were a problem for tests in some apps.

## 6.13.1 - 2022-12-05

### Changed

-   SerialPort is initialized with an `OverwriteOption`, consisting of
    `overwrite` and `settingsLocked`, instead of only `overwrite`. The new
    `settingsLocked` option lets renderers to lock the settings.
-   `onSeparateWrite` is changed into `onDataWritten` and will be the
    recommended way of writing data to any visual terminal. This is because the
    ipc traffic will provide the correct order of what data to write, so that if
    two or more renderers write at the same time, they won't display the data
    differently.

## 6.13.0 - 2022-12-02

### Added

-   Export types `SourceJson` and `AppJson`, describing the structure of the new
    meta data files.

### Changed

-   Specifying a range with explicit values for a `NumberInlineInput` or a
    `Slider` was changed. When you before wrote an `NumberInlineInput` element
    (same applies to a `Slider`) like this:

```jsx
<NumberInlineInput
    values={[4]}
    range={{ min: 3, max: 9, explicitRange: [3, 5, 6, 7, 8, 9] }}
    onChange={[() => {}]}
/>
```

Instead you now have to replace the whole range object with the array and write
it like this:

```jsx
<NumberInlineInput
    values={[4]}
    range={[3, 5, 6, 7, 8, 9]}
    onChange={[() => {}]}
/>
```

It is of course still possible to specify a range without explicit values like
this:

```jsx
<NumberInlineInput
    values={[4]}
    range={{ min: 3, max: 9 }}
    onChange={[() => {}]}
/>
```

### Fixed

-   A `Slider` with ticks but without a defined step displayed the ticks
    wrongly.

### Steps to upgrade when using this package

-   If you are using a `NumberInlineInput` or `Slider` with a range with the
    `explicitRange` property, then you have to replace the whole range with the
    array of the `explicitRange` property, as shown above.

## 6.12.1 - 2022-11-29

### Fixed

-   Building apps with esbuild no longer crashes.

## 6.12.0 - 2022-11-29

### Breaking

-   `Toggle`, `Dropdown` and `StateSelector` are now controlled components only.
    Apps that did not use the `isToggled` or `selectedItem` arguments will have
    to implement this.

### Changed

-   `Toggle` component requires the `isToggled` argument.
-   `Dropdown` component requires `selectedItem` and removed defaultIndex.
-   `StateSelector` component requires `selectedItem` and removed defaultIndex.

## 6.11.3 - 2022-11-29

### Added

-   Building bootstrap on postinstall, letting app bundler pick it up at will.

## 6.11.2 - 2022-11-28

### Added

-   Serialport `on_update`, `on_set`, `on_changed`, `on_write` callbacks.

### Changed

-   Folder structure to have separate `pc-nrfconnect-shared/main`, in order to
    share code with pc-nrfconnect-launcher.

## 6.11.1 - 2022-11-28

### Fixed

-   `scripts/nordic-publish.ts` failed when ran in the release pipeline.
-   Weakened type of `values` property of `Slider` from `number[]` to
    `readonly number[]`.

## 6.11.0 - 2022-11-25

### Added

-   `NumberInlineInput` can opt to have step defined allowing only values that
    are a factor of this step size.
-   `NumberInlineInput` can opt to have explict ranges allowing for split
    ranges.
-   `InlineInput` can opt to have support for up/down keyboard events to control
    the value.
-   `NumberInlineInput` support for up/down keyboard events to control the
    value.
-   `Slider` can opt to have steps defined allowing allowing to increment the
    value with the step size.
-   `Slider` can opt to have explict ranges allowing for split ranges. Ticks are
    not yet supported on this mode.
-   Warn in console if Min and Max are not factors of the optional step size.

### Fixed

-   Esbuild problem when dist folder was missing.

## 6.10.0 - 2022-11-25

### Changed

-   The active button of the `StateSelector` component is now white.
-   `scripts/nordic-publish.js` now also uploads the SVG icon and updates the
    new meta files. Using this will be mandatory for the next launcher release.

### Fixed

-   Esbuild for apps now also works, (only worked on the launcher renderers).

## 6.9.0 - 2022-11-24

### Changed

-   `scripts/nordic-publish.js` is now transpiled and bundled on install, so we
    do not need to commit a transpiled version any longer.

### Added

-   SerialPort wrapper to be used by renderers in order to open and interact
    with port in the main process.
-   Script `check-app-properties` to check that certain static properties of the
    app are given, which we expect from it (e.g. certain fields in
    `package.json` are filled out).

### Changed

-   Replaced webpack with esbuild as a build system. Webpack will be removed
    from shared soon. This change also moves building of fonts and the bootstrap
    framework to the launcher for now. Also, the apps can now load assets and
    other assets locally as the base path of the application is set to the
    application directory.

### Steps to upgrade when using this package

-   If the application uses the SerialPort wrapper, you must bump the `engines`
    field in `package.json` to require at least version `3.13.0` of the
    launcher.
-   Change the entry `"nordic-publish"` in the `scripts` section of
    `package.json` to be `"nordic-publish": "node ./dist/nordic-publish.js"`.
-   Optional housekeeping, because it is not needed anymore: Update the release
    tasks in azure and remove the line `chmod +x ./dist/nordic-publish.js`.
-   For an app, add an entry `"check:app"` to the `scripts` section of
    `package.json`:

```json
{
    "scripts": {
        "check:app": "check-app-properties"
    }
}
```

-   Do the following changes to the scripts section to start using esbuild.

```json
{
    "scripts": {
        "watch": "run-p --silent --continue-on-error watch:*",
        "watch:build": "run-esbuild --watch",
        "watch:types": "tsc --noEmit --pretty --watch --preserveWatchOutput",
        "build:dev": "run-esbuild",
        "build:prod": "run-esbuild --prod"
    }
}
```

-   And remove the following parts.

```json
{
    "scripts": {
        "dev": "webpack watch --mode development",
        "webpack": "webpack build --mode development",
        "build": "webpack build"
    }
}
```

## 6.8.0 - 2022-11-04

### Added

-   Opt-in scroll functionality to the dropdown component if there are more then
    X items in the list.
-   In Dropdown component currently selected `DropdownItem` can now be passed
    using the `selectedItem` property.
-   In StateSelector component can now be passed using the `selectedItem`
    property.

### Fixed

-   Z-Index issue with dropdown select list when it is vertically above a toggle
    component and list is opened.

## 6.7.2 - 2022-11-01

### Fixed

-   Removed type causing type checker errors from the removed app reload
    component.

## 6.7.1 - 2022-10-31

### Fixed

-   Compile error because of missing import in state-selector.scss.

## 6.7.0 - 2022-10-28

### Changed

-   Updated Jest from 27 to 29.

### Steps to upgrade when using this package

-   The new version of Jest might require some changes, check
    https://jestjs.io/docs/28.x/upgrading-to-jest28 and
    https://jestjs.io/docs/upgrading-to-jest29 for this.
-   The new version of Jest simplifies typing mocks, so you might want to update
    code. E.g.
    `(someFunction as jest.MockedFunction<typeof someFunction>).mockReturnValue(42)`
    can be simplified to `jest.mocked(someFunction).mockReturnValue(42)`.

## 6.6.4 - 2022-10-10

### Changed

-   The testutil `dispatchTo` always initially dispatches an initialisation
    action. This resembles more closely what happens in a normal system and
    makes it a tad easier to test the initial state.

### Fixed

-   The exported `errorDialogReducer` was not defined in `index.d.ts`.

## 6.6.3 - 2022-09-26

### Changed

-   Speed up releasing apps a _lot_.

### Steps to upgrade when using this package

-   Change the entry `"nordic-publish"` in the `scripts` section of
    `package.json` to be `"nordic-publish": "./dist/nordic-publish.js"`.
-   Update the release tasks in azure to add the executable bit to the script by
    adding the line `chmod +x ./dist/nordic-publish.js`.
-   Remove the line `npm install` from the release ci task.

## 6.6.2 - 2022-09-14

### Added

-   Babel plugin `@babel/plugin-transform-classes`.

### Removed

-   Support for `pc-ble-driver-js`.

## 6.6.1 - 2022-08-31

### Added

-   Show more information about connected device in About pane if applicable.

## 6.6.0 - 2022-08-24

### Added

-   macOS: Warning for M1 users who does not have JLink Universal version.

### Fixed

-   Windows: Some development scripts were broken if no bash was installed.

### Changed

-   Upgraded husky from
    [4 to 8](https://typicode.github.io/husky/#/?id=migrate-from-v4-to-v8),
    which changes how it is configured.

### Removed

-   Script `scripts/pre-push.sh` to be used by husky.

### Steps to upgrade when using this package

-   Remove `.huskyrc.json`.
-   Add an entry `"prepare": "husky install"` to the `scripts` section of
    `package.json`.
-   After the steps above run
    `npm ci && npx husky add .husky/pre-push 'npm run check && npm t'` to create
    an appropriate pre-push hook.

## 6.5.5 - 2022-08-19

### Fixed

-   Log file was never created.

## 6.5.4 - 2022-08-15

### Changed

-   Updated nrf-device-lib-js to 0.4.8.
-   `getModuleVersions` API changed.

## 6.5.3 - 2022-08-09

### Added

-   `eslint-plugin-testing-library` added as dependency for all applications.

## 6.5.2 - 2022-07-13

### Fixed

-   6.5.1 crashed the launcher with an uncaught TypeError on startup.

## 6.5.1 - 2022-07-13

### Fixed

-   Logging with `logger` during startup may not have written to log file.

## 6.5.0 - 2022-07-12

### Fixed

-   The old API of `useHotKey()` was broken. Now the old and the new API are
    supported. Using the old API just triggers a warning on the console.

### Changed

-   `isLoggingVerbose` is now exported as a normal function instead of a
    selector.

## 6.4.1 - 2022-07-07

### Fixed

-   `sendErrorReport` caused the app to crash if `appJson` was undefined.

## 6.4.0 - 2022-06-30

### Added

-   Add shortcut menu and implement shortcuts
-   `BrokenDeviceDialog` component that shows more info when selecting a device
    with broken traits.
-   Devices with broken trait are listed as unsupported in `DeviceLister`.
-   Export verbose log state selector.

## 6.3.4 - 2022-06-29

### Fixed

-   Reset persisted settings if the app fails to read the file.

## 6.3.3 - 2022-06-23

### Changed

-   Move all devDependencies into dependencies and remove peer dependencies. The
    peer ependencies were use by all apps anyways, so moving them all into
    dependencies will let the apps remove their own version of them.

## 6.3.2 - 2022-06-21

### Fixed

-   macOS: Froze a few seconds after launch (happened in the launcher and apps
    that bundle shared when usage data was enabled).

## 6.3.1 - 2022-05-23

### Fixed

-   Type-checking error when using 6.3.0 in apps.

## 6.3.0 - 2022-05-23

### Fixed

-   Log file was always empty and could not be opened through “Open log file”
    for apps bundling shared.

### Added

-   Collect telemetry on cpu architecture to help determine usefulness of 32-bit
    builds.

### Removed

-   `addFileTransport` from the exported interface of the logger, because it
    should not be called by the launcher any longer.

### Changed

-   Faster startup of apps as less code is loaded on startup.

## 6.2.3 - 2022-05-11

### Changed

-   Enabled `allowExpression` option in `react/jsx-no-useless-fragment` eslint
    rule.

## 6.2.2 - 2022-05-10

### Fixed

-   When the trait `serialPorts` is specified it was wrongly overwritten by the
    `serialPort` (or `serialport`) trait.

## 6.2.1 - 2022-05-10

### Fixed

-   Continue support for the outdated device trait name `serialPort` (besides
    the new, correct `serialPorts`).

## 6.2.0 - 2022-05-10

### Added

-   Website links for the nRF5340 Audio DK (PCA10121).

### Changed

-   Updated nrf-device-lib-js to 0.4.8.

## 6.1.0 - 2022-05-06

### Added

-   Support the nRF5340 Audio DK (PCA10121).
-   Export `ErrorDialogActions` type.

### Changed

-   Reduced startup time of windows apps.
-   Updated several dependencies.

### Removed

-   Obsolete `ErrorDialogAction` type.
-   Obsolete `NrfConnectAction` and other related types.

### Steps to upgrade when using this package

-   Some of the updated dependencies (like `prettier`, `ESLint`, and
    `eslint-config-airbnb`) might lead to failing checks, which would require
    some minor updates.

## 6.0.5 - 2022-05-02

### Fixed

-   Problems with new scripts everywhere.

## 6.0.4 - 2022-05-02

### Fixed

-   Problems with new scripts under Unix.

## 6.0.3 - 2022-05-02

### Fixed

-   Problems with new scripts under Windows.

## 6.0.2 - 2022-04-28

### Changed

-   Update `nrf-device-lib-js` to 0.4.6.

## 6.0.1 - 2022-04-11

### Changed

-   `@types/react@17` became a prod dependency.

## 6.0.0 - 2022-04-11

### Added

-   `Button` component

### Changed

-   Standardise toggle colours.
-   Updated toggle design in footer.
-   Center `About` pane vertically.
-   Type of `getPersistentStore` was changed to match more that from
    electron-store.
-   Bundle shared with the apps.
-   ESlint config file changed to `config/eslintrc.js`.
-   Ignore all entries from `.gitignore` in linting.

### Removed

-   Support for `nrfconnect/core` as mocked or external module.
-   Obsolete `lint-init`.
-   `nrfconnect-scripts`.
-   Plugin `add-module-exports` from babel config because it caused problems
    with the latest version of `electron-store` (or, more concrete, with the
    dependency `atomically` which that pulled in.)
-   Running ESLint during build.

### Steps to upgrade when using this package

-   The device-lib in launcher 3.11 crashes with shared@6, so you must bump the
    `engines` field in `package.json` to require at least version `3.11.1` of
    the launcher.

-   Because this version removed `nrfconnect-scripts`, all invocations of it
    have to be replaced with direct invocations of the corresponding tools. So
    in `package.json` these entries in the `scripts` property should replace the
    previous entries:

```json
{
    "scripts": {
        "dev": "webpack watch --mode development",
        "webpack": "webpack build --mode development",
        "build": "webpack build",
        "test": "jest",
        "check": "run-p --silent --continue-on-error --print-label check:*",
        "check:lint": "eslint --color .",
        "check:types": "check-for-typescript tsc --noEmit --pretty",
        "check:license": "nrfconnect-license check",
        "nordic-publish": "nordic-publish"
    }
}
```

-   A file `webpack.config.js` must be added with this content:

```js
module.exports = require('pc-nrfconnect-shared/config/webpack.config');
```

-   A file `jest.config.js` must be added with this content, unless you want to
    have a special jest configuration:

```js
module.exports = require('pc-nrfconnect-shared/config/jest.config')();
```

-   Because the name of the ESLint config file was changed from `eslintrc.json`
    to `eslintrc.js`, the reference to it needs to be changed in `package.json`
    (The correct extension will be chosen automatically, so you can omit that):

```json
{
    "eslintConfig": {
        "extends": "./node_modules/pc-nrfconnect-shared/config/eslintrc"
    }
}
```

-   The above change renames the script `lint` to `check` (because it does not
    only linting but runs multiple static checks). In `azure-pipelines.yml`
    there are probably still invocations like `npm run lint` and these need to
    be updated to `npm run check`. If there are other references to `lint`, they
    need to be updated too.

-   The scripts require at least Ubuntu 20 in the Azure pipelines. So check
    which image is configured in `azure-pipelines.yml` and if it is still
    `ubuntu-18.04` update that, best to `ubuntu-latest`.

-   The enzyme-to-json serializer was added to the jest config which might
    change some jest snapshots. You might have to run `jest --updateSnapshot` to
    update them.

## 5.18.0 - 2022-03-24

### Removed

-   Automatically selecting a specified device through the environment variable
    `AUTOSELECT_DEVICE`.

### Added

-   Automatically selecting a specified device when it is detected in an app
    through the command line argument `--deviceSerial`. To use this, specify the
    argument behind an additional `--` e.g. by running the launcher with

    ```cli
    npm run app -- --deviceSerial 000680407810
    ```

    the device with the serial number 000680407810 is automatically selected
    when apps see it for the first time. When one deselects the device it is not
    automatically selected again. After restarting the app, the device is
    automatically selected again.

## 5.17.0 - 2022-02-15

### Fixed

-   The system report did not contain the version numbers for the nrfjprog DLL
    and JLink.
-   The error reporter UI didn't handle content overflow when the available
    options were expanded.
-   When the app crashed and the error reporter was displayed, users can
    generate a system report. In that report, the current device was not
    displayed correctly. E.g. with a nRF52 Dongle with the RSSI app on this was
    shown:
    <pre>
    - Current device:
      - name:          undefined
      - serialNumber:  [object Object]
      - cores:         undefined
      - website:       undefined
    </pre>

    After this fix this is correctly shown like this:
    <pre>
    - Current device:
      - name:          nRF52 RSSI Dongle
      - serialNumber:  F31282696FF5
      - cores:         Unknown
      - website:       Unknown
    </pre>

### Added

-   Added version numbers for device-lib and device-lib-js to the system report.
-   Warn if ESLint disable directives (like `eslint-disable` or
    `eslint-disable-next-line`) are used, even though they are not necessary
    (anymore).
-   Inform user if installed JLink version and the provided one do not match.
-   Added `@electron/remote` to replace electron.remote.

### Changed

-   Updated a lot of dependencies.
-   Forbid use of `@ts-ignore`.
-   Use source map in apps in production.
-   Lint also JSON files.
-   Initial `Application data folder` is now logged only at debug level, no
    longer at info.

### Removed

-   Dependency on `immutable`.

### Steps to upgrade when using this package

-   Because JSON files are now linted also, you might need to adapt yours to the
    general style (usually an auto fix).
-   A lot of dependencies were updated, including linting and testing tools. So
    there can be some new warnings or errors when linting, testing, or building.
    Check that after updating to this version.
-   If your project currently uses `@ts-ignore` you have to change something. In
    most cases `@ts-ignore` is used to correct a glitch from another library. At
    least in these cases `@ts-expect-error` should be used instead. If the
    library is corrected, we will then see that we can remove the directive. If
    it is one of the rare cases that you _really_ want to use `@ts-ignore`, you
    can disable the rule `@typescript-eslint/ban-ts-comment` in that spot, but
    please think twice about this.
-   If you still use `immutable` in your project and do not want to change that
    now, then you need to add it to the direct dependencies of your project.

## 5.16.3 - 2022-01-28

### Changed

-   Only propagate device-lib logs while in development.
-   Update nrfdl log formatting.

## 5.16.2 - 2022-01-24

### Fixed

-   Updated nrfdl module version logging according to recent changes in the
    nrfdl api.

## 5.16.1 - 2022-01-19

### Changed

-   Update default nrf-device-lib-js log level to `ERROR`.
-   `Restart with verbose logging` button is now disabled until verbose logging
    is switched on.

### Fixed

-   In some cases nrf-device-lib-js log event callback was registered twice,
    which caused an error message to be logged.

## 5.16.0 - 2022-01-11

### Added

-   Toggle in `About` pane to select minimum nrf-device-lib-js log level (trace
    or warning).

## 5.15.1 - 2022-01-10

### Changed

-   Increased `About` pane card width and bottom margin.

## 5.15.0 - 2022-01-07

### Changed

-   Ignore the `/dist` folder while linting.

### Steps to upgrade when using this package

-   Since the `dist` folder is now ignored during linting, it should be fine to
    tell ESLint to lint _all_ files, by changing the `lint` script in
    `package.json` to `nrfconnect-scripts lint .`. If there is also a `lintfix`
    script or alike, those of course also need to be changed. If there are more
    (e.g. generated) files that need to be ignored during linting, you can
    create
    [a `.eslintignore` file](https://eslint.org/docs/user-guide/configuring/ignoring-code#the-eslintignore-file)
    and add the files to be ignore there in your project.

## 5.14.0 - 2022-01-06

### Changed

-   Allow TypeScript's non null assertion parameter `!` in tests, because there
    it is often ok to use it and have it fail the test if something is
    unexpectedly null.

## 5.13.0 - 2022-01-04

### Changed

-   Markdown files are now linted too.

### Fixed

-   Firmware validation using the wrong function.

### Steps to upgrade when using this package

-   Run `npm run lint -- --fix` once to update the formatting of all markdown
    files and check the changes manually. Make sure, that markdown files are
    linted too, e.g. the entry for the `lint` script in `package.json` should
    contain either `.` or `*.md`.

## 5.12.2 - 2021-12-22

### Fixed

-   Secondary disabled buttons had no border.
-   Crash when opening device details in device lister.
-   macOS: missing margin around `InlineInput` components.

## 5.12.1 - 2021-12-16

### Fixed

-   Device reconnects correctly after flashing dongle.

## 5.12.0 - 2021-12-15

### Added

-   Support for Nordic JLink OB based development kits.

### Changed

-   Updated device lib with various fixes
    [0.4.0](https://github.com/NordicPlayground/nrf-device-lib-js/blob/master/Changelog.md#040---2021-12-15).

## 5.11.1 - 2021-12-14

### Fixed

-   System Report feature now works when no device is selected.
-   System Report feature now displays website formatted correctly.
-   Typing for `RangeProp`.

## 5.11.0 - 2021-12-09

### Added

-   Convenience function to truncate middle parts of strings.

## 5.10.0 - 2021-12-09

### Added

-   Print nRFjprog and JLink version in system report.
-   Print all serialports of connected devices in system report.

### Changed

-   nRF Device Lib versions now printed at info level.

## 5.9.1 - 2021-12-09

### Fixed

-   Mock nrf-device-lib-js function used by testing framework.

## 5.9.0 - 2021-12-07

### Fixed

-   `[Object object]` error message when device enumeration failed.
-   macOS Monterey: There was a warning when creating a system report for the
    first time.

### Added

-   Export `render`, `dispatchTo`, and `rootReducer` as an object `testUtils` to
    aid testing.
-   Export `describeError` to convert any error object to a reasonable string
    representation.

### Changed

-   Move nrf-device-lib-js to dependencies as the exposed types system uses
    types from it.
-   Bump version of nrf-device-lib-js to 0.3.20.

### Steps to upgrade when using this package

-   If your project previously used `@types/react@16.14.4` to fix that nasty
    compatibility problem with react-bootstrap, you now must upgrade
    `@types/react`, best to the latest version.

## 5.8.1 - 2021-11-18

### Fixed

-   Allow selecting device without flashing it if firmware doesn't match.

### Added

-   Function `logError` to ease logging error.

## 5.8.0 - 2021-11-08

### Added

-   Chevron to `DeviceSelector`

## 5.7.0 - 2021-11-08

### Changed

-   Requires now `nrf-device-lib-js` 0.3.18.
-   Increase enumeration timeout to 3 minutes, because according to reports the
    current enumeration timeout can be too short.
-   More detailed logging when enumerating the devices fails.

## 5.6.5 - 2021-11-07

### Fixed

-   Debug log would always claim that engine was not supported.

## 5.6.4 - 2021-11-02

### Changed

-   Make alerts dismissible.

## 5.6.3 - 2021-11-02

### Added

-   Selector `selectedDevice` to retrieve the currently selected device in apps.

### Fixed

-   Correctly selected device when returning to application mode from bootloader
    mode.

## 5.6.2 - 2021-10-29

### Fixed

-   Properties of the main panes (and their children) were frozen by immer.

## 5.6.1 - 2021-10-28

### Fixed

-   Dropdown styling when label prop is used.

## 5.6.0 - 2021-10-28

### Added

-   Stylised scrollbar to `About` pane.

## 5.5.8 - 2021-10-22

### Fixed

-   Wait for device to boot up after being set to bootloader mode.

## 5.5.7 - 2021-10-21

### Changed

-   Outdated styling for disabled elements used in old architecture.

### Fixed

-   Displaying progress percentage for USB SDFU.
-   Firmware validation for Nordic USB device.
-   Loading indicator/disabled buttons for FW installation in progress.

## 5.5.6 - 2021-10-20

### Fixed

-   `DocumentationSection` type validation error.
-   `deviceSetup` type validation error.

## 5.5.5 - 2021-10-15

### Fixed

-   Only one serialport was shown in the Device Selector regardless of how many
    were available.
-   Wrong serialport property was displayed in the Device Selector.
-   Wrong serialport property was displayed in the System Report.

## 5.5.4 - 2021-10-14

### Fixed

-   Export `DocumentationSection` as React component instead of interface.

## 5.5.3 - 2021-10-13

### Added

-   Expose enum values for types in init packet.

## 5.5.2 - 2021-10-13

### Added

-   Expose types for init packet.

## 5.5.1 - 2021-10-13

### Added

-   Expose types for SDFU operations and device lister.

## 5.5.0 - 2021-10-12

### Added

-   Show `no supported devices found` message when all devices were filtered out
    with `deviceFilter`.

## 5.4.0 - 2021-10-07

### Added

-   Property `deviceFilter` on `DeviceSelector` to filter which devices are
    shown.

## 5.3.2 - 2021-10-06

### Fixed

-   Removed the outdated externals `pc-nrfjprog-js`, `usb`, and
    `nrf-device-setup` from the webpack config for apps.
-   Handle trailing slashes in `.gitignore` correctly in
    `bin/nrfconnect-license.mjs`.

## 5.3.1 - 2021-10-05

### Fixed

-   Add ambient module for resolving css modules.

## 5.3.0 - 2021-09-04

### Added

-   Documentation card in About pane.

## 5.2.1 - 2021-10-01

### Added

-   Alert component.

## 5.2.0 - 2021-09-28

### Added

-   Render children of the component `App`. Children of the component `App`
    usually should not render to something that is directly visible on the
    screen, as this would break the normal layout of the app. There are mainly
    two use cases:
    -   Components like dialogs, which are displayed outside of the normal
        render flow.
    -   Components which are displayed not at all, but are rendered just for
        other means, e.g. to dispatch Redux actions when the App is started.

### Changed

-   Enabled two additional ESLint rules:
    -   [`require-await`](https://eslint.org/docs/rules/require-await), to
        disallow async functions which have no await expression.
    -   [`react/jsx-key`](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-key.md),
        to check that a key property is used for lists in JSX.

### Fixed

-   The property `allowCustomDevice` was used but missing in the type and props
    definitions for DeviceSetup.
-   Run complete setup for custom devices.

### Steps to upgrade when using this package

-   The two newly enabled ESLint rules `require-await` and `react/jsx-key` may
    require you to update some code. Please note that you should not blindly
    remove an `async` in front of a function if there is no `await` in it: When
    you have other code which depends on this function returning a Promise (e.g.
    by calling `.then` on the returned object), then you also need to change
    that code.

## 5.1.1 - 2021-09-28

### Added

-   Expose functions for USB serial DFU.

## 5.1.0 - 2021-09-23

### Changed

-   The license check now ignores all files in `.gitignore` and the folder
    `.git`. Before it just ignored `node_modules`, `dist`, and `.git`.

### Fixed

-   With `npm run lint` the license check failed to run for shared on Windows.

## 5.0.1 - 2021-09-17

### Fixed

-   Format of library version from nrf-device-lib-js.
-   Reset not longer need to be called explicitly since it's been fixed in
    nrf-device-lib.
-   API firmwareProgram breaks due to argument type change.

## 5.0.0 - 2021-09-13

### Breaking

-   Require Node.js 14 while building.
-   Require new license and copyright headers: During running `npm run lint` it
    is now checked, that `LICENSE` has the right content for a nRF Connect for
    Desktop program from Nordic Semiconductors and that all source files have
    the short copyright header, which references the license. The license should
    be the same as before, just adding the license identifier.

    There is a new script `nrfconnect-license` which is automatically ran as
    `nrfconnect-license check` during the automated build to check the license
    and headers. It can also be ran as `nrfconnect-license update` to add
    copyright headers to all files which currently either do not have such a
    header at all or have the known old copyright header.

    If there is a comment at the beginning of a file, which is not recognised as
    the known old copyright header, then the script plays it safe and does not
    touch the file. So in these cases (which can also happen if there is an
    ESLint directive) you have to inspect the file manually. The script does
    recognise and preserve a shebang line (one starting with `#!`) at the
    beginning of files. The script also does not touch the file `LICENSE`, you
    are supposed to update that manually.

### Added

-   @nordicsemiconductor/nrf-device-lib-js in dependencies and devDependencies
-   Device lister implemented with nrf-device-lib-js
-   Device setup implemented with nrf-device-lib-js
-   Log the versions of our low level libraries.
-   Component `Dropdown`.

### Changed

-   Run the different checks (ESLint, TypeScript types and correct copyrights)
    during `npm run lint` in parallel. This makes them run faster but especially
    also makes them fail faster, because e.g. a missing copyright header can be
    detected faster than wrong types.
-   Disabled ESLint rule
    [`import/prefer-default-export`](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/prefer-default-export.md).

### Fixed

-   CSS issue where hidden content was scrollable.
-   Correct name of Nordic Thingy:91 in the device selector.

### Steps to upgrade when using this package

-   Remove manual overrides that disable the ESLint rule
    `import/prefer-default-export`.
-   To accommodate for the new Node requirement, make sure you have at least
    Node.js 14 while developing. The `azure-pipelines.yml` may also need to be
    updated.
-   The new license check will probably fail for a lot of source files
    initially.
    -   Run `nrfconnect-license update` to update most of them. Afterwards run
        `nrfconnect-license check` to inspect which still need manual
        inspection. Commit all these copyright changes in a commit together
        without any other changes, to make it easier for other folks to
        understand the commits.
    -   If you do not develop a public nRF Connect for Desktop program from
        Nordic Semiconductors, you might want to turn off the license check. Do
        so by adding `"disableLicenseCheck": false` to `package.json`.

## 4.28.3 - 2021-08-11

### Fixed

-   Correct a typing for devices.

### Changed

-   Exposes deviceInfo.

### Added

-   Component `StateSelector`.
-   Component `StartStopButton`.

## 4.28.2 - 2021-07-19

### Changed

-   Added `@nordicsemiconductor/nrf-device-lib-js` in webpack.config.js.

## 4.28.1 - 2021-06-24

### Changed

-   Increase padding for `Card` component.

## 4.28.0 - 2021-06-21

### Changed

-   Pin the version of prettier to be used to an exact version, as
    [recommended in the prettier documentation](https://prettier.io/docs/en/install.html).

### Steps to upgrade when using this package

-   If you are using an older prettier version than 2.3.0, upgrading to this
    version of shared can likely cause linting to fail due to formatting errors.
    The majority of these can be fixed automatically, by running
    `npm run lint -- --fix`.

## 4.27.3 - 2021-06-21

### Fixed

-   Exported `colors` object was empty.

## 4.27.2 - 2021-06-15

### Fixed

-   GA events were sent even when the user had not consented.
-   `Restore defaults` button styling inside `ErrorBoundary` component was
    broken.

## 4.27.1 - 2021-06-14

### Changed

-   Small change to tooltip background color and opacity.

## 4.27.0 - 2021-06-14

### Changed

-   Use `Card` component introduced in 4.22.0 in the `About` pane.

## 4.26.0 - 2021-06-08

### Changed

-   Upgrade several webpack related dependencies.
-   Upgrade systeminformation, which had a security issue.

### Fixed

-   The system report generated from the about pane only contained
    `[object Promise]`.

### Steps to upgrade when using this package

-   eslint-loader was removed because it is deprecated. If you have a webpack
    config that still uses it, either install it yourself or (better) switch to
    eslint-webpack-plugin.

## 4.25.0 - 2021-06-07

### Fixed

-   Remove namespace pollution by `Card` component, which broke the layout of
    the Toolchain Manager.

### Changed

-   This version enables CSS modules. To use them, the CSS filename needs to
    include `.module.` and you need to import that CSS file and use its content
    in your JSX files as you can see in the `Card` component.

## 4.24.0

### Added

-   Component `FactoryResetButton`. This component is also added to the `About`
    pane.

## 4.23.1

### Changed

-   Allow overriding GA reporting and restore default functionality in
    `ErrorBoundary` component.

## 4.23.0

### Added

-   Error robustness
    -   Added a component `ErrorBoundary` which can be used as an
        [Error Boundary](https://reactjs.org/docs/error-boundaries.html): When
        an error happens inside the enclosed components, users are presented
        with tools for recovery.
    -   Use the `ErrorBoundary` for all apps using the component `App`, so these
        usually do not need to use this error boundary explicitly.

## 4.22.2

### Fixed

-   Type of `Toggle` props were slightly wrong.

## 4.22.1

### Fixed

-   Wrong current pane could crash the app: E.g. when an app previously had four
    panes, it was persisted that the user was previously on the last pane and a
    new release of the app has just a single pane then the app crashes when that
    user opens the app again.

## 4.22.0

### Added

-   Component `Card`.

## 4.21.1

### Fixed

-   Exported colors were missing definitions for `black` and `white`.
-   The build scripts did not return a non-zero exit status on build errors.

## 4.21.0

### Added

-   Property `reportUsageData` to component App.
-   Function `getPersistentStore` to get a persistent store, specific for the
    app. The app name from `package.json` is used to identify the app.

### Steps to upgrade when using this package

-   If your app wants to report usage data, you can remove the code to call
    `usageData.init()` and instead set the property `reportUsageData` to the
    component `App`.
-   If your app already use a persistent store, you can switch to
    `getPersistentStore()`, just be aware that if you currently use a different
    name for the store than the app name from `package.json`, then the old
    settings are either lost of you have to care for migrating them.

## 4.20.0

### Changed

-   Extended type definition `PackageJson`.

### Added

-   Allow different side panels per pane. If a pane should show a special side
    panel it can be defined in the list of panes. If no side panel is defined
    for a pane, the general side panel defined for the whole app is used. E.g.
    in an app defined like the following on the pane Dashboard (and also the
    pane About) the normal `SidePanel` component is shown, while on the pane
    Terminal the `TerminalSidePanel` is shown.

    ```jsx
    <App
      sidePanel={<SidePanel />}
      panes={[
        {
          name: 'Dashboard',
          Main: Dashboard,
        },
        {
          name: 'Terminal',
          Main: Terminal
          SidePanel: TerminalSidePanel,
        },
      ]}
    />
    ```

## 4.19.0

### Added

-   Shared styles can now be imported in SCSS from
    `~pc-nrfconnect-shared/styles`.
-   When users start an app, the pane is opened again, that was open when they
    left the app the last time. Only the about pane is ignored, because we
    assume people are not interested in returning to the about pane.

### Changed

-   Types for the exported colors got more specific.
-   The format for specifying the panes of the app as a property to the `App`
    component has changed. See below for details.

### Steps to upgrade when using this package

-   If you had an import like

    ```scss
    @import '~pc-nrfconnect-shared/src/variables';
    ```

    in your SCSS code before, you should replace it with

    ```scss
    @import '~pc-nrfconnect-shared/styles';
    ```

    because even though for now the code with
    `~pc-nrfconnect-shared/src/variables` will keep on working, it is not part
    of the public API that we try to preserve. Contrary to
    `~pc-nrfconnect-shared/styles`, which is part of the supported API.

-   Previously panes were defined as a pair of pane name and component, like
    this:

    ```js
    panes={[
      ['Dashboard', Dashboard],
      ['Terminal', Terminal],
    ]}
    ```

    This was changed to an array of objects, like this:

    ```js
    panes={[
      { name: 'Dashboard', Main: Dashboard, },
      { name: 'Terminal', Main: Terminal, },
    ]}
    ```

    The old format still is supported but will issue a warning and will be
    removed in the future.

## 4.18.0

### Changed

-   Updated functions in the `usageData` object for sending usage data to Google
    Analytics.

### Steps to upgrade when using this package

-   When you are using `usageData`:
    -   Change the parameter when calling `init`.
    -   Replace calls to `sendEvent` with `sendUsageData`.

## 4.17.3

### Fixed

-   Property `active` was missing in the TypeScript definition of the pane
    components.

## 4.17.2

### Fixed

-   Not defining an app reducer led to an error.

## 4.17.1

### Changed

-   Updated nRF5340 links from PDK to DK.

## 4.17.0

### Added

-   Currently active pane: Selector `currentPane` to query it and action creator
    `setCurrentPane` to change it.

### Fixed

-   When clicking on URLs in log entries the web site was not opened on macOS.

### Changed

-   Add links to product page and distributors for the PPK2.
-   Check stricter order of the imports during linting.

### Steps to upgrade when using this package

-   The stricter check for order of the imports while linting will probably make
    your linting fail after upgrading. So it is recommended to run
    `npm run lint -- --fix` once after updating, checking all the changes (most
    will be ok but there are very seldom cases where order is important like in
    `test/setupTests.js` in this project) and then commit all these small order
    changes.

## 4.16.1

### Fixed

-   The opacity of disabled elements stacked up when they were nested. E.g. in
    the following code the input had the opacity applied twice (making the
    opacity squared), so it looked lighter than than supposed:

    ```html
      <div className="disabled">
        This
        <InlineInput disabled value="doubled">
      </div>
    ```

## 4.16.0

### Added

-   The components `Slider`, `InlineInput` and `NumberInlineInput` now take a
    property `disabled`.
-   All other elements can also be rendered to have a disabled (opaque) look by
    adding the class name `disabled` to them. This does only change the look,
    not their behaviour.
-   A convenience function `classNames` can be used to construct compound class
    names. It filters out all values that are not strings. The idea of this
    function is to use it with conditionals and potentially unset values like
    this:

    ```js
    classNames(
        'fixed-class-name',
        isVisible && 'visible',
        isEnabled ? 'enabled' : 'disabled',
        potentiallyUndefined
    );
    ```

-   Set a property `active` on all rendered panes that is only for the currently
    active `true` and `false` for all others. This can be used to disable
    rendering of expensive components on inactive panes or to trigger effects
    when a pane gets activated or deactivated like this:

    ```js
    useEffect(() => {
        if (active) {
            // do stuff on activation
            return () => {
                // do stuff on deactivation
            };
        }
    }, [active]);
    ```

-   The component `Slider` now takes a property `ticks` to display ticks at all
    possible values. This only looks reasonable if there are just a few possible
    values.

### Changed

-   Adapt the styling of disabled `Sliders` and alike also for the `Toggle`
    component.
-   Components `InlineInput` and `NumberInlineInput` grow and shrink depending
    on their current content.

### Fixed

-   Call the `onChangeComplete` on the component `NumberInlineInput` with the
    current value as a number, not as a string as it was before.

## 4.15.0

### Added

-   New components `SidePanel`, `Group` and `CollapsibleGroup` which one can use
    in an app's implementation of a side panel.
-   New hook `useHotKey` to register a hotkey for an action. It is automatically
    removed when the component is unmounted.

### Changed

-   The default margin at the top and bottom of the side panel is removed.

### Steps to upgrade when using this package

-   When upgrading to this version it is recommended that apps start using the
    new components `SidePanel`, `Group` and `CollapsibleGroup` to implement
    their side panel, which will automatically take care of the removed top and
    bottom margins. If you prefer to implement a side panel without them, then
    you should check whether you add appropriate margins yourself.

## 4.14.4

### Changed

-   Revert change from 4.14.2: Enable `import/no-cycle` ESLint rule again.

## 4.14.3

### Changed

-   Pin `eslint-plugin-import` version.

## 4.14.2

### Changed

-   Disabled `import/no-cycle` ESLint rule.

## 4.14.1

### Fixed

-   Fixed fail to upload Changelog.md to server.

## 4.14.0

### Added

-   Enable automatically selecting a specified device when it is detected in an
    app. To use this, set the environment variable `AUTOSELECT_DEVICE`, e.g. by
    running the launcher with

    ```cli
    AUTOSELECT_DEVICE=000680407810 npm run app
    ```

    the device with the serial number 000680407810 is automatically selected
    when apps using the new architecture see it for the first time. When one
    deselects the device it is not automatically selected again. After
    restarting the app, the device is automatically selected again.

## 4.13.0

### Changed

-   Replaced moment.js with date-fns library.

## 4.12.0

### Added

-   Support title property in Slider and Toggle.

### Changed

-   Enhance lint configuration by specifying it in `package.json`.

## 4.11.0

### Added

-   Added icon for a PPK.

## 4.10.4

### Changed

-   Added `currentPane` field to `appLayout` type.

## 4.10.3

### Changed

-   Added `iface en0` for looking up IP address on macOS.

## 4.10.2

### Changed

-   Added persistent store for usage data settings in `shared` instead of in
    `launcher`.

## 4.10.1

### Changed

-   Updated from v4.9.8 due to breaking changes in 4.10.0.

## 4.10.0

### Added

-   Enable showing an own icon and links on the About pane for USB connected
    devices.

### Steps to upgrade when using this package

-   This version does introduce a first file in `shared` that is converted from
    JavaScript to TypeScript: `deviceInfo`. While most is already prepared for
    that, the `webpack.config.js` in the launcher still needs two adjustments to
    work with this: The lines
    [39](https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/blob/497c1fde51246e1a4fcbc9efbb595d6764a7e056/webpack.config.js#L39)
    and
    [69](https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/blob/497c1fde51246e1a4fcbc9efbb595d6764a7e056/webpack.config.js#L69)
    needs to be changed, so that webpack does not only pick up files with the
    ending `.jsx?` but also `.tsx?`. Apps, on the other hand, do not need to be
    changed for this.

## 4.9.8

### Changed

-   Updated logic to decide which network interface to use to generate client
    id.

## 4.9.7

### Changed

-   Updated how client is generated for usage statistics.

## 4.9.6

### Added

-   Added optional range.decimals to be validated for NumberInlineInput.
-   Updated index.d.ts with rangeShape.

## 4.9.5

### Fixed

-   More type enhancements:
    -   Correct `systemReport` signature.
    -   Limit array types to readonly where possible.
    -   Do not use void as a callback return value.
-   Make linting fail if the type check fails.
-   Remove conflicting ESLint rule 'quotes'.
-   Lint all JavaScript files in this project, not just the ones in src/.

## 4.9.4

### Fixed

-   Fix app's dependencies in webpack config.

## 4.9.3

### Added

-   Added focus-visible dependency and disabled focus styles when clicked.

## 4.9.2

### Fixed

-   Some types.

## 4.9.1

### Fixed

-   Relax ESLint rule regarding @ts-ignore comments.

## 4.9.0

### Added

-   Default `tsconfig.json` for other projects to use.
-   Additional checks during linting:
    -   Check for a `tsconfig.json` if the project uses TypeScript (if there are
        any files with the endings `.ts` or `.tsx`).
    -   Run `tsc --noEmit` if there is a `tsconfig.json` to check the TypeScript
        types.

### Fixed

-   Type error in bleChannels.

### Steps to upgrade when using this package

-   If you want to use the settings from `config/tsconfig.json` in a TypeScript
    project, then put this into a `tsconfig.json` in the root of your project:

    ```json
    {
        "extends": "./node_modules/pc-nrfconnect-shared/config/tsconfig.json"
    }
    ```

    Please note that `tsconfig.json` is _not_ used for the compilation of your
    project. We use the TypeScript transform plugin of babel for compilation and
    [that does not use the settings from `tsconfig.json`](https://babeljs.io/docs/en/next/babel-plugin-transform-typescript.html#caveats).
    But the settings in `tsconfig.json` are useful nonetheless, because they
    respected by many IDEs and editors as well as when you run `tsc`.

    If you want to override any settings from the default `tsconfig.json` you
    are free to do so. We put `strict` on `true` in there because that is what
    we aim for but you may want to relax that a bit when transitioning existing
    projects.

## 4.8.19

### Fixed

-   Version number for 4.8.18 release was wrong in `package.json`.

## 4.8.18

### Changed

-   Added `prettier.config.js` to existing script `npm run lint-init`.

## 4.8.17

### Changed

-   New design, device selector: Add PCA number, better alignment for port
    names, removed wrong line below port names.

## 4.8.16

## Added

-   Added support for files written in TypeScript.
-   Added Prettier formatting.

### Steps to upgrade when using this package

-   Note that apps using this version should add the following entry to their
    `package.json` file:

    ```json
    {
        "prettier": "./node_modules/pc-nrfconnect-shared/config/prettier.config.js"
    }
    ```

    If this isn't added, the Prettier defaults will be used, which differ from
    our style choices in a number of ways.

    On first run, the linting is likely to fail due to the prevalence of
    formatting errors. The majority of these can be fixed automatically, by
    running `npm run lint -- --fix`.

## 4.8.15

### Added

-   Added onChangeComplete to InlineInput and NumberInlineInput.

## 4.8.14

### Fixed

-   Restyle device selector.
-   Fix scrollbars for old apps.

## 4.8.13

### Added

-   Added optional chars prop to define number of characters of NumberInput.
-   Added optional decimals prop to range of Slider.

## 4.8.12

### Fixed

-   Fixed the Toggle components state in case it's controlled from outside.

## 4.8.11

### Fixed

-   Fixed the fix of installation failure in local apps.

## 4.8.10

### Added

-   Added toggle component.

## 4.8.9

### Changed

-   Updated several design elements for the release of the new RSSI app.

### Steps to upgrade when using this package

-   Apps using the new design need to be adapted in areas were a scrollbar might
    be shown. Add a `@include scrollbars(BACKGROUND-COLOUR);` with an
    appropriate replacement for `BACKGROUND-COLOUR` to the fitting selector in
    the SCSS files. When searching for `@include scrollbars` you can find
    [an example for this in the source code of `pc-nrfconnect-shared`](https://github.com/NordicSemiconductor/pc-nrfconnect-shared/blob/cef186fcc4631d6c737ce4c5d299fef53a0ffcc2/src/Device/DeviceSelector/DeviceList/device-list.scss#L7).

## 4.8.8

### Fixed

-   Fixed installation failure in local apps.

## 4.8.7

### Changed

-   Made the device picker, sidepanel, and log UI elements optional.

## 4.8.6

### Changed

-   Updated confirmation dialog style.

## 4.8.5

### Fixed

-   The remote property on the electron mock was noch mocked correctly.

### Changed

-   Render all panes of the App, but only the current is visible.

## 4.8.4

### Added

-   Favorite and nickname in device selector for new design.
-   Exported array bleChannels to provide a list of all BLE channels and some
    convenience properties on it.

### Changed

-   Disabled the ESLint rule `react/require-default-props`.
-   Updated the new design in many details.

### Steps to upgrade when using this package

-   Remove local overrides for the ESLint rule `react/require-default-props` and
    also reconsider using defaultProps when not really needed.

## 4.8.3

### Changed

-   Updated Google Analytics account and set IP as anonymized.

## 4.8.2

### Fixed

-   The mock fix in 4.8.1 broke mocks in another way. 🤦‍♂️

## 4.8.1

### Fixed

-   Added missing mocks for nrf-device-lister and nrf-device-setup to jest
    config.

### Changed

-   Updated dependencies.
-   Removed mocking \*.less files from the jest configuration, as we do not use
    them.

## 4.8

### Changed

-   Create and connect store in App component, so this does not need to be done
    in each app (unless they want to do it themselves).
-   New design for apps using the new app architecture.
-   Update many dependencies.
-   Turned `react`, `react-dom` and `react-redux` into peerDependencies.

### Steps to upgrade when using this package

-   Add `react`, `react-dom` and `react-redux` to your dev dependencies (you can
    omit any you do not strictly need, but most projects need all of them).
    Usually the easiest way to do this is by running
    `npm install --save-dev --save-exact react react-redux react-dom`.
-   The linting rules were slightly strengthened so often some new errors pop up
    there. Many can be auto fixed, so run `npm run lint -- --fix` first and then
    review the changes made as well as the remaining issues.
-   Also run the tests and check whether something needs to be corrected (e.g.
    because jest was updated). E.g. in the BLE app, references to
    `require.requireActual` needed to be corrected to `jest.requireActual`.

## 4.7

### Changed

-   Add a few peer dependencies.

## 4.6

### Added

-   Enable to send user data.

## 4.5

### Added

-   Enable to publish existing artifact instead of packing from source.

## 4.4

-   Update Jest.

## 4.3

### Added

-   Ease configuration of git hooks.

### Steps to upgrade when using this package

-   If you want to automatically run the `lint` and `test` scripts before
    pushing changes, add a file `.huskyrc.json` to your project with this
    content:

    ```json
    {
        "hooks": {
            "pre-push": "bash node_modules/pc-nrfconnect-shared/scripts/pre-push.sh"
        }
    }
    ```

    Remember that in a case of emergency you can do `git push --no-verify` if
    you need to push even though tests might fail.

## 4.2

### Changed

-   Enhanced handling custom devices.
-   Remove dependency of react-infinite.

## 4.1

### Changed

-   Enhanced error dialogs:
    -   Made URLs in error messages clickable (and more generally interpret them
        as markdown).
    -   Made error messages selectable again (regression) to enable copy&pasting
        them.
    -   Enabled custom error resolutions.

## 4.0

### Changed

-   This package was renamed to “pc-nrfconnect-shared”. If you refer to it
    anywhere under the old name (e.g. in a package.json or import a component
    from it) then you must update these references when upgrading to version 4.

## 3.6

### Changed

-   Moved the shared components from core to this project (They can now be used
    by importing “pc-nrfconnect-devdep”).
-   Provide a babel config for apps, instead of requiring them to provide one
    themselves.

## 3.5

### Added

-   Possibility to use the new architecture through “nrfconnect/shared”.

### Changed

-   Updated dependencies.

## 3.4

### Added

-   Internal publishing.

## 3.3

### Added

-   Upload Changelog.md of apps when publishing.

## 3.2

### Changed

-   Switch from node-sass to dart-sass.

## 3.1

### Changed

-   Updated many dependencies.

## 3.0

### Changed

-   Updated dependencies, most notably Bootstrap to 4.

### Added

-   lint-init.
-   electronMock.
