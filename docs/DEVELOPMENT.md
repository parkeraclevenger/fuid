# Development

## Setup

Install Node.js 22.12+ and pnpm 11+, then run:

```bash
pnpm install
pnpm dev
```

## Daily workflow

1. Read the applicable roadmap milestone and architecture decisions.
2. Make the smallest complete change.
3. Add or update content through the catalog rather than hardcoding a page.
4. Run a targeted test while iterating.
5. Run `pnpm check` before handoff.
6. Update documentation and `CHANGELOG.md` when behavior or canon changes.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the local Vite server. |
| `pnpm validate:content` | Load and validate every content entity and reference. |
| `pnpm test` | Run unit tests once. |
| `pnpm test:watch` | Run unit tests in watch mode. |
| `pnpm test:e2e` | Run public and fictional-access smoke tests in desktop and mobile Chromium. |
| `pnpm typecheck` | Check TypeScript without emitting files. |
| `pnpm build` | Create the static production build in `dist/`. |
| `pnpm new:content -- <kind> <slug>` | Create a non-deployed case, department, document-family, discovery, or puzzle draft. |
| `pnpm report:content` | Validate and print archive coverage, references, search size, and puzzle dependencies. |
| `pnpm report:bundle` | Build and print the largest production JavaScript/CSS assets. |
| `pnpm check` | Run the complete local verification gate. |

## Branch and review discipline

Keep commits and reviews aligned with roadmap milestones. Do not combine a content expansion, a new interactive system, and a toolchain upgrade unless one cannot be tested without the others.

## Static deployment boundary

Only Vite's `src/` dependency graph and files deliberately placed in `public/` can enter `dist/`. Never import from `docs/`. Inspect production output before a release that adds restricted, encrypted, or puzzle content.

GitHub Pages automation lives in `.github/workflows/pages.yml`. Pull requests targeting `main` run the complete validation gate. Pushes to `main` install the pinned Node, pnpm, and Playwright Chromium versions, run `pnpm check`, upload the resulting `dist/` directory, and deploy that exact artifact with the official Pages actions. The workflow does not rebuild after verification.

The repository's Pages publishing source must be set to **GitHub Actions**. The deployment job uses the `github-pages` environment, minimal `pages: write` and `id-token: write` permissions, branch-scoped concurrency, and the URL returned by the official deploy action.

The versioned progress service is the sole browser-persistence boundary. Do not write directly to `localStorage` from pages, authentication, discovery, or puzzle features. Add a migration fixture before changing the stored format, and preserve rejection of unknown versions and references.

The production interface is intentionally written in-world. Keep out-of-character framing, security caveats, and solutions in developer documentation; do not import them into `src/`. This does not authorize real credential collection or change the static application's security model.

## Error handling

Content errors are build failures with entity/file context. User-facing missing routes or records receive a useful page and a route back to the public archive. Avoid silent fallbacks that make broken references look like intentional mysteries.
