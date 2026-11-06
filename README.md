# FUID — Federal Unexplained Investigative Division

FUID is a browser-based interactive mystery presented as the public archive of a fictional United States federal agency. It is designed to grow through structured investigations and documents without turning each new record into a frontend feature.

> FUID is a work of fiction and is not affiliated with the United States government or any real agency.

## Current status

Milestones 7 and 8 expand the archive and establish a measured authoring/performance workflow on top of the durable progress and puzzle foundation:

- a responsive public agency shell;
- a homepage;
- a public investigations index;
- seven schema-validated investigations and twenty-seven related documents;
- distinct field-report and memorandum presentations;
- public search with explicit index visibility and record-type filtering;
- an employee sign-in with progressive credential hints, centralized access checks, and an internal records console;
- seven controlled records across six investigations that are excluded from public listings and search;
- a versioned local profile that preserves sign-in, reviewed records, correlations, grants, and solved index tasks;
- validated progress export/import with a supported migration fixture;
- five cross-record analyst correlations and one Harrow Station index-recovery puzzle;
- the Bellglass Orchard Visitor and Morrow Cut Choir investigations, each with three public records and a controlled escalation;
- GitHub Pages-safe routing;
- safe content-draft templates for cases, document families, discoveries, and puzzles;
- author-facing reference, puzzle-dependency, search-size, and production-asset reports;
- route-level loading and cacheable vendor, validation, and archive-data chunks;
- content, helper, desktop-browser, and mobile-browser tests.

Progress is stored in one versioned browser-local profile and may be exported or imported from Employee Resources. The puzzle engine intentionally supports only the authored index-recovery shape proven by the current Harrow flow. See `docs/ROADMAP.md`.

## Requirements

- Node.js 22.12 or later (Node 24 is recommended)
- pnpm 11 or later

## Local development

```bash
pnpm install
pnpm dev
```

The development server prints its local URL. Production and verification commands:

```bash
pnpm validate:content
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
pnpm report:content
pnpm report:bundle
pnpm check
```

Create a non-deployed content draft with:

```bash
pnpm new:content -- document example-record
pnpm new:content -- memorandum example-memorandum
pnpm new:content -- controlled-document example-annex
```

Complete the generated `.draft.json`, rename it to `.json`, then validate it.

The static production output is written to `dist/`.

## Project map

```text
src/
  app/          routing and application composition
  components/   shared presentational components
  content/      authoritative deployable content and schemas
  features/     user-facing feature slices
  styles/       global design tokens and public-site styling
docs/           developer-only architecture, continuity, and plans
scripts/        authoring and validation entry points
```

Start with `docs/ARCHITECTURE.md` for technical decisions and `docs/CONTENT_GUIDE.md` before adding records. Coding agents must also follow `AGENTS.md`.

## Hosting

The app is static and uses hash routing plus relative asset URLs, so it works under a GitHub Pages repository subpath and survives direct navigation/refresh without a server rewrite.

`.github/workflows/pages.yml` validates every pull request targeting `main`. A push to `main` installs the pinned toolchain, runs the complete test/build/browser gate, uploads the tested `dist/` directory, and deploys that exact artifact through GitHub Pages. In the repository settings, Pages must use **GitHub Actions** as its publishing source.
