# Shared commodities for developing nRF Connect for Desktop

[![Build Status](https://dev.azure.com/NordicSemiconductor/Wayland/_apis/build/status/pc-nrfconnect-shared?branchName=master)](https://dev.azure.com/NordicSemiconductor/Wayland/_build/latest?definitionId=31&branchName=master)

This project provides shared commodities for developing nRF Connect for Desktop
apps and their launcher:

-   React components
-   Build scripts
-   Configurations
-   Test facilities

## Releasing

This project uses GitHub Actions for automated releases. To release a new
version:

### Prepare the release

-   Update the version in `package.json`.
-   Add a changelog entry in `Changelog.md` with the format:
    `## X.0.0 - YYYY-MM-DD`.
-   Commit and push your changes

### Create the release

-   Go to the the
    [Release shared](https://github.com/NordicSemiconductor/pc-nrfconnect-shared/actions/workflows/release-shared.yml)
    action.
-   Click "Run workflow".
-   Optionally select a ref to release, but usually this should be `main` and
    can be left empty.

The workflow will:

-   Check if a release is possible.
-   Build and test the package.
-   Create a GitHub release.
-   Publish to npm.
