# 🚀 Applications Directory

Aquí residen los puntos de entrada finales del monorepo. Cada subdirectorio representa un producto independiente que puede ser compilado, testeado y desplegado de forma autónoma.

## 📂 Organización por Entorno

Para mantener la claridad en el grafo de dependencias de Turborepo, clasificamos las apps por su target:

- **`/server`**: APIs, Microservicios, Workers (Node.js/Express, Go, etc.).
- **`/web`**: Aplicaciones para el navegador (Vite, Next.js, Astro).
- **`/mobile`**: Aplicaciones nativas o híbridas (React Native, Expo).
- **`/desktop`**: Aplicaciones de escritorio (Tauri, Electron).

## 🛠️ Cómo agregar una nueva App

1. **Crear carpeta:** `mkdir apps/[tipo]/[nombre-app]`.
2. **Inicializar:** `pnpm init` dentro de la carpeta.
3. **Naming Convention:** Usa el prefijo `@apps/` (ej: `@apps/admin-dashboard`).
4. **Vincular Configuración:**
   - Extiende `@config/tsconfig` para el tipado.
   - Agrega `"prettier": "@config/prettier"` en el `package.json`.
   - Si es Web, importa el CSS de `@config/tailwind`.

## 🛑 Reglas de Oro (Arquitectura)

1. **Aislamiento Horizontal:** Las apps **nunca** importan código de otras apps. Si necesitas una función de `apps/server` en `apps/web`, esa lógica debe ser extraída a un paquete en `/packages`.
2. **Validación de Entorno:** Se recomienda usar **Zod** para validar `process.env` en el punto de entrada de cada aplicación para evitar fallos silenciosos en el CI.
3. **Scripts Estandarizados:** Todas las apps deben implementar como mínimo los scripts: `dev`, `build`, `lint` y `type-check`.
