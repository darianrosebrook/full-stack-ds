/// <reference types="vite/client" />

// Side-effect CSS imports (the package style export and the app-shell sheet)
// carry no type declarations on their own; this ambient module makes them
// importable for type-checking. Vite handles the actual asset at build time.
declare module "*.css";
