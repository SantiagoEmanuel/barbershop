# @config/prettier

Shared Prettier configuration for the monorepo.

## Rules

| Option        | Value                                                             |
| ------------- | ----------------------------------------------------------------- |
| `printWidth`  | 80                                                                |
| `tabWidth`    | 2                                                                 |
| `semi`        | true                                                              |
| `singleQuote` | false                                                             |
| Plugins       | `prettier-plugin-organize-imports`, `prettier-plugin-tailwindcss` |

`prettier-plugin-organize-imports` — automatically sorts and deduplicates imports on save.  
`prettier-plugin-tailwindcss` — sorts Tailwind class names according to the recommended order.

## Usage

The root `package.json` already consumes this config. If you need to reference it explicitly from a workspace:

```json
{
  "devDependencies": {
    "@config/prettier": "workspace:*"
  }
}
```

```js
// prettier.config.js
import config from "@config/prettier";
export default config;
```

## Checking format

```bash
pnpm format:check
```

Prettier is also run automatically on staged files via the pre-commit hook (Husky + lint-staged). No manual step needed during normal development.
