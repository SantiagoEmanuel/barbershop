# Architecture decisions

Lightweight record of the key decisions made in this template and why. Useful context when extending or adapting it.

---

## Why pnpm?

pnpm uses a content-addressable store and hard links, which means dependencies are not duplicated across workspaces. Workspace installs are significantly faster than npm or Yarn in monorepo scenarios. The `workspace:*` protocol makes internal cross-package references explicit and resolves them without publishing.

## Why TurboRepo?

TurboRepo understands the dependency graph between tasks across packages and parallelizes work accordingly. It caches task outputs (build artifacts, lint results) locally and optionally remotely, so unchanged packages are never reprocessed. The `dependsOn: ["^build"]` pattern ensures packages always build before their dependents.

## Why flat ESLint config?

The legacy `.eslintrc` format is deprecated as of ESLint v9. The flat config (`eslint.config.js`) is explicit about which files each rule set applies to, has no implicit cascading, and is easier to reason about in a monorepo with mixed environments (React apps, Node servers).

## Why ESLint at the root and not per package?

For a template, a single root config is easier to maintain and understand. The config already scopes rules by path (`apps/web/**`, `apps/server/**`), so per-package configs would add files without adding expressiveness. If a package genuinely needs diverging rules, an override in the root config is the right approach before extracting.

## Why is `verbatimModuleSyntax` enabled?

Modern bundlers (Vite, esbuild, SWC) strip imports based on syntax alone — they don't run the TypeScript type checker. Without `verbatimModuleSyntax`, a value import used only as a type silently disappears at runtime if the bundler decides to elide it. Forcing `import type` syntax makes the intent explicit and eliminates this class of bug.

## Why does `packages/components` export `.ts` source instead of compiled `.js`?

Consuming apps use bundlers that handle TypeScript natively. Distributing source means the consuming bundler can tree-shake, inline, and optimize components alongside app code. It also avoids a build step in the package itself, keeping the dev loop fast. The tradeoff is that this package cannot be published to npm as-is — a build step would need to be added first.

## Why Tailwind v4 with a CSS-first config?

Tailwind v4 removes the JavaScript config file as the primary interface in favor of CSS `@theme` directives. This is simpler to share across packages (a CSS file is easy to `@import`) and avoids the boilerplate of a `tailwind.config.js` in every app. The legacy JS config (`./legacy` export) is kept for compatibility if a workspace still uses v3.

## Why no `packages/eslint`?

The ESLint config lives at the root because it already covers all workspaces through path-based scoping. Extracting it to a package would require each workspace to install it as a dependency, declare an `eslint.config.js`, and re-export it — adding ceremony without benefit at this scale. Revisit if the project grows to the point where workspaces have meaningfully diverging linting needs.

## Why Changesets for versioning?

Even though we don't publish to npm, Changesets provides a formal process for tracking changes across the monorepo. It solves the "what changed where" problem by generating per-package changelogs. It prevents the cognitive overhead of manual versioning and ensures that Git tags reflect the actual state of each application.

## Why app categorization by type?

In this template, apps are grouped by runtime environment (web, server, mobile) rather than business domain. This makes it easier to apply global infrastructure changes (e.g., updating all Web apps to a new Vite version) and simplifies the CI/CD pipeline configuration, as apps in the same category often share deployment logic.

## Why "Zero Cross-App Imports"?

To maintain a clean dependency graph and ensure fast caching in TurboRepo, we strictly forbid apps from importing from each other. This forces a healthy architecture where shared logic is explicitly promoted to a package in `/packages`, ensuring that changes in one app never side-effect another app directly.
