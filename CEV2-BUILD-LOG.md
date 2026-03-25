# CEV2 — Build Log & Context File

**Project:** CEV2 — MIL-DTL-38999 Motorsport Connector Spec Engine
**Repo:** https://github.com/paapatype/CEV2
**Live:** https://paapatype.github.io/CEV2/
**Working directory:** /Users/paapatype/Desktop/GD4/CEV2/
**Last updated:** 2026-03-25

---

## What CEV2 Does

An engineer inputs their wiring requirements (wire groups with count, current, gauge) and the engine returns ranked connector options with full assembly details — replacing the 5–8 minute manual process of flipping between Souriau and Deutsch catalog pages.

Two modes:
1. **New Connector Selection** — input wire groups, get ranked layout matches
2. **I Have an Existing Connector** — select a connector, find cross-manufacturer equivalents

Validated by Sarthak, F1 harness engineer at Red Bull Racing.

---

## Architecture

```
CEV2/
├── connector_database.js    ← 89 Souriau + 56 Deutsch layouts, specs, dims, accessories
├── spec_engine.js           ← matching + cross-reference engine (pure functions, no UI)
├── package.json             ← Vite + React 19
├── vite.config.js           ← base: '/CEV2/' for GitHub Pages
├── index.html               ← Outfit + JetBrains Mono fonts
├── src/
│   ├── main.jsx
│   ├── index.css            ← full design system (dark Swiss editorial)
│   ├── App.jsx              ← state management, mode tabs
│   └── components/
│       ├── InputPanel.jsx   ← wire group table (desktop) / cards (mobile)
│       ├── ResultsTable.jsx ← ranked results + custom scroll tracks
│       ├── DetailView.jsx   ← expanded detail with gauge cards + assembly BOM
│       └── CrossReference.jsx ← cross-manufacturer matching UI
├── IndexArch-Motorsport-SpecEngine-FullContext-v2.md  ← master spec doc
└── *.pdf                    ← Souriau 8STA 2025 + Deutsch AS 09/2022 catalogs
```

---

## Database (connector_database.js)

### CONTACT_SPECS (11 sizes)
| Contact | Souriau A | Deutsch A | AWG Range | Manufacturer |
|---------|-----------|-----------|-----------|--------------|
| #26 | 3 | — | 24–30 | Souriau only |
| #24 | — | 3 | 24–30 | Deutsch only |
| #23 | — | 3 | 22–28 | Deutsch only |
| #22D | 5 | — | 22–28 | Souriau |
| #22 | — | 5 | 22–26 | Deutsch |
| #20 | 7.5 | 7.5 | 20–24 | Both |
| #16 | 13 | 20 | 16–20 | Both |
| #12 | 23 | — | 12–14 | Souriau only |
| #8 | 45 | — | 8 | Souriau only |
| #4 | 80 | — | mm² based | Souriau only |
| AWG4 | — | 200 | — | Deutsch only |

**Current rating note:** Souriau catalog rates more conservatively than MIL-DTL-38999. Engine uses catalog values per Sarthak's guidance.

### SOURIAU_LAYOUTS (89 entries)
Shell sizes 01–24. Each entry: shell_size, layout_number, contacts map, total_contacts, service_class, types array (S/HD/H/C/F/P).

### DEUTSCH_LAYOUTS (56 entries)
Families: ASX (3), ASU (2), ASL (2 incl 952K fuel variant), ASR (1), ASC (1), AS Mini (2), AS Series 08–24 (27), ASDD (8), ASHD (4), AS07PT (6).

### Also exports:
- SHELL_DIMENSIONS — per shell size per manufacturer
- ACCESSORIES — nut plates, gaskets, caps, filler plugs, boots (Souriau); nut plates, gaskets (Deutsch)
- KEYWAYS — 7 options (N/A/B/C/D/E/U) with color codes and per-manufacturer availability
- CROSS_REFERENCE — contact mapping, interchangeable shells, manufacturer-specific shells
- SERVICE_CLASSES — voltage ratings (display only, no engine logic)
- ORIENTATION_ANGLES — keyway angles for Souriau sizes 08–24

---

## Engine (spec_engine.js)

### Exports

**mapWireGroupToContactSize(currentA, gaugeAWG, brand)**
- Maps current → minimum contact size using catalog ratings
- Verifies wire gauge fits in terminal (awg_min ≤ gauge ≤ awg_max)
- If gauge too thick → bumps up to next larger contact
- If gauge too thin → returns warning
- Standard order starts from #22D (Souriau) / #22 (Deutsch) — #26/#24/#23 are specialty HD/micro contacts excluded from default selection

**findMatchingLayouts(requiredContacts, brand, fuelImmersible)**
- Takes requirement like { "#22D": 8, "#8": 2 }
- Searches Souriau and/or Deutsch layouts
- Cross-brand: translates #22D↔#22, #26↔#24
- Fuel-immersible: filters to layouts with F flag or fuel_immersible property

**rankResults(matches)**
- Sort: fewest spares → smallest shell → Souriau first
- Tags: "Exact fit" (0 spares), "Room to grow" (1–4), "Oversized" (5+)

**processWireGroups(wireGroups, brand, fuelImmersible)**
- Main entry point. Takes array of { name, count, currentA, gaugeAWG }
- Calls map → aggregate → find → rank
- Returns { wire_groups, required_contacts, results, result_count, has_warnings, has_errors }

**crossReference(sourceBrand, shellSize, layoutNumber)**
- Finds matches in the other manufacturer's catalog
- Returns: { source, translated_contacts, exact, near, unmatchable, notes }
- Exact match: same shell + layout number, contacts match after translation
- Near match: layout satisfies translated requirement with spares
- Unmatchable: contact sizes with no equivalent (#12, #8, #4 Souriau-only; #23, #24 Deutsch-only)

### Key design decisions
- Contact order starts from #22D/#22, not #26/#24 (specialty HD/micro excluded from default)
- Uses manufacturer catalog current ratings, not MIL-DTL-38999 standard values
- Deutsch AS 18-32 corrected to 32×#20 (doc had typo of 52)
- 10-43 layout flagged as needing verification (not found in PDF, may be doc error)

---

## UI Design

### Design system tokens
- **Spacing:** 8px grid — 4/8/12/16/24/32/48/64
- **Radius:** 6px inputs, 8px buttons/cards, 12px panels, 9999px pills
- **Typography:** Outfit (UI) + JetBrains Mono (data)
- **Type scale:** 11/12/13/14/15/16/18/20/24
- **Surfaces:** 5-step elevation: base #0c0c0e → surface #151517 → elevated #1c1c1f → hover #242428 → active #2c2c30
- **Borders:** 3-tier opacity: subtle 6% / default 10% / strong 16%
- **Text:** primary #f0f0f2 → secondary #a0a0a8 → muted #606068 → disabled #404048

### Components
- **InputPanel** — desktop: table layout; mobile: stacked cards with centered labels above each input
- **ResultsTable** — ranked table with custom draggable scroll tracks (top + bottom), RAF-polled for reliable mobile tracking
- **DetailView** — gauge compatibility as cards (colored left border), part number builder, keyways with color dots, variant badges, BOM grid, catalog page refs
- **CrossReference** — cascading dropdowns (manufacturer → shell → layout), source specs, exact/near/no match results

### Mobile (≤768px)
- Base font: 15px
- Inputs: 48px height, 16px font (prevents iOS zoom)
- Buttons: 52px Find, 48px Add (both full-width)
- Wire groups: card layout with 3-column grid (count/current/gauge) centered labels
- Results table: horizontal scroll with custom draggable scroll track bars above and below
- Detail view: single column, gauge cards 16px text, values 16–20px, badges 36px height

---

## Cross-Reference Logic

### Contact equivalences
| Souriau | Deutsch | Notes |
|---------|---------|-------|
| #22D | #22 | Same current (5A). Souriau wider AWG (22–28 vs 22–26) |
| #26 | #24 | Same current (3A), same AWG (24–30) |
| #20 | #20 | Identical |
| #16 | #16 | Same size, different ratings (13A vs 20A) |
| #12 | — | Souriau only |
| #8 | — | Souriau only |
| #4 | AWG4 (ASHD) | Different families |

### Interchangeable shells
08, 10, 12, 14, 16, 18, 20, 22, 24 — same MIL-DTL-38999 insert, same panel cutout, same keyway colors cross-mate.

### Souriau-only shells: 01, 02, 04, 06
### Deutsch-only shells: 03 (ASU), 05 (ASC), 07 (Mini)

---

## Verified Test Cases

1. **Sarthak scenario:** 3 wires, 24 AWG, 0.5A, Souriau → maps to #22D → 04-35 appears (5×#22D, 2 spares, "Room to grow")
2. **Mixed power+signal:** 8× signal 24AWG 3A + 2× power 16AWG 10A → requires 8×#22D + 2×#16 → finds layouts with both
3. **Cross-brand:** 3× #22D requirement → finds both Souriau and Deutsch (translated to #22) results
4. **Fuel-immersible:** 6×#22D → correctly filters to 4 fuel-rated layouts
5. **Gauge bump:** 20 AWG wire at 3A → #22D can't accept (too thick) → bumps to #20
6. **Gauge warning:** 30 AWG at 4A → #22D flags too thin
7. **Xref exact:** Deutsch AS 12-35 (22×#22) → Souriau 12-35 (22×#22D) exact match
8. **Xref no match:** Souriau 16-02 (38×#22D + 1×#8) → no Deutsch exact (flags #8 unmatchable), 5 near alternatives

---

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build → dist/
npm run preview      # Preview production build
node spec_engine.js  # Run engine tests in terminal
npx gh-pages -d dist # Deploy to GitHub Pages
```

---

## Data Discrepancies Found

1. **Layout count:** Doc claims 93 Souriau + 54 Deutsch = 147. Actual from doc tables: 89 + 56 = 145. The 4 missing Souriau entries could not be found in the PDF.
2. **10-43 layout:** Listed in doc under Shell 10 but not visually confirmed in PDF pages 6-7. Only 12-43 confirmed. Flagged with note.
3. **Deutsch AS 18-32:** Doc listed 52×#20 but corrected to 32×#20 (matches Souriau 18-32, 52 exceeds shell capacity).
4. **Current ratings:** Doc used MIL-DTL-38999 standard values; actual Souriau catalog is more conservative (#16: 13A not 23A, #12: 23A not 41A, #8: 45A not 73A, #4: 80A not 200A). Database includes both with catalog values as primary.
5. **Souriau shell 08 keyways:** Only 5 (N, A, D, E, U) — not 7. B and C excluded per catalog page 18.
6. **Fuel-immersible flags:** Added F to 6 layouts found on catalog page 44 but missing from doc: 02-35, 04-05, 06-05, 08-12, 16-06, 16-08.

---

## Business Context

- **Primary buyer:** Souriau/Eaton (embed on eaton.com)
- **Secondary:** Distributors
- **Tertiary:** Harness shops
- **Validated by:** Sarthak, F1 harness/systems engineer, Red Bull Racing
- **Key insight from Sarthak:** "Teams spec on average continuous current. No temperature derating, no proximity derating. The engine can use catalog-rated values directly."

---

## Source PDFs (in CEV2 folder)
- `8STA_8TA_Motorsport_EATON_Souriau_Connectors_PDF_Catalogue_2025.pdf` (56pp)
- `ENG_DS_1-1773721-8_as_interconnection_0922.pdf` (48pp)
- `IndexArch-Motorsport-SpecEngine-FullContext-v2.md` (master context doc)
