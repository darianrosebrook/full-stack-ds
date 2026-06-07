# React Native Settings Example

This example is a React Native consumer fixture for `@full-stack-ds/react-native`.
It verifies that a real RN-shaped application can import the generated package,
compose the settings screen in `src/App.tsx`, and typecheck against React Native
types.

It is not a standalone Metro, Expo, iOS, or Android app yet. There is no
`start`, `ios`, or `android` script in this package today.

## Install

Run from the repository root:

```bash
pnpm install
```

## Regenerate The RN Package

Run this after changing contracts, the React Native emitter, token emission, or
generated RN package files:

```bash
pnpm run generate:react-native
```

## Test The Example

Run the example consumer typecheck from the repository root:

```bash
pnpm run typecheck:example:react-native
```

The full opt-in React Native rail regenerates the RN target, validates the
generated package, runs the package tests, and typechecks this example:

```bash
pnpm run governed:rail:react-native
```

For the package-level checks only:

```bash
pnpm run typecheck:react-native
pnpm --filter @full-stack-ds/react-native run test
```

## Start A Runtime App

There is no runtime startup command in this fixture yet. To exercise the screen
in a real app today, mount `src/App.tsx` from a React Native or Expo host app in
this workspace and keep that host app pointed at the workspace package
`@full-stack-ds/react-native`.

When this fixture grows into a standalone app, add the Metro or Expo scripts to
`package.json` and update this section with the exact commands.
