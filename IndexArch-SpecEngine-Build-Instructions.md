# How To Build The Spec Engine — Step by Step

**Read this top to bottom. Do each step in order. Don't skip ahead.**

---

## BEFORE YOU START

### Folder Setup
Make sure your project folder looks like this:
```
/Users/paapatype/Desktop/GD4/CEV2/
├── 8STA_8TA_Motorsport_EATON_Souriau_Connectors_PDF_Catalogue_2025.pdf
├── ENG_DS_1-1773721-8_as_interconnection_0922.pdf
├── IndexArch-Motorsport-SpecEngine-FullContext-v2.md
└── IndexArch-SpecEngine-Build-Instructions.md   ← (this file)
```

If the PDFs aren't in that folder yet, move them there now.

### Tools You Need
- Claude Code (terminal)
- A browser to test the output
- The master context file (`IndexArch-Motorsport-SpecEngine-FullContext-v2.md`)

---

## STEP 1: Open Claude Code and Set Context

Open Claude Code in your terminal. Navigate to your project folder:
```
cd /Users/paapatype/Desktop/GD4/CEV2
```

Then give Claude Code the master context file. This is the most important step — it gives Claude Code the full picture: what the product is, who validated it, every design decision, and all 147 connector layouts.

**Prompt:**
```
WORKING DIRECTORY: You are in /Users/paapatype/Desktop/GD4/CEV2/
ALL project files are in this folder — both catalog PDFs, the context doc, and all code you create should live here.

Read the file IndexArch-Motorsport-SpecEngine-FullContext-v2.md in this folder. 
This is the complete product spec, industry validation, and extracted database 
for a MIL-DTL-38999 motorsport connector spec engine I'm building. 

Read the entire file and confirm you understand:
1. What the product does
2. The input model (wire groups with count + current + AWG gauge)
3. The matching logic (current → contact size → gauge verification → layout matching)
4. The output model (ranked results with full assembly detail)
5. That Sprint 0 data extraction is already done — all 147 layouts are in the file

Don't build anything yet. Just confirm you've absorbed it.
```

**What to check:** Claude Code should summarise back the key points — wire group input, gauge verification, ranked output with tradeoffs, full assembly BOM in the detail view, cross-reference between Souriau and Deutsch. If it misses the gauge verification or the assembly BOM, point it to the "CHANGE 1" and "CHANGE 2" sections of the doc.

---

## STEP 2: Build the Database File

This turns the markdown tables in the master doc into actual code that the app can use.

**Prompt:**
```
WORKING DIRECTORY: /Users/paapatype/Desktop/GD4/CEV2/
All files are in this folder: both PDFs, the context doc, and all code you create.

Now let's start building. First, create the structured database file.

Using the "COMPLETE EXTRACTED DATABASE" section at the bottom of the context 
file, create a single file called connector_database.js (or .ts if you prefer) 
that exports:

1. CONTACT_SPECS — every contact size (#26, #24, #23, #22D, #22, #20, #16, #12, 
   #8, #4) with: max_current_a, awg_min, awg_max, insulation_min_mm, 
   insulation_max_mm, and a flag for which manufacturer uses it 
   (souriau_only, deutsch_only, or both)

2. SOURIAU_LAYOUTS — all 93 Souriau 8STA layouts from the doc. Each entry: 
   shell_size, layout_number, contacts (object mapping contact_size → count), 
   service_class, types array

3. DEUTSCH_LAYOUTS — all 54 Deutsch layouts from the doc. Each entry: 
   shell_size, layout_number, contacts, family (ASX/ASU/ASL/AS/ASDD/ASHD etc.)

4. SHELL_DIMENSIONS — panel cutout dimensions per shell size

5. ACCESSORIES — nut plate part numbers, bolt sizes, gaskets per shell size 
   (for both Souriau and Deutsch)

6. KEYWAYS — the 7 keyway options with color codes

If you need to verify any data against the original PDFs, they're at:
  /Users/paapatype/Desktop/GD4/CEV2/8STA_8TA_Motorsport_EATON_Souriau_Connectors_PDF_Catalogue_2025.pdf
  /Users/paapatype/Desktop/GD4/CEV2/ENG_DS_1-1773721-8_as_interconnection_0922.pdf

Make sure every single layout from the master doc is included. Don't skip any.
```

**What to check:** Open the output file. Ctrl+F for a few specific layouts to verify:
- `24-41` (Souriau) — should have 5 different contact sizes: 22× #22D + 3× #20 + 11× #16 + 2× #12 + 3× #8
- `04-35` (Souriau) — should have 5× #22D (this is Sarthak's pressure sensor test case)
- `ASDD 18-118` (Deutsch) — should have 118× #24
- Confirm the total count: 93 Souriau + 54 Deutsch = 147 layouts

---

## STEP 3: Build the Core Matching Engine (No UI Yet)

Build the logic first without any UI. This is the brain of the product.

**Prompt:**
```
WORKING DIRECTORY: /Users/paapatype/Desktop/GD4/CEV2/
All files are in this folder: both PDFs, the context doc, the database file you just created, and all code.

Now build the core matching engine as a pure function module — no UI yet, 
just the logic. Create a file called spec_engine.js that exports these functions:

1. mapWireGroupToContactSize(currentA, gaugeAWG)
   - Takes a current rating and optional wire gauge
   - Returns the minimum contact size that satisfies the current requirement
   - Then verifies the wire gauge physically fits in that contact's terminal
   - If gauge is too thick for the electrically-matched contact, bump UP to the 
     next larger contact size
   - If gauge is too thin (may not crimp reliably), return a warning flag
   - Use the CONTACT_SPECS from the database

2. findMatchingLayouts(requiredContacts, brand, fuelImmersible)
   - requiredContacts is an object like { "#22D": 8, "#8": 2 }
   - brand is "souriau" or "deutsch" or "both"
   - If fuelImmersible is true, filter to only layouts with fuel-immersible variants
   - Returns all layouts where available contacts >= required for EVERY contact size
   - For cross-brand matching: treat Souriau #22D as equivalent to Deutsch #22, 
     and Souriau #26 as equivalent to Deutsch #24

3. rankResults(matches)
   - Sort by: fewest spare contacts first, then lightest shell, then smallest shell
   - Tag each result: "Exact fit" (0 spares), "Room to grow" (1-4 spares), 
     "Oversized" (5+ spares)

4. processWireGroups(wireGroups, brand, fuelImmersible)
   - This is the main function. Takes an array of wire groups like:
     [{ name: "Signal", count: 8, currentA: 3, gaugeAWG: 24 },
      { name: "Power", count: 2, currentA: 25, gaugeAWG: 12 }]
   - Calls mapWireGroupToContactSize for each group
   - Aggregates required contacts
   - Calls findMatchingLayouts
   - Calls rankResults
   - Returns the full result set with gauge compatibility info per group

Write a test at the bottom of the file that runs Sarthak's exact scenario:
  - 3 wires, signal, 24 AWG, <1A current
  - Not fuel-immersible
  - Expected result: layout 04-35 (5× #22D, 2 spares) should appear in results
  
Print the test results to console so I can verify.
```

**What to check:** Run the file (`node spec_engine.js`). The output should include layout 04-35 as a match. The gauge check should show: "24 AWG → #22D terminal accepts 28–22 AWG → ✓ FITS". If 04-35 doesn't appear, the matching logic has a bug — fix before moving on.

---

## STEP 4: Build the UI

Now wrap the engine in a React app.

**Prompt:**
```
WORKING DIRECTORY: /Users/paapatype/Desktop/GD4/CEV2/
All files are in this folder: both PDFs, the context doc, database file, engine logic, and all code.

Now build the UI. Create a React app (use Vite or Next.js, whichever you prefer) 
that uses the database and spec engine we just built.

THE INPUT PANEL:
- A wire group table where the user adds rows
- Each row has: Group Name (text), Wire Count (number), Current in Amps (number), 
  Wire Gauge AWG (number, optional)
- An "+ Add Group" button to add rows
- A "Remove" button on each row
- A toggle: Standard / Fuel-immersible
- A brand selector: Souriau 8STA / Deutsch AS / Both
- Optional: keyway exclusion checkboxes (N/A/B/C/D/E/U with color indicators)
- A big "Find Connectors" button

THE RESULTS TABLE:
- Columns: Rank, Shell-Layout, Manufacturer, Contact Distribution, Used/Total, 
  Spares, Tag (Exact fit / Room to grow / Oversized)
- Each row is clickable/expandable

THE DETAIL VIEW (when a row is expanded):
- Wire gauge compatibility per group: "Your wire: 24 AWG → Terminal accepts: 
  28–22 AWG → ✓ FITS" (green) or "✗ DOES NOT FIT" (red)
- Contact distribution breakdown (e.g., "8× #22D + 2× #8")
- Part number builder with labeled segments
- Available keyways with color dots, excluded ones greyed out
- Available variants: Standard ✓ / Hermetic ✗ / Fuel-immersible ✗
- Shell dimensions: panel cutout diameter
- Assembly info: nut plate part number, bolt size, gasket part number
- Catalog page reference

DESIGN:
- This is a professional engineering tool, not a consumer app
- Dark theme preferred — engineers stare at screens all day
- Monospace font for part numbers and specs
- Clean, dense layout — engineers want information density, not whitespace
- No animations, no playful UI — trust and speed are the priorities

If you need to verify any data against the original catalog PDFs:
  /Users/paapatype/Desktop/GD4/CEV2/8STA_8TA_Motorsport_EATON_Souriau_Connectors_PDF_Catalogue_2025.pdf
  /Users/paapatype/Desktop/GD4/CEV2/ENG_DS_1-1773721-8_as_interconnection_0922.pdf
```

**What to check:** Open the app in your browser. Run Sarthak's test case manually:
1. Add one group: "Sensor signal", 3 wires, 0.5A, 24 AWG
2. Set Standard (not fuel-immersible)
3. Set Souriau 8STA
4. Hit "Find Connectors"
5. Layout 04-35 should appear in results
6. Expand it — should show "24 AWG → #22D terminal accepts 28–22 AWG → ✓ FITS"
7. Should show nut plate and gasket part numbers

---

## STEP 5: Add Cross-Reference Mode (Layer 2)

**Prompt:**
```
WORKING DIRECTORY: /Users/paapatype/Desktop/GD4/CEV2/

Add a second tab or mode to the app: "I have an existing connector"

This is the cross-reference engine. The user inputs:
- Manufacturer: dropdown [Souriau 8STA / Deutsch AS]
- Shell size: dropdown (populated from database for selected manufacturer)
- Layout: dropdown (populated from database for selected shell size)

When they select a layout:
- Show the source connector's full specs (contact distribution, dimensions, etc.)
- Automatically find matches in the OTHER manufacturer's database
- Show results in three categories:
  1. EXACT MATCH — same shell size, same layout number (drop-in replacement, 
     confirmed interchangeable by Sarthak at Red Bull Racing)
  2. NEAR MATCH — different layout but compatible contact distribution
  3. NO MATCH — flag what's missing and show closest alternatives

For the exact match: highlight that these are based on the same MIL-DTL-38999 
standard and are confirmed interchangeable (same keyway color = will mate).

Important: Souriau #22D ↔ Deutsch #22 are equivalent (same current, nearly 
identical gauge range). Souriau #26 ≈ Deutsch #24 (same current, same gauge). 
Souriau #12, #8, #4 have NO Deutsch AS equivalent — flag this clearly.

PDFs for reference:
  /Users/paapatype/Desktop/GD4/CEV2/8STA_8TA_Motorsport_EATON_Souriau_Connectors_PDF_Catalogue_2025.pdf
  /Users/paapatype/Desktop/GD4/CEV2/ENG_DS_1-1773721-8_as_interconnection_0922.pdf
```

**What to check:** 
1. Select Deutsch AS → Shell 12 → Layout 35 (22× #22)
2. The cross-reference should show Souriau 8STA 12-35 (22× #22D) as an EXACT MATCH
3. Select Souriau 8STA → Shell 16 → Layout 02 (38× #22D + 1× #8)
4. Should show NO EXACT MATCH in Deutsch (because Deutsch AS has no #8 contact)
5. Should suggest closest Deutsch alternatives and flag the missing #8

---

## STEP 6: Test With Sarthak

Don't approach any distributor or manufacturer until Sarthak has tested it.

**Send Sarthak:**
1. The deployed URL (GitHub Pages, Vercel, or localhost tunnel)
2. Ask him to run these specific tests:

**Test 1: His pressure sensor scenario**
- 3 wires, 24 AWG, <1A, standard environment
- He should get layout 04-35 and confirm the gauge compatibility is correct

**Test 2: A mixed power + signal connector**
- Ask him to pick a real connector he's specified recently and input the wire requirements
- Compare the engine's output to what he actually chose
- Any discrepancy = a bug to fix

**Test 3: Cross-reference**
- Ask him to input a Deutsch AS connector they currently use
- Check if the Souriau 8STA equivalent matches what they'd actually specify

**Questions to ask him after testing:**
- "Is any data wrong?"
- "Is anything missing from the detail view?"
- "Would you use this instead of the PDF?"
- "Can I quote you on that?"

---

## STEP 7: Deploy

Once Sarthak signs off:

```
Deploy the app to GitHub Pages or Vercel. 
Make it accessible at a clean URL.
This will be the demo we share with distributors and Souriau/Eaton.
```

---

## AFTER DEPLOYMENT — Sales Sequence

1. **Get a one-line testimonial from Sarthak** ("This replaces 30 minutes of page-flipping with 10 seconds of accurate results")
2. **Email FC Lane Electronics** (motorsport@fclane.com) — "We built a spec engine for the Souriau 8STA range, validated by an F1 engineer. Here's the demo link. Can we talk?"
3. **Email ProWire USA** — same pitch
4. **Approach Souriau/Eaton directly** — "This tool makes 8STA easier to specify than Deutsch AS, and has a cross-reference mode that converts Deutsch users to Souriau. Validated by a Red Bull Racing engineer."

---

## QUICK REFERENCE: Prompt Order

| Step | What | Prompt |
|------|------|--------|
| 1 | Set context | "Read IndexArch-Motorsport-SpecEngine-FullContext-v2.md..." |
| 2 | Database file | "Create connector_database.js with all 147 layouts..." |
| 3 | Engine logic | "Build spec_engine.js with matching logic + Sarthak test..." |
| 4 | UI | "Build React app with input panel, results table, detail view..." |
| 5 | Cross-reference | "Add second tab for Deutsch ↔ Souriau cross-reference..." |
| 6 | Test with Sarthak | (Manual — send him the URL) |
| 7 | Deploy | "Deploy to GitHub Pages / Vercel" |

**Total estimated build time with Claude Code: 2–4 hours across steps 1–5.**
