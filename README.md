# TypeScript Monorepo Template

A minimal, opinionated monorepo template for TypeScript projects. Framework-agnostic — works with React, Node.js, Electron, or any TypeScript-based stack.

## Stack

| Tool                                                                                                   | Role                                       |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| [pnpm](https://pnpm.io/)                                                                               | Package manager & workspace orchestration  |
| [TurboRepo](https://turbo.build/)                                                                      | Task runner with caching                   |
| [TypeScript](https://www.typescriptlang.org/)                                                          | Language                                   |
| [ESLint](https://eslint.org/)                                                                          | Linting (flat config)                      |
| [Prettier](https://prettier.io/)                                                                       | Formatting                                 |
| [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/lint-staged/lint-staged) | Pre-commit hooks                           |
| [Tailwind CSS v4](https://tailwindcss.com/)                                                            | Styling (optional, shared config included) |

## Repository structure

```
monorepo/
├── apps/                    # Applications (add yours here)
│   └── ...
├── packages/
│   ├── components/          # Shared UI components (@config/components)
│   ├── prettier/            # Shared Prettier config (@config/prettier)
│   ├── tailwind/            # Shared Tailwind config (@config/tailwindcss)
│   └── tsconfig/            # Shared TypeScript configs (@config/tsconfig)
├── eslint.config.js         # Root ESLint config (flat config)
├── turbo.json               # TurboRepo task definitions
├── pnpm-workspace.yaml      # Workspace declarations
└── package.json
```

## Getting started

### Prerequisites

- Node.js 22+
- pnpm 10+

### Install

```bash
git clone <repo-url>
cd monorepo
pnpm install
```

### Run tasks

```bash
pnpm dev          # Start all apps in watch mode
pnpm build        # Build all packages and apps
pnpm lint         # Lint everything
pnpm type-check   # Type-check everything
```

## Adding a new app

1. Create the directory under `apps/`:

```bash
  mkdir apps/my-app
```

2. Initialize `package.json`:

```json
{
  "name": "my-app",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "...",
    "build": "...",
    "lint": "eslint .",
    "type-check": "tsc --noEmit"
  }
}
```

3. Add a `tsconfig.json` extending the appropriate base (see [TypeScript config](./packages/tsconfig/README.md)):

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

4. Add `@config/tsconfig` as a dev dependency:

```json
{
  "devDependencies": {
    "@config/tsconfig": "workspace:*"
  }
}
```

5. Run `pnpm install` from the root.

## Adding a new shared package

1. Create the directory under `packages/`:

```bash
mkdir packages/my-package
```

2. Initialize `package.json` with a `@config/` name prefix:

```json
{
  "name": "@config/my-package",
  "version": "0.0.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

3. Reference it from any app or package via `"@config/my-package": "workspace:*"`.

## CI

The GitHub Actions pipeline runs on every push and pull request to `main`:

1. Checkout
2. Install pnpm
3. Setup Node.js 22 with pnpm cache
4. `pnpm install --frozen-lockfile`
5. `pnpm turbo run build lint type-check`

See [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

## Packages

- [`@config/tsconfig`](./packages/tsconfig/README.md) — TypeScript configs
- [`@config/components`](./packages/components/README.md) — Shared UI components
- [`@config/prettier`](./packages/prettier/README.md) — Prettier config
- [`@config/tailwindcss`](./packages/tailwind/README.md) — Tailwind CSS config
