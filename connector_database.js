/**
 * IndexArch Motorsport Connector Spec Engine — Complete Database
 *
 * Source data:
 *   - Souriau 8STA catalog (56pp, 2025): 8STA_8TA_Motorsport_EATON_Souriau_Connectors_PDF_Catalogue_2025.pdf
 *   - Deutsch AS catalog (48pp, 09/2022): ENG_DS_1-1773721-8_as_interconnection_0922.pdf
 *   - Validated by Sarthak (F1 harness engineer, Red Bull Racing)
 *
 * CURRENT RATING NOTE:
 *   The Souriau catalog rates contacts more conservatively than the MIL-DTL-38999 standard:
 *     #16: Souriau=13A, Deutsch=20A, MIL spec=23A
 *     #12: Souriau=23A, MIL spec=41A
 *     #8:  Souriau=45A, MIL spec=73A
 *     #4:  Souriau=80A, MIL spec=200A
 *   This database uses the actual CATALOG values (per Sarthak: "use catalog-rated values directly").
 *
 * AWG CONVENTION:
 *   awg_min = thickest wire accepted (lowest AWG number)
 *   awg_max = thinnest wire accepted (highest AWG number)
 *   A user's wire fits if: userGauge >= awg_min && userGauge <= awg_max
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. CONTACT SPECIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const CONTACT_SPECS = {
  '#26': {
    id: '#26',
    souriau_current_a: 3,
    awg_min: 24,
    awg_max: 30,
    conductor_min_mm2: 0.055,
    conductor_max_mm2: 0.215,
    insulation_min_mm: 0.60,
    insulation_max_mm: 0.83,
    manufacturer: 'souriau_only',
    notes: 'Smallest Souriau contact. High-density signal layouts.'
  },
  '#24': {
    id: '#24',
    deutsch_current_a: 3,
    awg_min: 24,
    awg_max: 30,
    conductor_min_mm: 0.254,
    conductor_max_mm: 0.511,
    insulation_min_mm: 0.56,
    insulation_max_mm: 1.02,
    manufacturer: 'deutsch_only',
    notes: 'Deutsch micro contact. Used in ASX, ASU, ASDD families.'
  },
  '#23': {
    id: '#23',
    deutsch_current_a: 3,
    awg_min: 22,
    awg_max: 28,
    conductor_min_mm: 0.321,
    conductor_max_mm: 0.790,
    insulation_min_mm: 0.60,
    insulation_max_mm: 1.37,
    manufacturer: 'deutsch_only',
    notes: 'Deutsch MicroLITE contact. Used in ASL, ASR. No exact Souriau equivalent — closest is #22D (higher current, narrower AWG range).'
  },
  '#22D': {
    id: '#22D',
    souriau_current_a: 5,
    awg_min: 22,
    awg_max: 28,
    conductor_min_mm2: 0.090,
    conductor_max_mm2: 0.380,
    insulation_min_mm: 0.76,
    insulation_max_mm: 1.37,
    manufacturer: 'souriau',
    cross_ref: '#22',
    notes: 'Primary Souriau signal contact. Cross-refs to Deutsch #22. Wider AWG range than Deutsch #22 (accepts AWG 28, Deutsch does not).'
  },
  '#22': {
    id: '#22',
    deutsch_current_a: 5,
    awg_min: 22,
    awg_max: 26,
    conductor_min_mm: 0.405,
    conductor_max_mm: 0.790,
    insulation_min_mm: 0.76,
    insulation_max_mm: 1.37,
    manufacturer: 'deutsch',
    cross_ref: '#22D',
    notes: 'Primary Deutsch signal contact. Cross-refs to Souriau #22D. Narrower AWG range (no AWG 28).'
  },
  '#20': {
    id: '#20',
    souriau_current_a: 7.5,
    deutsch_current_a: 7.5,
    awg_min: 20,
    awg_max: 24,
    conductor_min_mm2: 0.215,
    conductor_max_mm2: 0.600,
    insulation_min_mm: 1.02,
    insulation_max_mm: 2.11,
    manufacturer: 'both',
    notes: 'Medium signal/low power contact. Identical between manufacturers.'
  },
  '#16': {
    id: '#16',
    souriau_current_a: 13,   // Souriau 8STA catalog page 17
    deutsch_current_a: 20,   // Deutsch AS catalog
    mil_spec_current_a: 23,  // MIL-DTL-38999 standard (reference only)
    awg_min: 16,
    awg_max: 20,
    conductor_min_mm2: 0.600,
    conductor_max_mm2: 1.340,
    insulation_min_mm: 1.65,
    insulation_max_mm: 2.77,
    manufacturer: 'both',
    notes: 'Power contact. Significant current rating difference between manufacturers. Use catalog values for the specific manufacturer being specced.'
  },
  '#12': {
    id: '#12',
    souriau_current_a: 23,   // Souriau 8STA catalog page 17
    mil_spec_current_a: 41,  // MIL-DTL-38999 standard (reference only)
    awg_min: 12,
    awg_max: 14,
    conductor_min_mm2: 1.910,
    conductor_max_mm2: 3.180,
    insulation_min_mm: 2.46,
    insulation_max_mm: 3.61,
    manufacturer: 'souriau_only',
    notes: 'Medium power. No Deutsch AS equivalent.'
  },
  '#8': {
    id: '#8',
    souriau_current_a: 45,   // Souriau 8STA catalog page 17
    mil_spec_current_a: 73,  // MIL-DTL-38999 standard (reference only)
    awg_min: 8,
    awg_max: 8,
    conductor_max_mm2: 8.980,
    insulation_min_mm: 4.50,
    insulation_max_mm: 6.50,
    manufacturer: 'souriau_only',
    notes: 'High power / coax / triax. No Deutsch AS equivalent.'
  },
  '#4': {
    id: '#4',
    souriau_current_a: 80,   // Souriau 8STA catalog page 21
    mil_spec_current_a: 200, // Spec 261 rating (reference only)
    wire_mm2_min: 7,
    wire_mm2_max: 10,
    wire_mm2_max_with_reductor: 16,
    insulation_min_mm: null,  // Depends on wire used
    insulation_max_mm: null,
    manufacturer: 'souriau_only',
    notes: 'Highest power Souriau contact. Uses mm² wire sizing, not AWG. Reductor available for 8-10mm² wire. Deutsch ASHD uses AWG4 equivalent.'
  },
  'AWG4': {
    id: 'AWG4',
    deutsch_current_a: 200,
    awg_min: null,
    awg_max: null,
    wire_mm2_min: null,
    wire_mm2_max: null,
    manufacturer: 'deutsch_only',
    notes: 'Deutsch Heavy Duty power contact. Used in ASHD family only.'
  }
};

// Helper: ordered list of contact sizes from smallest to largest current capacity
export const CONTACT_SIZE_ORDER = ['#26', '#24', '#23', '#22D', '#22', '#20', '#16', '#12', '#8', '#4', 'AWG4'];

// ─────────────────────────────────────────────────────────────────────────────
// 2. SOURIAU 8STA LAYOUTS — All 93 layouts from catalog pages 6–11
// ─────────────────────────────────────────────────────────────────────────────
// Types key: S=Signal, HD=High Density, H=Hermetic, C=Coax/Triax, F=Fuel Immersible, P=Power(spec 251)

export const SOURIAU_LAYOUTS = [
  // ── Shell Size 01 ──
  { shell_size: '01', layout_number: '03', contacts: { '#26': 3 }, total_contacts: 3, service_class: 'R', types: ['S', 'HD'] },
  { shell_size: '01', layout_number: '05', contacts: { '#26': 5 }, total_contacts: 5, service_class: 'R', types: ['S', 'HD', 'H'] },

  // ── Shell Size 02 ──
  { shell_size: '02', layout_number: '05', contacts: { '#26': 5 }, total_contacts: 5, service_class: 'R', types: ['S', 'HD', 'F'] },
  { shell_size: '02', layout_number: '06', contacts: { '#26': 6 }, total_contacts: 6, service_class: 'R', types: ['S', 'HD'] },
  { shell_size: '02', layout_number: '35', contacts: { '#22D': 3 }, total_contacts: 3, service_class: 'S', types: ['S', 'H', 'F'] },

  // ── Shell Size 04 ──
  { shell_size: '04', layout_number: '05', contacts: { '#26': 5 }, total_contacts: 5, service_class: 'R', types: ['S', 'F'] },
  { shell_size: '04', layout_number: '06', contacts: { '#26': 6 }, total_contacts: 6, service_class: 'R', types: ['S', 'HD', 'F'] },
  { shell_size: '04', layout_number: '35', contacts: { '#22D': 5 }, total_contacts: 5, service_class: 'M', types: ['S', 'F'] },

  // ── Shell Size 06 ──
  { shell_size: '06', layout_number: '05', contacts: { '#26': 5 }, total_contacts: 5, service_class: 'R', types: ['S', 'HD', 'F'] },
  { shell_size: '06', layout_number: '09', contacts: { '#26': 9 }, total_contacts: 9, service_class: 'R', types: ['S', 'HD', 'F'] },
  { shell_size: '06', layout_number: '35', contacts: { '#22D': 6 }, total_contacts: 6, service_class: 'M', types: ['S', 'HD', 'F', 'H'] },

  // ── Shell Size 08 ──
  { shell_size: '08', layout_number: '01', contacts: { '#16': 1 }, total_contacts: 1, service_class: 'II', types: ['S', 'F'] },
  { shell_size: '08', layout_number: '12', contacts: { '#26': 12 }, total_contacts: 12, service_class: 'R', types: ['S', 'HD', 'F'] },
  { shell_size: '08', layout_number: '35', contacts: { '#22D': 6 }, total_contacts: 6, service_class: 'M', types: ['S', 'HD', 'F', 'H'] },
  { shell_size: '08', layout_number: '98', contacts: { '#20': 3 }, total_contacts: 3, service_class: 'I', types: ['S', 'H', 'F'] },

  // ── Shell Size 10 ──
  { shell_size: '10', layout_number: '01', contacts: { '#12': 1 }, total_contacts: 1, service_class: 'II', types: ['S'] },
  { shell_size: '10', layout_number: '02', contacts: { '#16': 2 }, total_contacts: 2, service_class: 'I', types: ['S'] },
  { shell_size: '10', layout_number: '04', contacts: { '#20': 4 }, total_contacts: 4, service_class: 'I', types: ['S'] },
  { shell_size: '10', layout_number: '05', contacts: { '#20': 5 }, total_contacts: 5, service_class: 'I', types: ['S', 'F'] },
  { shell_size: '10', layout_number: '22', contacts: { '#22D': 4 }, total_contacts: 4, service_class: 'M', types: ['S'] },
  { shell_size: '10', layout_number: '26', contacts: { '#26': 26 }, total_contacts: 26, service_class: 'R', types: ['S', 'HD'] },
  { shell_size: '10', layout_number: '35', contacts: { '#22D': 13 }, total_contacts: 13, service_class: 'S', types: ['S', 'H', 'F'] },
  { shell_size: '10', layout_number: '43', contacts: { '#26': 43 }, total_contacts: 43, service_class: 'R', types: ['S', 'HD'], notes: 'Listed in context doc. Could not visually confirm on PDF pages 6–7 (only 12-43 confirmed). Verify against physical catalog.' },
  { shell_size: '10', layout_number: '80', contacts: { '#8': 1 }, total_contacts: 1, service_class: 'I', types: ['C', 'P'] },
  { shell_size: '10', layout_number: '98', contacts: { '#20': 6 }, total_contacts: 6, service_class: 'I', types: ['S', 'H', 'F'] },
  { shell_size: '10', layout_number: '99', contacts: { '#20': 7 }, total_contacts: 7, service_class: 'I', types: ['S'] },

  // ── Shell Size 12 ──
  { shell_size: '12', layout_number: '01', contacts: { '#4': 1 }, total_contacts: 1, service_class: 'M', types: ['P'] },
  { shell_size: '12', layout_number: '03', contacts: { '#16': 3 }, total_contacts: 3, service_class: 'I', types: ['S', 'H'] },
  { shell_size: '12', layout_number: '04', contacts: { '#16': 4 }, total_contacts: 4, service_class: 'I', types: ['S', 'H'] },
  { shell_size: '12', layout_number: '08', contacts: { '#20': 8 }, total_contacts: 8, service_class: 'I', types: ['S'] },
  { shell_size: '12', layout_number: '26', contacts: { '#22D': 6, '#12': 2 }, total_contacts: 8, service_class: 'M', types: ['S'] },
  { shell_size: '12', layout_number: '35', contacts: { '#22D': 22 }, total_contacts: 22, service_class: 'M', types: ['S', 'H'] },
  { shell_size: '12', layout_number: '43', contacts: { '#26': 43 }, total_contacts: 43, service_class: 'R', types: ['S', 'HD'] },
  { shell_size: '12', layout_number: '80', contacts: { '#8': 1 }, total_contacts: 1, service_class: 'I', types: ['C', 'P'] },
  { shell_size: '12', layout_number: '98', contacts: { '#20': 10 }, total_contacts: 10, service_class: 'I', types: ['S', 'H', 'F'] },

  // ── Shell Size 14 ──
  { shell_size: '14', layout_number: '05', contacts: { '#16': 5 }, total_contacts: 5, service_class: 'II', types: ['S'] },
  { shell_size: '14', layout_number: '15', contacts: { '#20': 14, '#16': 1 }, total_contacts: 15, service_class: 'I', types: ['S'] },
  { shell_size: '14', layout_number: '18', contacts: { '#20': 18 }, total_contacts: 18, service_class: 'I', types: ['S'] },
  { shell_size: '14', layout_number: '19', contacts: { '#20': 19 }, total_contacts: 19, service_class: 'I', types: ['S'] },
  { shell_size: '14', layout_number: '35', contacts: { '#22D': 37 }, total_contacts: 37, service_class: 'M', types: ['S', 'H', 'F'] },
  { shell_size: '14', layout_number: '68', contacts: { '#26': 68 }, total_contacts: 68, service_class: 'R', types: ['S', 'HD'] },
  { shell_size: '14', layout_number: '97', contacts: { '#20': 8, '#16': 4 }, total_contacts: 12, service_class: 'I', types: ['S', 'H'] },

  // ── Shell Size 16 ──
  { shell_size: '16', layout_number: '02', contacts: { '#22D': 38, '#8': 1 }, total_contacts: 39, service_class: 'M', types: ['S', 'C', 'P'] },
  { shell_size: '16', layout_number: '06', contacts: { '#12': 6 }, total_contacts: 6, service_class: 'I', types: ['S', 'F'] },
  { shell_size: '16', layout_number: '08', contacts: { '#16': 8 }, total_contacts: 8, service_class: 'II', types: ['S', 'F'] },
  { shell_size: '16', layout_number: '20', contacts: { '#22D': 16, '#12': 4 }, total_contacts: 20, service_class: 'II', types: ['S'] },
  { shell_size: '16', layout_number: '22', contacts: { '#12': 2, '#8': 2 }, total_contacts: 4, service_class: 'M', types: ['S', 'C', 'P'] },
  { shell_size: '16', layout_number: '26', contacts: { '#20': 26 }, total_contacts: 26, service_class: 'I', types: ['S'] },
  { shell_size: '16', layout_number: '35', contacts: { '#22D': 55 }, total_contacts: 55, service_class: 'M', types: ['S'] },
  { shell_size: '16', layout_number: '75', contacts: { '#8': 2 }, total_contacts: 2, service_class: 'M', types: ['C', 'P'] },

  // ── Shell Size 18 ──
  { shell_size: '18', layout_number: '11', contacts: { '#16': 11 }, total_contacts: 11, service_class: 'II', types: ['S'] },
  { shell_size: '18', layout_number: '18', contacts: { '#22D': 14, '#8': 4 }, total_contacts: 18, service_class: 'M', types: ['S', 'C', 'P'] },
  { shell_size: '18', layout_number: '28', contacts: { '#20': 26, '#16': 2 }, total_contacts: 28, service_class: 'I', types: ['S'] },
  { shell_size: '18', layout_number: '32', contacts: { '#20': 32 }, total_contacts: 32, service_class: 'I', types: ['S'] },
  { shell_size: '18', layout_number: '35', contacts: { '#22D': 66 }, total_contacts: 66, service_class: 'M', types: ['S'] },
  { shell_size: '18', layout_number: '75', contacts: { '#8': 2 }, total_contacts: 2, service_class: 'M', types: ['C', 'P'] },
  { shell_size: '18', layout_number: '99', contacts: { '#20': 21, '#16': 2 }, total_contacts: 23, service_class: 'I', types: ['S'] },

  // ── Shell Size 20 ──
  { shell_size: '20', layout_number: '11', contacts: { '#12': 11 }, total_contacts: 11, service_class: 'I', types: ['S'] },
  { shell_size: '20', layout_number: '16', contacts: { '#16': 16 }, total_contacts: 16, service_class: 'II', types: ['S'] },
  { shell_size: '20', layout_number: '20', contacts: { '#20': 18, '#8': 2 }, total_contacts: 20, service_class: 'M', types: ['S', 'C', 'P'] },
  { shell_size: '20', layout_number: '35', contacts: { '#22D': 79 }, total_contacts: 79, service_class: 'M', types: ['S'] },
  { shell_size: '20', layout_number: '39', contacts: { '#20': 37, '#16': 2 }, total_contacts: 39, service_class: 'I', types: ['S'] },
  { shell_size: '20', layout_number: '41', contacts: { '#20': 41 }, total_contacts: 41, service_class: 'I', types: ['S'] },
  { shell_size: '20', layout_number: '42', contacts: { '#4': 2 }, total_contacts: 2, service_class: 'I', types: ['P'] },
  { shell_size: '20', layout_number: '48', contacts: { '#8': 4 }, total_contacts: 4, service_class: 'I', types: ['P'] },
  { shell_size: '20', layout_number: '59', contacts: { '#22D': 55, '#12': 4 }, total_contacts: 59, service_class: 'M', types: ['S'] },
  { shell_size: '20', layout_number: '72', contacts: { '#16': 6, '#4': 2 }, total_contacts: 8, service_class: 'I', types: ['S', 'P'] },
  { shell_size: '20', layout_number: '75', contacts: { '#8': 4 }, total_contacts: 4, service_class: 'M', types: ['P', 'C'] },
  { shell_size: '20', layout_number: '77', contacts: { '#22D': 17, '#8': 2 }, total_contacts: 19, service_class: 'M', types: ['S', 'C', 'P'] },

  // ── Shell Size 22 ──
  { shell_size: '22', layout_number: '06', contacts: { '#8': 6 }, total_contacts: 6, service_class: 'M', types: ['C', 'P'] },
  { shell_size: '22', layout_number: '21', contacts: { '#16': 21 }, total_contacts: 21, service_class: 'II', types: ['S'] },
  { shell_size: '22', layout_number: '32', contacts: { '#20': 32 }, total_contacts: 32, service_class: 'I', types: ['S'] },
  { shell_size: '22', layout_number: '35', contacts: { '#22D': 100 }, total_contacts: 100, service_class: 'M', types: ['S'] },
  { shell_size: '22', layout_number: '53', contacts: { '#20': 53 }, total_contacts: 53, service_class: 'I', types: ['S'] },
  { shell_size: '22', layout_number: '54', contacts: { '#22D': 40, '#16': 9, '#12': 4 }, total_contacts: 53, service_class: 'M', types: ['S'] },
  { shell_size: '22', layout_number: '55', contacts: { '#20': 55 }, total_contacts: 55, service_class: 'I', types: ['S'] },

  // ── Shell Size 24 ──
  { shell_size: '24', layout_number: '04', contacts: { '#20': 48, '#16': 8 }, total_contacts: 56, service_class: 'I', types: ['S'] },
  { shell_size: '24', layout_number: '07', contacts: { '#22D': 97, '#8': 2 }, total_contacts: 99, service_class: 'M', types: ['S', 'C', 'P'] },
  { shell_size: '24', layout_number: '08', contacts: { '#8': 8 }, total_contacts: 8, service_class: 'M', types: ['C', 'P'] },
  { shell_size: '24', layout_number: '19', contacts: { '#12': 19 }, total_contacts: 19, service_class: 'I', types: ['S'] },
  { shell_size: '24', layout_number: '24', contacts: { '#16': 12, '#12': 12 }, total_contacts: 24, service_class: 'II', types: ['S'] },
  { shell_size: '24', layout_number: '29', contacts: { '#16': 29 }, total_contacts: 29, service_class: 'I', types: ['S'] },
  { shell_size: '24', layout_number: '35', contacts: { '#22D': 128 }, total_contacts: 128, service_class: 'M', types: ['S'] },
  { shell_size: '24', layout_number: '37', contacts: { '#16': 37 }, total_contacts: 37, service_class: 'I', types: ['S'] },
  { shell_size: '24', layout_number: '41', contacts: { '#22D': 22, '#20': 3, '#16': 11, '#12': 2, '#8': 3 }, total_contacts: 41, service_class: 'N', types: ['S', 'C', 'P'] },
  { shell_size: '24', layout_number: '43', contacts: { '#20': 23, '#16': 20 }, total_contacts: 43, service_class: 'I', types: ['S'] },
  { shell_size: '24', layout_number: '44', contacts: { '#16': 4, '#4': 4 }, total_contacts: 8, service_class: 'I', types: ['S', 'P'] },
  { shell_size: '24', layout_number: '46', contacts: { '#20': 40, '#16': 4, '#8': 2 }, total_contacts: 46, service_class: 'I', types: ['S', 'C', 'P'] },
  { shell_size: '24', layout_number: '61', contacts: { '#20': 61 }, total_contacts: 61, service_class: 'I', types: ['S'] },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. DEUTSCH AUTOSPORT LAYOUTS — All families
// ─────────────────────────────────────────────────────────────────────────────

export const DEUTSCH_LAYOUTS = [
  // ── Micro XtraLITE HE (ASX) — Shell 02 ──
  { family: 'ASX', shell_size: '02', layout_number: '03', contacts: { '#22': 3 }, total_contacts: 3, keyways: 6, notes: 'Smallest Deutsch connector' },
  { family: 'ASX', shell_size: '02', layout_number: '05', contacts: { '#24': 5 }, total_contacts: 5, keyways: 6 },
  { family: 'ASX', shell_size: '02', layout_number: '06', contacts: { '#24': 6 }, total_contacts: 6, keyways: 6 },

  // ── Micro UltraLITE HE (ASU) — Shell 03 ──
  { family: 'ASU', shell_size: '03', layout_number: '03', contacts: { '#22': 3 }, total_contacts: 3, keyways: 6 },
  { family: 'ASU', shell_size: '03', layout_number: '05', contacts: { '#24': 5 }, total_contacts: 5, keyways: 6 },

  // ── MicroLITE HE (ASL) — Shell 06 ──
  { family: 'ASL', shell_size: '06', layout_number: '05', contacts: { '#23': 5 }, total_contacts: 5, keyways: 6 },

  // ── Rally Micro (ASR) — Shell 06, plug only, mates with ASL receptacle ──
  { family: 'ASR', shell_size: '06', layout_number: '05', contacts: { '#23': 5 }, total_contacts: 5, keyways: 6, notes: 'Enhanced grip plug for WRC. Mates with ASL receptacle.' },

  // ── Composite (ASC) — Shell 06 equivalent ──
  { family: 'ASC', shell_size: '05', layout_number: '06', contacts: { '#22': 6 }, total_contacts: 6, keyways: 6, notes: 'Thermoplastic housing, 6-way' },

  // ── Mini Series — Shell 07 ──
  { family: 'AS', shell_size: '07', layout_number: '35', contacts: { '#22': 6 }, total_contacts: 6, keyways: 3, keyway_options: ['N', 'A', 'B'] },
  { family: 'AS', shell_size: '07', layout_number: '98', contacts: { '#20': 3 }, total_contacts: 3, keyways: 3, keyway_options: ['N', 'A', 'B'] },

  // ── AS Series — Shell 08–24 (DIRECT 8STA EQUIVALENTS) ──
  { family: 'AS', shell_size: '08', layout_number: '98', contacts: { '#20': 3 }, total_contacts: 3, service_class: 'I', keyways: 3, keyway_options: ['N', 'A', 'D'] },
  { family: 'AS', shell_size: '08', layout_number: '35', contacts: { '#22': 6 }, total_contacts: 6, service_class: 'M', keyways: 3, keyway_options: ['N', 'A', 'D'] },

  { family: 'AS', shell_size: '10', layout_number: '98', contacts: { '#20': 6 }, total_contacts: 6, service_class: 'I', keyways: 5 },
  { family: 'AS', shell_size: '10', layout_number: '35', contacts: { '#22': 13 }, total_contacts: 13, service_class: 'M', keyways: 5 },
  { family: 'AS', shell_size: '10', layout_number: '02', contacts: { '#16': 2 }, total_contacts: 2, service_class: 'I', keyways: 5 },
  { family: 'AS', shell_size: '10', layout_number: '03', contacts: { '#16': 3 }, total_contacts: 3, service_class: 'I', keyways: 5 },

  { family: 'AS', shell_size: '12', layout_number: '04', contacts: { '#16': 4 }, total_contacts: 4, service_class: 'I', keyways: 5 },
  { family: 'AS', shell_size: '12', layout_number: '98', contacts: { '#20': 10 }, total_contacts: 10, service_class: 'I', keyways: 5 },
  { family: 'AS', shell_size: '12', layout_number: '35', contacts: { '#22': 22 }, total_contacts: 22, service_class: 'M', keyways: 5 },

  { family: 'AS', shell_size: '14', layout_number: '97', contacts: { '#20': 8, '#16': 4 }, total_contacts: 12, service_class: 'I', keyways: 5 },
  { family: 'AS', shell_size: '14', layout_number: '19', contacts: { '#20': 19 }, total_contacts: 19, service_class: 'I', keyways: 5 },
  { family: 'AS', shell_size: '14', layout_number: '35', contacts: { '#22': 37 }, total_contacts: 37, service_class: 'M', keyways: 5 },

  { family: 'AS', shell_size: '16', layout_number: '08', contacts: { '#16': 8 }, total_contacts: 8, service_class: 'I', keyways: 5 },
  { family: 'AS', shell_size: '16', layout_number: '26', contacts: { '#20': 26 }, total_contacts: 26, service_class: 'I', keyways: 5 },
  { family: 'AS', shell_size: '16', layout_number: '35', contacts: { '#22': 55 }, total_contacts: 55, service_class: 'M', keyways: 5 },

  { family: 'AS', shell_size: '18', layout_number: '32', contacts: { '#20': 32 }, total_contacts: 32, service_class: 'I', keyways: 5, notes: 'Doc listed 52× #20 but likely typo — Souriau 18-32 = 32× #20, and 52 exceeds shell capacity. Using 32.' },
  { family: 'AS', shell_size: '18', layout_number: '35', contacts: { '#22': 66 }, total_contacts: 66, service_class: 'M', keyways: 5 },

  { family: 'AS', shell_size: '20', layout_number: '16', contacts: { '#16': 16 }, total_contacts: 16, service_class: 'I', keyways: 5 },
  { family: 'AS', shell_size: '20', layout_number: '39', contacts: { '#20': 37, '#16': 2 }, total_contacts: 39, service_class: 'I', keyways: 5 },
  { family: 'AS', shell_size: '20', layout_number: '41', contacts: { '#20': 41 }, total_contacts: 41, service_class: 'I', keyways: 5 },
  { family: 'AS', shell_size: '20', layout_number: '35', contacts: { '#22': 79 }, total_contacts: 79, service_class: 'M', keyways: 5 },

  { family: 'AS', shell_size: '22', layout_number: '21', contacts: { '#16': 21 }, total_contacts: 21, service_class: 'I', keyways: 5 },
  { family: 'AS', shell_size: '22', layout_number: '55', contacts: { '#20': 55 }, total_contacts: 55, service_class: 'I', keyways: 5 },
  { family: 'AS', shell_size: '22', layout_number: '35', contacts: { '#22': 100 }, total_contacts: 100, service_class: 'M', keyways: 5 },

  { family: 'AS', shell_size: '24', layout_number: '29', contacts: { '#16': 29 }, total_contacts: 29, service_class: 'I', keyways: 5 },
  { family: 'AS', shell_size: '24', layout_number: '61', contacts: { '#20': 61 }, total_contacts: 61, service_class: 'I', keyways: 5 },
  { family: 'AS', shell_size: '24', layout_number: '35', contacts: { '#22': 128 }, total_contacts: 128, service_class: 'M', keyways: 5 },

  // ── Double Density (ASDD) — Shell 06–18 ──
  { family: 'ASDD', shell_size: '06', layout_number: '09', contacts: { '#24': 9 }, total_contacts: 9, keyways: 6 },
  { family: 'ASDD', shell_size: '07', layout_number: '11', contacts: { '#24': 11 }, total_contacts: 11, keyways: 3, keyway_options: ['N', 'A', 'B'] },
  { family: 'ASDD', shell_size: '08', layout_number: '11', contacts: { '#24': 11 }, total_contacts: 11, keyways: 3, keyway_options: ['N', 'A', 'D'] },
  { family: 'ASDD', shell_size: '10', layout_number: '23', contacts: { '#24': 23 }, total_contacts: 23, keyways: 6 },
  { family: 'ASDD', shell_size: '12', layout_number: '41', contacts: { '#24': 41 }, total_contacts: 41, keyways: 6 },
  { family: 'ASDD', shell_size: '14', layout_number: '64', contacts: { '#24': 64 }, total_contacts: 64, keyways: 6 },
  { family: 'ASDD', shell_size: '16', layout_number: '93', contacts: { '#24': 93 }, total_contacts: 93, keyways: 6 },
  { family: 'ASDD', shell_size: '18', layout_number: '118', contacts: { '#24': 118 }, total_contacts: 118, keyways: 6 },

  // ── Heavy Duty (ASHD) ──
  { family: 'ASHD', shell_size: '14', layout_number: '1', contacts: { 'AWG4': 1 }, total_contacts: 1, keyways: 6 },
  { family: 'ASHD', shell_size: '22', layout_number: '24320', contacts: { 'AWG4': 2, '#20': 3 }, total_contacts: 5, keyways: 6, notes: '200A per AWG4, 7.5A per #20' },
  { family: 'ASHD', shell_size: '24', layout_number: '34220', contacts: { 'AWG4': 3, '#20': 2 }, total_contacts: 5, keyways: 6, notes: '200A per AWG4, 7.5A per #20' },
  { family: 'ASHD', shell_size: '24', layout_number: '44420', contacts: { 'AWG4': 4, '#20': 4 }, total_contacts: 8, keyways: 6, notes: '200A per AWG4, 7.5A per #20' },

  // ── Hermetic Fuel Tank (AS07PT) — Shell 10–14, glass-sealed ──
  { family: 'AS07PT', shell_size: '10', layout_number: '35', contacts: { '#22': 13 }, total_contacts: 13, keyways: 5, fuel_immersible: true, notes: 'Stainless Steel 303, glass seal. Same layout as AS 10-35.' },
  { family: 'AS07PT', shell_size: '10', layout_number: '98', contacts: { '#20': 6 }, total_contacts: 6, keyways: 5, fuel_immersible: true, notes: 'Stainless Steel 303, glass seal. Same layout as AS 10-98.' },
  { family: 'AS07PT', shell_size: '12', layout_number: '04', contacts: { '#16': 4 }, total_contacts: 4, keyways: 5, fuel_immersible: true, notes: 'Stainless Steel 303, glass seal. Same layout as AS 12-04.' },
  { family: 'AS07PT', shell_size: '12', layout_number: '35', contacts: { '#22': 22 }, total_contacts: 22, keyways: 5, fuel_immersible: true, notes: 'Stainless Steel 303, glass seal. Same layout as AS 12-35.' },
  { family: 'AS07PT', shell_size: '12', layout_number: '98', contacts: { '#20': 10 }, total_contacts: 10, keyways: 5, fuel_immersible: true, notes: 'Stainless Steel 303, glass seal. Same layout as AS 12-98.' },
  { family: 'AS07PT', shell_size: '14', layout_number: '97', contacts: { '#20': 8, '#16': 4 }, total_contacts: 12, keyways: 5, fuel_immersible: true, notes: 'Stainless Steel 303, glass seal. Same layout as AS 14-97.' },

  // ── MicroLITE Fuel Immersible (ASL-952K) — Shell 06 ──
  { family: 'ASL', shell_size: '06', layout_number: '05', contacts: { '#23': 5 }, total_contacts: 5, keyways: 6, fuel_immersible: true, variant: '952K', notes: 'Fuel-resistant elastomer seal variant of ASL 06-05.' },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. SHELL DIMENSIONS
// ─────────────────────────────────────────────────────────────────────────────
// Panel cutout and key dimensions per shell size.
// Souriau dims from catalog pages 13, 16, 19. Deutsch dims from pages 24–25.

export const SHELL_DIMENSIONS = {
  souriau: {
    '01': {
      // Different cutouts per layout (unusual — only shell 01 and 02 vary by layout)
      layouts: {
        '03': { plug_a_max_mm: 16.3, panel_cutout_mm: 7.8, flange_d_mm: 12.0, max_panel_thickness_mm: 1.5 },
        '05': { plug_a_max_mm: 16.7, panel_cutout_mm: 8.6, flange_d_mm: 13.0, max_panel_thickness_mm: 1.5 },
      },
      keyway_count: 7,
    },
    '02': {
      layouts: {
        '05': { plug_a_max_mm: 16.3, panel_cutout_mm: 9.3, flange_d_mm: 15.3, max_panel_thickness_mm: 1.5 },
        '06': { plug_a_max_mm: 16.7, panel_cutout_mm: 9.3, flange_d_mm: 15.3, max_panel_thickness_mm: 1.5 },
        '35': { plug_a_max_mm: 17.6, panel_cutout_mm: 9.3, flange_d_mm: 15.3, max_panel_thickness_mm: 1.5 },
      },
      keyway_count: 7,
    },
    '04': {
      plug_a_max_mm: 18.3,
      panel_cutout_mm: 12.0,
      flange_d_mm: 16.2,
      max_panel_thickness_rear_mm: 1.0,
      max_panel_thickness_front_mm: 2.5,
      keyway_count: 7,
    },
    '06': {
      plug_a_max_mm: 23.3,
      panel_cutout_mm: 13.0,
      flange_d_mm: 18.0,
      max_panel_thickness_rear_mm: 1.5,
      max_panel_thickness_front_mm: 2.5,
      keyway_count: 7,
      notes: 'Also available in composite (glass fiber loaded plastic).',
    },
    '08': {
      plug_a_max_mm: 18.70,
      receptacle_d_mm: 12.00,
      panel_cutout_a_mm: 14.50,
      panel_cutout_b_mm: 21.40,
      panel_cutout_c_mm: 3.60,
      max_panel_thickness_mm: 3.00,
      flange_a_max_mm: 16.50,
      keyway_count: 5,  // N, A, D, E, U — no B or C (per catalog page 18)
      keyway_options: ['N', 'A', 'D', 'E', 'U'],
    },
    '10': {
      plug_a_max_mm: 21.50,
      receptacle_d_mm: 15.00,
      panel_cutout_a_mm: 17.40,
      panel_cutout_b_mm: 25.90,
      panel_cutout_c_mm: 3.60,
      max_panel_thickness_mm: 3.00,
      flange_a_max_mm: 19.50,
      keyway_count: 6,
      keyway_options: ['N', 'A', 'B', 'C', 'D', 'U'],
    },
    '12': {
      plug_a_max_mm: 25.10,
      receptacle_d_mm: 19.05,
      panel_cutout_a_mm: 21.90,
      panel_cutout_b_mm: 29.10,
      panel_cutout_c_mm: 3.60,
      max_panel_thickness_mm: 3.00,
      flange_a_max_mm: 24.00,
      keyway_count: 6,
      keyway_options: ['N', 'A', 'B', 'C', 'D', 'U'],
    },
    '14': {
      plug_a_max_mm: 29.00,
      receptacle_d_mm: 22.22,
      panel_cutout_a_mm: 25.00,
      panel_cutout_b_mm: 32.50,
      panel_cutout_c_mm: 3.60,
      max_panel_thickness_mm: 3.00,
      flange_a_max_mm: 27.00,
      keyway_count: 6,
      keyway_options: ['N', 'A', 'B', 'C', 'D', 'U'],
    },
    '16': {
      plug_a_max_mm: 32.20,
      receptacle_d_mm: 25.40,
      panel_cutout_a_mm: 28.20,
      panel_cutout_b_mm: 34.80,
      panel_cutout_c_mm: 3.60,
      max_panel_thickness_mm: 3.00,
      flange_a_max_mm: 30.30,
      keyway_count: 6,
      keyway_options: ['N', 'A', 'B', 'C', 'D', 'U'],
    },
    '18': {
      plug_a_max_mm: 35.40,
      receptacle_d_mm: 28.57,
      panel_cutout_a_mm: 31.40,
      panel_cutout_b_mm: 38.20,
      panel_cutout_c_mm: 3.60,
      max_panel_thickness_mm: 3.00,
      flange_a_max_mm: 33.70,
      keyway_count: 6,
      keyway_options: ['N', 'A', 'B', 'C', 'D', 'U'],
    },
    '20': {
      plug_a_max_mm: 38.20,
      receptacle_d_mm: 31.75,
      panel_cutout_a_mm: 34.60,
      panel_cutout_b_mm: 41.60,
      panel_cutout_c_mm: 3.60,
      max_panel_thickness_mm: 3.00,
      flange_a_max_mm: 37.00,
      keyway_count: 6,
      keyway_options: ['N', 'A', 'B', 'C', 'D', 'U'],
    },
    '22': {
      plug_a_max_mm: 41.30,
      receptacle_d_mm: 34.92,
      panel_cutout_a_mm: 37.60,
      panel_cutout_b_mm: 45.00,
      panel_cutout_c_mm: 3.60,
      max_panel_thickness_mm: 3.00,
      flange_a_max_mm: 40.40,
      keyway_count: 6,
      keyway_options: ['N', 'A', 'B', 'C', 'D', 'U'],
    },
    '24': {
      plug_a_max_mm: 44.50,
      receptacle_d_mm: 38.10,
      panel_cutout_a_mm: 41.00,
      panel_cutout_b_mm: 49.50,
      panel_cutout_c_mm: 4.10,
      max_panel_thickness_mm: 3.00,
      flange_a_max_mm: 43.40,
      keyway_count: 6,
      keyway_options: ['N', 'A', 'B', 'C', 'D', 'U'],
    },
  },
  deutsch: {
    // Deutsch AS Series shell sizes 08–24 (from catalog pages 24–25)
    '08': {
      plug_a_max_mm: 17.70,
      receptacle_d_mm: 12.00,
      panel_cutout_a_mm: 14.50,
      panel_cutout_b_mm: 21.40,
      panel_cutout_c_mm: 3.60,
      keyway_count: 3,
      keyway_options: ['N', 'A', 'D'],
    },
    '10': {
      plug_a_max_mm: 20.80,
      receptacle_d_mm: 15.00,
      panel_cutout_a_mm: 17.40,
      panel_cutout_b_mm: 25.90,
      panel_cutout_c_mm: 3.60,
      keyway_count: 5,
      keyway_options: ['N', 'A', 'B', 'C', 'D'],
    },
    '12': {
      plug_a_max_mm: 25.20,
      receptacle_d_mm: 19.05,
      panel_cutout_a_mm: 21.90,
      panel_cutout_b_mm: 29.10,
      panel_cutout_c_mm: 3.60,
      keyway_count: 5,
      keyway_options: ['N', 'A', 'B', 'C', 'D'],
    },
    '14': {
      plug_a_max_mm: 28.40,
      receptacle_d_mm: 22.22,
      panel_cutout_a_mm: 25.00,
      panel_cutout_b_mm: 32.50,
      panel_cutout_c_mm: 3.60,
      keyway_count: 5,
      keyway_options: ['N', 'A', 'B', 'C', 'D'],
    },
    '16': {
      plug_a_max_mm: 31.50,
      receptacle_d_mm: 25.40,
      panel_cutout_a_mm: 28.20,
      panel_cutout_b_mm: 34.80,
      panel_cutout_c_mm: 3.60,
      keyway_count: 5,
      keyway_options: ['N', 'A', 'B', 'C', 'D'],
    },
    '18': {
      plug_a_max_mm: 34.80,
      receptacle_d_mm: 28.57,
      panel_cutout_a_mm: 31.40,
      panel_cutout_b_mm: 38.20,
      panel_cutout_c_mm: 3.60,
      keyway_count: 5,
      keyway_options: ['N', 'A', 'B', 'C', 'D'],
    },
    '20': {
      plug_a_max_mm: 38.20,
      receptacle_d_mm: 31.75,
      panel_cutout_a_mm: 34.60,
      panel_cutout_b_mm: 41.60,
      panel_cutout_c_mm: 3.60,
      keyway_count: 5,
      keyway_options: ['N', 'A', 'B', 'C', 'D'],
    },
    '22': {
      plug_a_max_mm: 41.30,
      receptacle_d_mm: 34.92,
      panel_cutout_a_mm: 37.80,
      panel_cutout_b_mm: 44.90,
      panel_cutout_c_mm: 3.60,
      keyway_count: 5,
      keyway_options: ['N', 'A', 'B', 'C', 'D'],
    },
    '24': {
      plug_a_max_mm: 44.60,
      receptacle_d_mm: 38.10,
      panel_cutout_a_mm: 41.00,
      panel_cutout_b_mm: 49.30,
      panel_cutout_c_mm: 4.10,
      keyway_count: 5,
      keyway_options: ['N', 'A', 'B', 'C', 'D'],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. ACCESSORIES
// ─────────────────────────────────────────────────────────────────────────────

export const ACCESSORIES = {
  souriau: {
    // Nut plates (from catalog page 53)
    nut_plates: {
      '02': [
        { part_number: '8STA-02 M20', bolt_size: 'M2' },
        { part_number: '8STA-02 M25', bolt_size: 'M2.5' },
      ],
      '04': [
        { part_number: '8STA-04', bolt_size: 'M2' },
        { part_number: '8STA-04 M25', bolt_size: 'M2.5' },
      ],
      '06': [{ part_number: '8STA-06 M25', bolt_size: 'M2.5' }],
      '08': [{ part_number: '8STA-08', bolt_size: 'M3' }],
      '10': [{ part_number: '8STA-10', bolt_size: 'M3' }],
      '12': [{ part_number: '8STA-12', bolt_size: 'M3' }],
      '14': [{ part_number: '8STA-14', bolt_size: 'M3' }],
      '16': [{ part_number: '8STA-16', bolt_size: 'M3' }],
      '18': [{ part_number: '8STA-18', bolt_size: 'M3' }],
      '20': [{ part_number: '8STA-20', bolt_size: 'M3' }],
      '22': [{ part_number: '8STA-22', bolt_size: 'M3' }],
      '24': [{ part_number: '8STA-24', bolt_size: 'M3' }],
    },
    // Gaskets (from catalog page 53)
    gaskets: {
      '02': { standard: '8STA-G02', fuel_tank: '8STA-G02 022B' },
      '04': { standard: '8STA-G04', fuel_tank: '8STA-G04 022B' },
      '06': { standard: '8STA-G06', fuel_tank: '8STA-G06 022B' },
      '08': { standard: '8STA-G08', fuel_tank: '8STA-G08 022B' },
      '10': { standard: '8STA-G10', fuel_tank: '8STA-G10 022B' },
      '12': { standard: '8STA-G12', fuel_tank: '8STA-G12 022B' },
      '14': { standard: '8STA-G14', fuel_tank: '8STA-G14 022B' },
      '16': { standard: '8STA-G16', fuel_tank: '8STA-G16 022B' },
      '18': { standard: '8STA-G18', fuel_tank: '8STA-G18 022B' },
      '20': { standard: '8STA-G20', fuel_tank: '8STA-G20 022B' },
      '22': { standard: '8STA-G22', fuel_tank: '8STA-G22 022B' },
      '24': { standard: '8STA-G24', fuel_tank: '8STA-G24 022B' },
    },
    // Protective caps (from catalog pages 52–53)
    protective_caps: {
      '01': { plug: { '03': '8STA801', '05': '8STA8F01' }, receptacle: { '03': '8STA901', '05': '8STA9F01' } },
      '02': { plug: '8STA802', receptacle: '8STA902', notes: 'Except 02-06' },
      '04': { plug: '8STA804', receptacle: '8STA904' },
      '06': { plug: { '05': '8STA806', '09': '8STA8F06', '35': '8STA8F06' }, receptacle: { '05': '8STA906', '09': '8STA9F06', '35': '8STA9F06' } },
      '08': { plug: '8STA808', receptacle: '8STA908' },
      '10': { plug: '8STA810', receptacle: '8STA910' },
      '12': { plug: '8STA812', receptacle: '8STA912' },
      '14': { plug: '8STA814', receptacle: '8STA914' },
      '16': { plug: '8STA816', receptacle: '8STA916' },
      '18': { plug: '8STA818', receptacle: '8STA918' },
      '20': { plug: '8STA820', receptacle: '8STA920' },
      '22': { plug: '8STA822', receptacle: '8STA922' },
      '24': { plug: '8STA824', receptacle: '8STA924' },
    },
    // Filler plugs (from catalog page 50)
    filler_plugs: {
      '#22D': { ms_part: 'MS27488-22-2', souriau_part: '8660-212', color: 'Black' },
      '#20':  { ms_part: 'MS27488-20-2', souriau_part: '8522-389A', color: 'Red' },
      '#16':  { ms_part: 'MS27488-16-2', souriau_part: '8522-390A', color: 'Blue' },
      '#12':  { ms_part: 'MS27488-12-2', souriau_part: '8522-391A', color: 'Yellow' },
    },
    // Part number structure
    part_number_format: '8STA {shell_type} {shell_size} {layout} {pin_socket} {keyway} {spec}',
    shell_types: {
      '0': 'Oval flange receptacle',
      '1': 'In-line receptacle',
      '6': 'Plug',
      '7': 'Jam nut receptacle',
    },
    spec_codes: {
      '': 'Standard',
      '499': 'Integrated clinch nut (M2 for sizes 01-06, M3 for sizes 08-24)',
      '528': 'Integrated clinch nut (M2.5 for sizes 02-06)',
      '523': 'Lightweight in-line receptacle (shell type 1 only)',
      '562': 'PCB version',
      '022B': 'Fuel immersible version',
    },
    // Boots (from catalog page 51)
    boots: {
      '01': { straight: '204W201-25', right_angle: '224W201-25' },
      '02': { straight: '203W301-25-G02', right_angle: '223W601-25' },
      '04': { straight: '204W221-25-G03', right_angle: '224W221-25-G03' },
      '06': { straight: '204W221', right_angle: '224W221' },
      '08': { straight: '202K121', right_angle: '222K121' },
      '10': { straight: '202K132', right_angle: '222K132' },
      '12': { straight: '202K142', right_angle: '222K142' },
      '14': { straight: '202K142', right_angle: '222K142' },
      '16': { straight: '202K153', right_angle: '222K153' },
      '18': { straight: '202K153', right_angle: '222K153' },
      '20': { straight: '202K163', right_angle: '222K163' },
      '22': { straight: '202K163', right_angle: '222K163' },
      '24': { straight: '202K174', right_angle: '222K174' },
    },
  },
  deutsch: {
    // Nut plates (from catalog pages 26–27)
    nut_plates: {
      '02': [{ part_number: 'ATM396-2', bolt_size: 'M2' }],
      '03': [{ part_number: 'ATM396-4', bolt_size: 'M2' }],
      '06': [{ part_number: 'ATM396-6', bolt_size: 'M2.5' }],
      '07': [{ part_number: 'ATM396-7', bolt_size: 'M3' }],
      '08': [{ part_number: 'ATM396-8', bolt_size: 'M3' }],
      '10': [{ part_number: 'ATM396-10', bolt_size: 'M3' }],
      '12': [{ part_number: 'ATM396-12', bolt_size: 'M3' }],
      '14': [{ part_number: 'ATM396-14', bolt_size: 'M3' }],
      '16': [{ part_number: 'ATM396-16', bolt_size: 'M3' }],
      '18': [{ part_number: 'ATM396-18', bolt_size: 'M3' }],
      '20': [{ part_number: 'ATM396-20', bolt_size: 'M3' }],
      '22': [{ part_number: 'ATM396-22', bolt_size: 'M3' }],
      '24': [{ part_number: 'ATM396-24', bolt_size: 'M3' }],
    },
    // Gaskets
    gaskets: {
      '08': { standard: 'GV-08' },
      '10': { standard: 'GV-10' },
      '12': { standard: 'GV-12' },
      '14': { standard: 'GV-14' },
      '16': { standard: 'GV-16' },
      '18': { standard: 'GV-18' },
      '20': { standard: 'GV-20' },
      '22': { standard: 'GV-22' },
      '24': { standard: 'GV-24' },
    },
    // Part number structure
    part_number_format: 'AS {shell_type} {shell_size} — {layout} {pin_socket} {keyway} — HE {mod_code}',
    shell_types: {
      '0': 'Oval flange receptacle',
      '1': 'In-line receptacle',
      '6': 'Plug',
      '7': 'Jam nut receptacle',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. KEYWAYS
// ─────────────────────────────────────────────────────────────────────────────

export const KEYWAYS = [
  {
    code: 'N',
    color: 'Red',
    label: 'Red (standard)',
    souriau_availability: 'all',      // All shell sizes
    deutsch_availability: 'all',      // All shell sizes
  },
  {
    code: 'A',
    color: 'Yellow',
    label: 'Yellow',
    souriau_availability: 'all',
    deutsch_availability: 'all',
  },
  {
    code: 'B',
    color: 'Blue',
    label: 'Blue',
    souriau_availability: 'except_08', // All except shell size 08
    deutsch_availability: 'size_10+',  // Shell size 10 and above only
  },
  {
    code: 'C',
    color: 'Orange',
    label: 'Orange',
    souriau_availability: 'except_08',
    deutsch_availability: 'size_10+',
  },
  {
    code: 'D',
    color: 'Green',
    label: 'Green',
    souriau_availability: 'all',
    deutsch_availability: 'all',
  },
  {
    code: 'E',
    color: 'Grey',
    label: 'Grey',
    souriau_availability: 'sizes_01_to_06', // Available for sizes 01-06 only (not listed for 08-24 in catalog)
    deutsch_availability: 'size_10+',
  },
  {
    code: 'U',
    color: 'Violet',
    label: 'Universal',
    souriau_availability: 'all',        // Listed for all Souriau sizes
    deutsch_availability: 'plug_type_6', // Deutsch: plug type 6 only
    notes: 'Universal keyway — can mate with any other orientation. For Deutsch, only available on plug type 6.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 7. CROSS-REFERENCE MAPPING
// ─────────────────────────────────────────────────────────────────────────────
// Souriau 8STA ↔ Deutsch AS Series are direct equivalents for shell sizes 08–24.
// Same layout numbers, same contact distributions, same panel cutouts (within tolerance).

export const CROSS_REFERENCE = {
  // Contact size equivalence
  contact_mapping: {
    '#22D': { deutsch_equiv: '#22', notes: 'Same current (5A). Souriau accepts AWG 22–28, Deutsch accepts AWG 22–26.' },
    '#22':  { souriau_equiv: '#22D', notes: 'Same current (5A). Deutsch range is narrower (no AWG 28).' },
    '#26':  { deutsch_approx: '#24', notes: 'Same current (3A), same AWG range (24–30). Different contact size designation.' },
    '#24':  { souriau_approx: '#26', notes: 'Same current (3A), same AWG range (24–30). Different contact size designation.' },
    '#23':  { souriau_closest: '#22D', notes: 'Deutsch #23 (3A, 22–28 AWG) → closest Souriau is #22D (5A, 22–28 AWG). Higher current rating, same gauge range.' },
    '#20':  { notes: 'Direct equivalent. Same in both manufacturers.' },
    '#16':  { notes: 'Direct equivalent. Same layout position. Current ratings differ: Souriau=13A, Deutsch=20A.' },
    '#12':  { notes: 'Souriau only. No Deutsch AS equivalent.' },
    '#8':   { notes: 'Souriau only. No Deutsch AS equivalent.' },
    '#4':   { deutsch_equiv: 'AWG4', notes: 'Souriau #4 ↔ Deutsch AWG4 (ASHD family only, not standard AS Series).' },
    'AWG4': { souriau_equiv: '#4', notes: 'Deutsch ASHD ↔ Souriau #4 power contact.' },
  },
  // Shell sizes where cross-reference is valid
  interchangeable_shells: ['08', '10', '12', '14', '16', '18', '20', '22', '24'],
  // Shell sizes that are manufacturer-specific
  souriau_only_shells: ['01', '02', '04', '06'],
  deutsch_only_shells: ['03', '05', '07'], // ASU=03, ASC=05, Mini=07
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. SERVICE CLASS REFERENCE
// ─────────────────────────────────────────────────────────────────────────────
// Display as metadata only — no engine logic. Per Sarthak: "I don't know what they mean."

export const SERVICE_CLASSES = {
  'R': { voltage_sea_level: 400, voltage_21000m: null, description: 'Low voltage — high density layouts (#26 contacts)' },
  'S': { voltage_sea_level: 1000, voltage_21000m: null, description: 'Standard signal layouts' },
  'M': { voltage_sea_level: 1300, voltage_21000m: 800, description: 'Medium voltage — most common for signal + mixed layouts' },
  'N': { voltage_sea_level: 1000, voltage_21000m: 600, description: 'Multi-size mixed contact layouts' },
  'I': { voltage_sea_level: 1800, voltage_21000m: 1000, description: 'High voltage — #20 and #16 layouts' },
  'II': { voltage_sea_level: 2300, voltage_21000m: 1000, description: 'Highest voltage — large #16 layouts' },
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. ORIENTATION ANGLES (Souriau, sizes 08–24, from catalog page 20)
// ─────────────────────────────────────────────────────────────────────────────
// Viewed from face of receptacle. Degrees from reference position.

export const ORIENTATION_ANGLES = {
  souriau: {
    '08': { N: 95, A: 77, B: null, C: null, D: 113 },
    '10': { N: 95, A: 81, B: 67, C: 123, D: 109 },
    '12': { N: 95, A: 75, B: 63, C: 127, D: 116 },
    '14': { N: 95, A: 74, B: 61, C: 129, D: 116 },
    '16': { N: 95, A: 77, B: 65, C: 125, D: 113 },
    '18': { N: 95, A: 77, B: 65, C: 125, D: 113 },
    '20': { N: 95, A: 77, B: 65, C: 125, D: 113 },
    '22': { N: 95, A: 80, B: 69, C: 121, D: 110 },
    '24': { N: 95, A: 80, B: 69, C: 121, D: 110 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
// Souriau 8STA layouts: 89 unique entries from the context doc's tables.
//   The doc's summary claims 93 but only 89 shell-layout combos are listed in its tables.
//   4 missing entries could not be identified from the PDF catalog (pages 6–11, 22, 44).
//   10-43 (43× #26) is included but could not be visually confirmed — may be a doc error (only 12-43 confirmed).
//
// Deutsch layouts: 56 entries (including ASR 06-05 and ASL-952K fuel variant).
//   The doc claims 54 — reconciles if ASR (same layout as ASL 06-05) and ASL-952K (fuel variant)
//   are counted as variants rather than separate layouts: 56 - 2 = 54.
//
// Combined database: 145 entries (89 + 56). Doc claims 147 (93 + 54).
// Contact sizes: 11 unique (#26, #24, #23, #22D, #22, #20, #16, #12, #8, #4, AWG4)
