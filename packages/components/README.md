# @config/components

Shared UI component library for the monorepo. Built with React 19 and Tailwind CSS v4.

## Requirements

React 19+ and React DOM 19+ must be installed in the consuming app. They are declared as peer dependencies and not bundled.

## Usage

Add as a dependency in any app:

```json
{
  "dependencies": {
    "@config/components": "workspace:*"
  }
}
```

Import components directly:

```tsx
import { Button } from "@config/components";

export default function Page() {
  return <Button>Click me</Button>;
}
```

## Available components

### Button

```tsx
import { Button } from "@config/components";

<Button>Label</Button>;
```

| Prop       | Type        | Description    |
| ---------- | ----------- | -------------- |
| `children` | `ReactNode` | Button content |

## Adding a new component

1. Create the file under `packages/components/UI/`:

```tsx
// packages/components/UI/badge.tsx
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function Badge({ children }: Props) {
  return <span>{children}</span>;
}
```

2. Export it from `packages/components/index.ts`:

```ts
import Badge from "./UI/badge";

export { Button, Badge };
```

## Notes

- This package exports TypeScript source directly (`.ts` / `.tsx`). Consuming apps are expected to use a bundler (Vite, Webpack, etc.) that handles TypeScript transpilation.
- Styles rely on Tailwind CSS v4. The consuming app must have Tailwind configured and import `@config/tailwindcss` or its own Tailwind setup.
