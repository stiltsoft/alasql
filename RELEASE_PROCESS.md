# Publishing @tablefilter/alasql

The npm package name remains `@tablefilter/alasql`. Releases are built from
`stiltsoft/alasql`, branch `develop`, using `.github/workflows/publishToNPM.yml`.
GitHub Actions uses npm trusted publishing (OIDC); no `NPM_TOKEN` is needed.

## One-time setup

1. In GitHub, create the `npm-publish` environment. Under deployment branches and
   tags, select **Selected branches and tags** and allow only the **Branch**
   pattern `develop`. Do not use “Protected branches only” while branch protection
   is disabled.
2. In the npm settings for `@tablefilter/alasql`, add a GitHub Actions trusted
   publisher with these exact values:
   - Organization or user: `stiltsoft`
   - Repository: `alasql`
   - Workflow filename: `publishToNPM.yml`
   - Environment name: `npm-publish`
   - **Allow npm publish**: enabled, for direct publication.
3. Keep **Require two-factor authentication and disallow bypass 2fa tokens**
   enabled. Trusted publishing is compatible with this setting.

The initial environment has no required reviewer. Anyone able to change
`develop` and run this workflow can affect a release. Restore branch protection
and add independent release approval as the follow-up hardening work.

## Prepare and verify a release

1. Merge the intended fixes and the publishing workflow into `develop`.
2. Check `package.json`: keep the package name and repository URL; set the intended
   new version. The currently prepared version is `4.5.3-6`.
   `yarn release` changes the version after its existing build/test checks; it no
   longer publishes, pushes, or creates a Git tag. Commit and review the change.
3. Open GitHub Actions → **Publish to NPM** → **Run workflow**. Select `develop`,
   enter the exact package version, and leave **Publish the checked package to npm
   as latest** unchecked.
4. Confirm **Build and test** and **Pack and check release contents** succeed.
   The first job installs dependencies from `yarn.lock`, builds, runs the tests,
   checks the package identity, and uploads `dist`. The packaging job checks out
   a fresh workspace and downloads that artifact without a `path` override, so
   the build files land in the package root. It checks the required files and
   uploads the exact `.tgz` as the `npm-package` artifact.

The archive layout stays compatible with `4.5.3-5`: `alasql.fs.js`, `alasql.js`,
`alasql.min.js`, the worker/plugins and `alasql.d.ts` are in the package root.
There is no top-level `dist/` directory. The existing `main` and `browser` values
still point into `dist/`; this known metadata mismatch is deliberately preserved
for this release and must be addressed separately after checking consumers.
Release checks validate the actual root-level files, not those two metadata paths.

This verification run does not publish anything and does not validate the OIDC
exchange. `npm whoami` and `npm publish --dry-run` cannot prove the trust works.

## Publish

1. Check that `develop` still points to the intended commit and that the version
   has not already been published.
2. Run the same workflow on `develop`, with the exact version and the publish
   checkbox enabled. This run rebuilds and retests its selected commit, then
   publishes that run's checked archive from the `npm-publish` environment.
3. Verify the publish job succeeds and inspect the npm package's version,
   `latest` dist-tag and provenance. The workflow explicitly uses `--tag latest`,
   including for versions such as `4.5.3-6`.
4. Create any Git tag or GitHub release against the successful run's commit.
   Creating a GitHub release does not trigger another npm publication.

Published versions cannot be overwritten. If publishing fails, inspect the npm
registry before retrying; do not assume a failed job means no version was stored.
After the first successful OIDC publication, remove the expired npm token from
GitHub secrets if it is still present.

References: [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)
and [GitHub environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments).
