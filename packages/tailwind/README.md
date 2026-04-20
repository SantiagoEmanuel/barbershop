# @config/tailwindcss

Shared Tailwind CSS configuration for the monorepo. Provides a design token baseline (colors) that all apps can use consistently.

## Exports

| Export        | File       | Use for                        |
| ------------- | ---------- | ------------------------------ |
| `.` (default) | `base.css` | Tailwind v4 CSS-first config   |
| `./legacy`    | `main.ts`  | Tailwind v3 JS config (legacy) |

## Design tokens

### Colors

| Token       | Value                     |
| ----------- | ------------------------- |
| `primary`   | `rgb(54, 154, 241)`       |
| `secondary` | `rgba(84, 87, 87, 0.9)`   |
| `action`    | `rgba(229, 81, 79, 0.92)` |

## Usage with Tailwind v4 (recommended)

Install as a dev dependency:

```json
{
  "devDependencies": {
    "@config/tailwindcss": "workspace:*",
    "tailwindcss": "^4.0.0"
  }
}
```

Import in your main CSS file:

```css
@import "@config/tailwindcss";
@import "tailwindcss";
```

Tokens are then available as utilities:

```html
<div class="bg-primary text-action">...</div>
```

## Usage with Tailwind v3 (legacy)

```js
// tailwind.config.js
import baseConfig from "@config/tailwindcss/legacy";

export default {
  ...baseConfig,
  content: ["./src/**/*.{ts,tsx}"],
};
```

## Customizing tokens per app

Apps can extend the shared tokens without modifying this package:

```css
/* apps/my-app/src/styles/global.css */
@import "@config/tailwindcss";
@import "tailwindcss";

@theme {
  --color-brand: rgb(120, 80, 200); /* app-specific addition */
}
```
