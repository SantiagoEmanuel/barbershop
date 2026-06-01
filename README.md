# Barbershop — reserva de turnos / gestión para barberías

Aplicación web para gestión de turnos, gestiona horarios automáticamente y permite ver a los barberos los ingresos, turnos pendientes, cerrar las ventas y agregar al cierre del servicios productos que vende el local.

🔗 **Proyecto en vivo:** https://pjbarbershop.com.ar

![caputra](./docs/screenshot.png)

## Qué hace

- Gestión automática de horarios por barbero y fecha
- Administra ingresos obtenidos del día/semana/mes
- Gestión de stock para productos

## Stack

- **Frontend:** React · TypeScript · Tailwind CSS v4
- **Backend:** Express · Node · JWT
- **Infra del proyecto:** monorepo con pnpm + TurboRepo, CI con GitHub Actions
- **Calidad:** ESLint, Prettier, Husky + lint-staged, commitlint, changesets
- **Deploy Frontend:** Vercel
- **Deploy Server:** Render

## Decisiones técnicas

Documenté las decisiones de arquitectura en [decisions.md](./decisions.md).

## Arquitectura del monorepo

```
barbershop/
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

## Cómo correrlo localmente

### Requisitos
- Node.js 22+
- pnpm 10+

### Instalación
\`\`\`bash
git clone https://github.com/SantiagoEmanuel/barbershop.git
cd barbershop
pnpm install
pnpm dev
\`\`\`
