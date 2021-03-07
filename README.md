### Description

Welcome to the Minimul tag creator GitHub Action.

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

### Example

(for this example let's consider you're currently on version `0.0.0`)

1. Create a `feature/some-feature` branch.
2. Push changes upstream.
3. Open PR for `feature/some-feature`.
4. `<insert your CI pipeline here>`.
5. Once ready, merge `feature/some-feature` <b>(please keep the default merge commit message!!!)</b>.
6. Minimul Tag Creator with generate a `0.1.0` tag and mark as pre-release.
6. Profit.
    - If this is your first merge with Minimul Tag Creator, you'll see a new file version.txt in your root directory.
      This file can be used for platforms such as Android `versionName` + `versionCode`.