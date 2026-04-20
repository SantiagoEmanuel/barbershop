# @config/tsconfig

Shared TypeScript configuration files for the monorepo. Every app and package should extend one of these instead of declaring compiler options from scratch.

## Configs

| File          | Extends     | Use for                                         |
| ------------- | ----------- | ----------------------------------------------- |
| `base.json`   | —           | Base for all other configs                      |
| `app.json`    | `base.json` | Apps with a DOM (React, web, Electron renderer) |
| `server.json` | `base.json` | Node.js apps and pure server-side packages      |

## Usage

Install as a dev dependency in any workspace:

```json
{
  "devDependencies": {
    "@config/tsconfig": "workspace:*"
  }
}
```

Then create a `tsconfig.json` in that workspace:

```json
{
  "extends": "@config/tsconfig/app",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

Use `@config/tsconfig/server` for Node.js apps. Use `@config/tsconfig/base` only if you need a fully custom setup and none of the presets fit.

## Compiler options explained

These are the non-obvious options set in `base.json` and why they exist.

### `noUncheckedIndexedAccess`

Accessing `array[0]` returns `T | undefined`, not `T`. Prevents runtime crashes when an index is out of bounds.

```ts
const items = ["a", "b"];
const first = items[0]; // string | undefined  ← forces you to handle this
```

### `noImplicitOverride`

Requires the `override` keyword when a subclass redefines a method from its parent. Without it, renaming the parent method silently orphans the override.

```ts
class Base {
  greet() {}
}

class Child extends Base {
  override greet() {} // ✅ required — TypeScript errors if Base.greet is removed/renamed
}
```

### `exactOptionalPropertyTypes`

Distinguishes between a property being absent and being explicitly `undefined`.

```ts
interface Config {
  timeout?: number; // can be missing — NOT the same as { timeout: undefined }
}
```

Without this option, assigning `undefined` to an optional property passes without error.

### `verbatimModuleSyntax`

Requires type-only imports to use `import type`. Ensures bundlers (Vite, esbuild, SWC) can safely strip imports at compile time without executing side effects.

```ts
import type { User } from "./types"; // ✅
import { User } from "./types"; // ❌ Error if User is only a type
```

### `moduleDetection: "force"`

Treats every file as an ES module, even without `import`/`export`. Prevents TypeScript's "script mode" where all top-level names collide across files.

### `isolatedModules`

Each file must be transpilable independently, without type information from other files. Required for Vite, esbuild, and SWC to work correctly.

### `esModuleInterop: false`

Not needed when using `moduleResolution: Bundler`. Keeping it off avoids synthetic default import helpers and keeps the output cleaner.
