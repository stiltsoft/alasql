# Publishing @tablefilter/alasql

The npm package name stays `@tablefilter/alasql` after the repository transfer.

1. Prepare changes and the version bump on a feature branch. `yarn release` runs the existing preversion checks and updates the version without publishing, pushing, or creating a release tag.
2. Commit the version change and open a pull request to `develop`. Merge only after another maintainer approves and the required build and Node tests pass.
3. Publish only the reviewed, merged commit. Do not use a local pre-merge tag as a release source.

## Automation migration still required

The existing Publish to NPM workflow uses `NPM_TOKEN`. npm now disallows bypass-2FA tokens for this package, so this PR does not claim that token-based publication works.

Before resuming automated publication, configure an npm trusted publisher for this repository and the exact workflow filename, protect its GitHub Environment with an independent reviewer, and migrate the publishing job to OIDC. An npm maintainer with write access must configure the package-side trust. Do not restore bypass-2FA tokens to make the old workflow work.

No package publication is part of this hardening change. The `base` and `xlsx-mod` packages stay outside the publishing setup.
