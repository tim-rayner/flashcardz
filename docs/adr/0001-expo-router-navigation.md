# 0001: Adopt expo-router for navigation

## Status

Accepted

## Context

Until now the mobile app had exactly one screen: `App.tsx` rendered
`HomeScreen` directly once the SQLite schema finished initializing. No
navigation library was installed.

The Topic Detail feature needs to push from the topic list on Home to a new
per-topic screen, and further screens (the flashcard game, stats) are already
planned in the README's product requirements. This is the first time the app
needs real navigation: a back stack, a route per topic keyed by its id, and a
place for future screens to attach to.

Three options were considered:

- **expo-router** — file-based routing, Expo's current recommendation.
- **React Navigation (stack)** — same underlying navigator, configured
  imperatively instead of via the filesystem.
- **Manual state in `App.tsx`** — a `currentScreen` state variable switching
  between components, same pattern already used for modal visibility.

Manual state avoids a new dependency but doesn't scale: every future screen
adds more ad-hoc state, and it gives up real back-stack/back-gesture behavior
that a game screen will want. Between the two real navigators, expo-router
was chosen as Expo's current default and because file-based routes give
every future screen a predictable place to live.

## Decision

Add `expo-router` (and its required peers: `react-native-safe-area-context`,
`react-native-screens`, `expo-linking`, `expo-constants`) pinned to the exact
versions Expo SDK 55 bundles (`expo/bundledNativeModules.json`), matching
this repo's existing convention of exact version pins for React-tree-adjacent
packages (avoids dual-copy/version-mismatch bugs in the native RN tree).

`react-native-gesture-handler` and `react-native-reanimated` are peer
dependencies of `expo-router` but are not installed: nothing in this app
uses the Drawer navigator or gesture-driven transitions, and the default
native-stack navigator doesn't require them.

### The `src/app` gotcha

Expo Router auto-detects its routes directory by checking for `src/app`
first, falling back to `app` at the project root
(`@expo/cli`'s `getRouterDirectory`). This repo's Nx-generated Expo app
already has a directory literally named `apps/mobile/src/app/`, but it was
just a conventional home for `App.tsx` — nothing to do with routing.

Once expo-router is installed, **every file in `src/app` becomes a route**
unless it's underscore-prefixed (layout files) or otherwise excluded. This
meant `App.tsx` could not be left in place: it was replaced with
`_layout.tsx` (schema-init gate + root `<Stack>`, ignored as a route by the
underscore prefix) and a thin `index.tsx` that renders `HomeScreen`.

To avoid stray routes, route files under `src/app` are kept as thin
one-line wrappers with no colocated `.spec.tsx` files at all — all real
logic, components, and tests live under `src/features/*` and are simply
rendered by the route file. This applies even to `_layout.tsx`: expo-router
only special-cases the exact filename `_layout` (its extension-stripping
check requires the name to end in `_layout` after removing one extension),
so a colocated `_layout.spec.tsx` would itself be swept up as a real route
(`removeSupportedExtensions` only strips the trailing `.tsx`, leaving
`_layout.spec`, which does not match). Routing behavior (schema-init gate,
Home → Topic Detail navigation) is instead covered by an integration test
at `src/app.spec.tsx` — a sibling of the `app/` directory, so it is never
scanned as a route.

### The Nx `projectRoot` bug (the "Welcome to Expo" incident)

After this feature shipped, running the app showed expo-router's built-in
"Welcome to Expo" tutorial screen instead of Home. That screen is
expo-router's fallback for when it resolves **zero routes** — not a cache
problem (it reproduced with `--clear`).

Root cause: `@nx/expo`'s `withNxMetro` (`apps/mobile/metro.config.js`) sets
Metro's `config.projectRoot` to the *workspace* root, not the app's own
directory, so that `originModulePath` stays workspace-relative (needed for
other SDK 54+ resolution). But `babel-preset-expo`'s router plugin also
reads `projectRoot` off the babel `caller` to turn the routes directory
(`src/app`, resolved relative to *this app's* directory by `@expo/cli`) into
an absolute path, then computes the `require.context` call relative to
wherever `expo-router`'s own file physically sits on disk. With `projectRoot`
forced to the workspace root, that math lands on `<workspace-root>/src/app`
instead of `apps/mobile/src/app` — which doesn't exist, hence zero routes.

Fix: in `metro.config.js`, `projectRoot` is set back to the app's own
directory *after* `withNxMetro` runs. Nx's own module resolution
(`resolveRequest`, `nodeModulesPaths`, `watchFolders`) already reads the
true workspace root via a direct import rather than through the config's
`projectRoot` field, so this only affects the router-root calculation, not
monorepo module resolution. See the comment above the assignment in
`metro.config.js` for the full explanation.

While diagnosing this, a second, unrelated compatibility gap surfaced:
`expo-router/testing-library`'s `expect.js` unconditionally requires
`expect/build/matchers`, a path Jest 30 removed from the `expect` package
(this repo pins `jest: ~30.3.0`). Importing anything from
`expo-router/testing-library` — including just `renderRouter` — crashes
under this repo's Jest version. `src/app.spec.tsx` works around this by
deep-importing the two side-effect-free pieces it actually needs
(`require-context-ponyfill` and `mocks`) instead of the package's top-level
entrypoint, and rendering `ExpoRoot` directly with
`@testing-library/react-native`.

## Consequences

- `apps/mobile/package.json` `main` changes from `index.js` to
  `expo-router/entry`.
- New routes are added by creating files under `src/app` (e.g.
  `src/app/topics/[id].tsx`), not by registering them anywhere else.
- Any future screen must follow the thin-wrapper convention above to avoid
  reintroducing stray routes or route/spec naming collisions.
- `metro.config.js` must keep resetting `projectRoot` to the app directory
  after `withNxMetro`; removing that line silently breaks route discovery
  again (the "Welcome to Expo" screen) with no error in the logs.
- Don't reach for `expo-router/testing-library` in this repo until its
  `expect.js` is compatible with Jest 30's `expect` package layout — use the
  `ExpoRoot` + deep-import pattern in `src/app.spec.tsx` instead.
