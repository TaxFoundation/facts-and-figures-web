# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Facts and Figures Web displays tables of U.S. state tax data from the Tax Foundation's yearly "Facts and Figures" Excel workbook. It is deployed as an **embedded iframe** on taxfoundation.org via pym.js. It is not a standalone site.

## Commands

```bash
npm install              # Install all workspace dependencies
npm run build-data       # Compile Excel → JSON (must run before dev)
npm start                # Dev server (Vite with HMR)
npm run build            # Full build: build-data + Vite bundle
npm run lint             # ESLint + Prettier check
npm run update-mappings  # Sync mappings.json when Excel structure changes
```

There is no test runner configured yet.

## Architecture

**Monorepo** using npm workspaces with two packages:

### `packages/frontend/` — React 19 + Vite + TypeScript

- `src/App.tsx` — Main component; manages table selection state, renders metadata (title, date, footnotes, source), switches between `StatesTable` (sortable state-level data) and `Table` (generic/bracket tables)
- `src/data/manifest.json` — **Generated file**; index of all tables with title and type, used for table selector
- `src/components/StatesTable.tsx` — Client-side sorting by any column, parses FIPS codes from state data, handles footnote references
- `src/components/ui/` — Small presentational components (Select, Button, SortedHeading, TableHeader, TableRow)
- Styling uses **CSS Modules**

### `packages/scripts/` — Data compilation pipeline (runs via tsx)

- `compileData.ts` — Reads `data/facts-and-figures.xlsx` + `data/mappings.json`, produces per-table JSON + `.xlsx` files in `public/data/` and `src/data/manifest.json`
- `parseStateTable.ts` — Transforms Excel rows into structured `{ headers, values }` with FIPS codes from `data/states.json`
- `writeExcelFiles.ts` — Generates individual downloadable Excel files per table
- `updateMappings.ts` — Updates mappings.json to match new Excel structure

### `data/` — Source data

- `facts-and-figures.xlsx` — The authoritative source workbook
- `mappings.json` — Maps each Excel sheet to cell references for title, date, data range, notes, source, footnotes. See README.md for field documentation.
- `states.json` — FIPS codes, postal codes, abbreviations, full names

## Data Flow

```
data/facts-and-figures.xlsx + data/mappings.json
  → packages/scripts/compileData.ts
  → packages/frontend/src/data/manifest.json (table index for selector)
  → packages/frontend/public/data/table-{1..43}.json (lazy-loaded per table)
  → packages/frontend/public/data/table-{1..43}.xlsx (downloadable)
```

## Annual Update Workflow

1. Replace `data/facts-and-figures.xlsx` with the new year's workbook
2. Run `npm run update-mappings` if sheet structure changed
3. Review/adjust `data/mappings.json` cell references (title, data range, notes, source, footnotes)
4. Run `npm run build-data` — errors indicate mapping mismatches
5. Test with `npm start`

## Code Style

- Prettier: tabs, single quotes, semicolons, 80-char width, arrow parens avoided
- Import sorting via `@trivago/prettier-plugin-sort-imports` (local imports last)
- ESLint: TypeScript strict + stylistic rules, React hooks plugin
- Unused variables must use `_` prefix

## Key Types (`packages/frontend/src/types.ts`)

- `TableEntry` — Each table's metadata + data; `type` is `"states"`, `"table"`, or `"brackets"`
- `StateData` — `{ headers: Header[], values: StateValue[] }` for state-type tables
- `StateValue` — Has `state`, `fips`, optional `footnotes`, plus dynamic keyed data columns

## Deployment

Netlify: builds with `npm run build`, publishes `packages/frontend/dist`. Deployed to `facts-and-figures-web.netlify.com`.
