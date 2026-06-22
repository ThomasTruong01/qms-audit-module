# Audit Module — QMS

Internal audit management system built in React + Tailwind.

## What's built so far

- **Dashboard** — cycle status, open findings, audit status table, recent findings
- **Master Plan** — expandable rows with clauses tagged to applicable documents, turtle diagram modal
- **TurtleDiagram** — SVG component, auto-expanding boxes, edit toggle, PDF export
- **ClausePicker** — searchable multi-select for AS9100 + ISO 14001 clauses

## Still to build

- Audit Record (findings form, clause columns per standard, sign-off)
- Schedule (internal vs external, date range for external)
- External Audits view

## Setup

```bash
# 1. Create Vite + React project
npm create vite@latest audit-module -- --template react
cd audit-module

# 2. Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3. Configure tailwind.config.js
# content: ['./index.html', './src/**/*.{js,jsx}']

# 4. Add to src/index.css
# @tailwind base;
# @tailwind components;
# @tailwind utilities;

# 5. Copy in the src/ files from this folder

# 6. Run
npm run dev
```

## Audit numbering

Format: `YYYY-C-P`
- YYYY = year
- C = cycle (1 or 2)
- P = process number:
  - 1 = Sales
  - 2 = Purchasing
  - 3 = Warehouse
  - 4 = Production / Tooling / Maintenance / Engineering
  - 5 = Quality Control
  - 6 = Quality Assurance
  - 7 = Top Management

## Data files

- `src/data/processes.js` — all 7 processes with turtle data and clauses
- `src/data/clauses.js` — full AS9100 and ISO 14001 clause list

## Components

| Component | Description |
|-----------|-------------|
| `App.jsx` | Tab navigation shell |
| `Dashboard.jsx` | Year overview, stats, findings |
| `MasterPlan.jsx` | Expandable audit schedule table |
| `TurtleDiagram.jsx` | SVG turtle diagram renderer |
| `TurtleModal.jsx` | Modal wrapper with edit + PDF |
| `ClausePicker.jsx` | Searchable clause multi-select |
