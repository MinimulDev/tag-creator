### Description

Welcome to the Minimul Tag Creator GitHub Action!

### Guide

- A few notes before we get started:

#### Versioning Structure

- We use a custom versioning semantic similar to semver with a <i>slight</i> difference. Rather than MAJOR.MINOR.PATCH
  we use MAJOR.MINOR.PATCH.HOTFIX which gives us quite a bit more power in our CI/CD flow.
- If no hotfix is applied, out of simplicity we omit the .HOTFIX
    - e.g. 0.0.1 =
        ```json
        { "major": 0, "minor": 0, "patch": 1, "hotfix": 0 }
        ```
      and 0.0.0.1 =
        ```json
        { "major": 0, "minor": 0, "patch": 0, "hotfix": 1 }
        ```
- Tags created are marked as pre-release.
- MAJOR updates are considered extreme breaking changes and should be manually created, so Minimul Tag Creator has no
  configuration as such.

#### Branching Structure

- The branching structure is as follows:
    - `feature/some-feature` -> A new feature such as a new UI element, or new business logic.
    - `chore/some-chore` -> A dev chore such as updating existing functionality that isn't a bugfix.
    - `test/some-test` -> Creating/updating a test.
    - `bugfix/some-bugfix` -> A bugfix.
    - `docs/some-docs` -> Updating documentation.
    - `hotfix/some-hotfix` Making hotfix for production failure.
- *When in doubt, make a chore branch.*
- `feature` branches are considered a MINOR update.
- `chore`, `test`, `bugfix`, `docs` branches are considered a PATCH update.
- `hotfix` branches are considered a HOTFIX update.
- Defaults to 'PATCH' update.

### Example

#### Setup

1. Create a new workflow `.github/workflows/main.yml` (quickstart to GitHub Actions can be
   found [here](https://docs.github.com/en/actions/quickstart))
2. Add our action:

The latest release can be found [here](https://github.com/MinimulDev/tag-creator/releases/latest).

```yaml
on:
  pull_request:
    branches:
      - develop
    types: [ closed ]

jobs:
  tag_creation_job:
    if: github.event.pull_request.merged == true # make sure you run on merge completion, not just any closed PR.
    runs-on: ubuntu-latest
    name: tag_creation
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Minimul Tag Creator
        uses: MinimulDev/tag-creator@<latest-release>
        with:
          skip_ci: "false" # Specifies if change to version_file should skip CI, valid values are "true" or "false", defaults to "true".
          skip_ci_commit_string: "[skip ci]" # If skip_ci == true, specifies string appended to commit, defaults to "[ skip ci ]".
          version_file: "version.txt" # Version file to keep track of latest version. (defaults to version.txt).
```

#### Integration

(for this example let's consider you're currently on version `0.0.0`)

1. Create a `feature/some-feature` branch.
2. Push changes upstream.
3. Open PR for `feature/some-feature`.
4. `<insert your CI pipeline here>`.
5. Once ready, merge `feature/some-feature` (can choose any merge strategy you prefer).
6. Minimul Tag Creator with generate a `0.1.0` tag and mark as pre-release.
6. Profit.
    - If this is your first merge with Minimul Tag Creator, you'll see a new file version.txt in your root directory.
      This file can be used for platforms such as Android `versionName` + `versionCode`.