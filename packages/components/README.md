# @config/components

Librería de componentes UI compartidos del monorepo. React 19 + Tailwind CSS v4.

## Cómo se distribuye

El paquete **exporta el source TypeScript directamente** (`src/index.ts`), sin
paso de build. La app consumidora usa un bundler (Vite) que transpila el TSX y
hace tree-shaking. React y React DOM 19 deben estar instalados en la app
(declarados como `peerDependencies`).

## Uso

1. Agregar la dependencia (ya presente en `apps/web`):

```json
{ "dependencies": { "@config/components": "workspace:*" } }
```

2. Importar los componentes:

```tsx
import { Spinner, SectionHeader, StatCard } from "@config/components";
```

## Tailwind

Los componentes usan los design tokens del tema (`@config/tailwindcss`:
`text-marca`, `bg-surface`, `font-body`, etc.). Como Tailwind v4 ignora
`node_modules` al escanear clases, la app consumidora **debe incluir el source
de este paquete** vía `@source` en su CSS para que esas clases se generen:

```css
@import "tailwindcss";
@source "../../../../packages/components/src";
```

(ver `apps/web/src/css/global.css`).

## Componentes disponibles

`AuthField`, `AuthSubmit`, `BrandLogo`, `Button`, `ConfirmModal`, `EmptyState`,
`Field`, `FieldInput`, `Icon`, `ModalBase`, `PickerTabButton`, `Row`,
`SectionHeader`, `Spinner`, `StatCard`, `UserAvatar` — y el helper `cn`.

## Agregar un componente

1. Crear el archivo en `src/ui/`:

```tsx
// src/ui/badge.tsx
import type { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return <span className="badge-marca">{children}</span>;
}
```

2. Exportarlo desde `src/index.ts`:

```ts
export { Badge } from "./ui/badge";
```

## Notas

- Exporta `.ts`/`.tsx` source: requiere bundler en la app consumidora.
- `verbatimModuleSyntax` está activo: usá `import type` para imports de tipos.
