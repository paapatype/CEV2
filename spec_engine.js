/**
 * IndexArch Motorsport Connector Spec Engine — Core Matching Logic
 *
 * Pure function module. No UI. Exports:
 *   mapWireGroupToContactSize(currentA, gaugeAWG, brand)
 *   findMatchingLayouts(requiredContacts, brand, fuelImmersible)
 *   rankResults(matches)
 *   processWireGroups(wireGroups, brand, fuelImmersible)
 */

import {
  CONTACT_SPECS,
  SOURIAU_LAYOUTS,
  DEUTSCH_LAYOUTS,
} from './connector_database.js';

// ─────────────────────────────────────────────────────────────────────────────
// Contact sizes ordered by current capacity, smallest → largest, per brand.
// The engine walks this list to find the minimum contact that satisfies the
// user's current requirement, then verifies wire gauge.
//
// NOTE: #26 (Souriau) is excluded from the standard order. It's a specialty
// high-density contact (service class R, 400V) used only in HD layouts for
// packing many thin wires into small shells. Standard signal applications
// start from #22D. Similarly, Deutsch #24/#23 are micro-family contacts —
// the standard AS Series order starts from #22.
// ─────────────────────────────────────────────────────────────────────────────

const SOURIAU_CONTACT_ORDER = ['#22D', '#20', '#16', '#12', '#8', '#4'];
const DEUTSCH_CONTACT_ORDER = ['#22', '#20', '#16'];

// Shell size → number for sorting (smaller = lighter)
const SHELL_NUM = {
  '01': 1, '02': 2, '03': 3, '04': 4, '05': 5, '06': 6, '07': 7,
  '08': 8, '10': 10, '12': 12, '14': 14, '16': 16, '18': 18,
  '20': 20, '22': 22, '24': 24,
};

// Cross-brand contact equivalences
const SOURIAU_TO_DEUTSCH = { '#22D': '#22', '#26': '#24' };
const DEUTSCH_TO_SOURIAU = { '#22': '#22D', '#24': '#26' };

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getContactOrder(brand) {
  if (brand === 'deutsch') return DEUTSCH_CONTACT_ORDER;
  return SOURIAU_CONTACT_ORDER; // 'souriau' and 'both' use Souriau sizes
}

/** Get the catalog-rated current for a contact in a specific brand. */
function getRatedCurrent(contactId, brand) {
  const spec = CONTACT_SPECS[contactId];
  if (!spec) return null;
  if (brand === 'souriau') return spec.souriau_current_a ?? null;
  if (brand === 'deutsch') return spec.deutsch_current_a ?? null;
  // 'both': use the more conservative of the two (or whichever exists)
  const s = spec.souriau_current_a;
  const d = spec.deutsch_current_a;
  if (s != null && d != null) return Math.min(s, d);
  return s ?? d ?? null;
}

/** Check if a wire gauge fits in a contact's terminal. */
function checkGaugeFit(contactId, gaugeAWG) {
  const spec = CONTACT_SPECS[contactId];
  if (!spec || spec.awg_min == null || spec.awg_max == null) return 'not_awg_based';
  if (gaugeAWG < spec.awg_min) return 'too_thick';   // lower AWG = thicker wire
  if (gaugeAWG > spec.awg_max) return 'too_thin';     // higher AWG = thinner wire
  return 'fits';
}

/** Translate a required-contacts map from one brand's sizes to the other's. */
function translateContacts(required, direction) {
  const map = direction === 'souriau_to_deutsch' ? SOURIAU_TO_DEUTSCH : DEUTSCH_TO_SOURIAU;
  const out = {};
  for (const [size, count] of Object.entries(required)) {
    const mapped = map[size] || size;
    out[mapped] = (out[mapped] || 0) + count;
  }
  return out;
}

/** Does a layout have >= the required number of every contact size? */
function layoutSatisfies(layout, required) {
  for (const [size, need] of Object.entries(required)) {
    if ((layout.contacts[size] || 0) < need) return false;
  }
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. mapWireGroupToContactSize
// ─────────────────────────────────────────────────────────────────────────────

export function mapWireGroupToContactSize(currentA, gaugeAWG = null, brand = 'souriau') {
  const order = getContactOrder(brand);

  // Step 1 — find the smallest contact whose rated current >= the requirement
  let electricalMatch = null;
  for (const id of order) {
    const rated = getRatedCurrent(id, brand);
    if (rated != null && rated >= currentA) {
      electricalMatch = id;
      break;
    }
  }

  if (!electricalMatch) {
    return {
      contact_size: null,
      gauge_status: 'error',
      error: `No contact rated for ${currentA}A in ${brand} catalog.`,
    };
  }

  const spec = CONTACT_SPECS[electricalMatch];

  // If no gauge given, return the electrical match directly
  if (gaugeAWG == null) {
    return {
      contact_size: electricalMatch,
      current_rating_a: getRatedCurrent(electricalMatch, brand),
      gauge_status: 'not_specified',
      gauge_awg: null,
      awg_range: spec.awg_min != null ? `${spec.awg_min}–${spec.awg_max}` : 'N/A',
    };
  }

  // Step 2 — verify gauge fits
  const fit = checkGaugeFit(electricalMatch, gaugeAWG);

  if (fit === 'fits') {
    return {
      contact_size: electricalMatch,
      current_rating_a: getRatedCurrent(electricalMatch, brand),
      gauge_status: 'fits',
      gauge_awg: gaugeAWG,
      awg_range: `${spec.awg_min}–${spec.awg_max}`,
    };
  }

  if (fit === 'too_thick') {
    // Walk up to find a larger contact that accepts the gauge AND the current
    const startIdx = order.indexOf(electricalMatch) + 1;
    for (let i = startIdx; i < order.length; i++) {
      const bumpId = order[i];
      const bumpFit = checkGaugeFit(bumpId, gaugeAWG);
      if (bumpFit === 'fits') {
        const bumpSpec = CONTACT_SPECS[bumpId];
        return {
          contact_size: bumpId,
          current_rating_a: getRatedCurrent(bumpId, brand),
          gauge_status: 'bumped_up',
          gauge_awg: gaugeAWG,
          awg_range: `${bumpSpec.awg_min}–${bumpSpec.awg_max}`,
          original_contact: electricalMatch,
          bump_reason: `Wire ${gaugeAWG} AWG too thick for ${electricalMatch} (accepts ${spec.awg_min}–${spec.awg_max} AWG). Bumped to ${bumpId}.`,
        };
      }
    }
    return {
      contact_size: electricalMatch,
      current_rating_a: getRatedCurrent(electricalMatch, brand),
      gauge_status: 'no_fit',
      gauge_awg: gaugeAWG,
      awg_range: `${spec.awg_min}–${spec.awg_max}`,
      error: `Wire ${gaugeAWG} AWG too thick for ${electricalMatch} and no larger contact in ${brand} catalog accepts it.`,
    };
  }

  if (fit === 'too_thin') {
    return {
      contact_size: electricalMatch,
      current_rating_a: getRatedCurrent(electricalMatch, brand),
      gauge_status: 'too_thin',
      gauge_awg: gaugeAWG,
      awg_range: `${spec.awg_min}–${spec.awg_max}`,
      warning: `Wire ${gaugeAWG} AWG thinner than ${electricalMatch} range (${spec.awg_min}–${spec.awg_max} AWG). May not crimp reliably.`,
    };
  }

  // Not AWG-based (e.g., #4 Power)
  return {
    contact_size: electricalMatch,
    current_rating_a: getRatedCurrent(electricalMatch, brand),
    gauge_status: 'not_awg_based',
    gauge_awg: gaugeAWG,
    note: `${electricalMatch} uses mm² wire sizing. Verify gauge compatibility manually.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. findMatchingLayouts
// ─────────────────────────────────────────────────────────────────────────────

export function findMatchingLayouts(requiredContacts, brand = 'souriau', fuelImmersible = false) {
  const results = [];
  const totalRequired = Object.values(requiredContacts).reduce((a, b) => a + b, 0);

  // ── Souriau ──
  if (brand === 'souriau' || brand === 'both') {
    for (const layout of SOURIAU_LAYOUTS) {
      if (fuelImmersible && !layout.types.includes('F')) continue;
      if (layoutSatisfies(layout, requiredContacts)) {
        results.push({
          brand: 'souriau',
          brand_label: 'Souriau 8STA',
          shell_size: layout.shell_size,
          layout_number: layout.layout_number,
          contacts: layout.contacts,
          total_contacts: layout.total_contacts,
          service_class: layout.service_class,
          types: layout.types,
          total_required: totalRequired,
          spares: layout.total_contacts - totalRequired,
        });
      }
    }
  }

  // ── Deutsch ──
  if (brand === 'deutsch' || brand === 'both') {
    // When the requirement was built from Souriau sizes (brand='both'),
    // translate #22D→#22 and #26→#24 before searching Deutsch layouts.
    const deutschReq = (brand === 'both')
      ? translateContacts(requiredContacts, 'souriau_to_deutsch')
      : requiredContacts;
    const deutschTotalReq = Object.values(deutschReq).reduce((a, b) => a + b, 0);

    for (const layout of DEUTSCH_LAYOUTS) {
      if (fuelImmersible) {
        const hasFuel = layout.fuel_immersible || (layout.types && layout.types.includes('F'));
        if (!hasFuel) continue;
      }
      if (layoutSatisfies(layout, deutschReq)) {
        results.push({
          brand: 'deutsch',
          brand_label: `Deutsch ${layout.family}`,
          shell_size: layout.shell_size,
          layout_number: layout.layout_number,
          contacts: layout.contacts,
          total_contacts: layout.total_contacts,
          service_class: layout.service_class || null,
          types: layout.types || null,
          family: layout.family,
          total_required: deutschTotalReq,
          spares: layout.total_contacts - deutschTotalReq,
        });
      }
    }
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. rankResults
// ─────────────────────────────────────────────────────────────────────────────

export function rankResults(matches) {
  return matches
    .map(m => ({
      ...m,
      tag: m.spares === 0 ? 'Exact fit'
         : m.spares <= 4  ? 'Room to grow'
         : 'Oversized',
      shell_num: SHELL_NUM[m.shell_size] ?? parseInt(m.shell_size, 10),
    }))
    .sort((a, b) => {
      // 1. Fewest spares first
      if (a.spares !== b.spares) return a.spares - b.spares;
      // 2. Smallest shell first (proxy for lightest)
      if (a.shell_num !== b.shell_num) return a.shell_num - b.shell_num;
      // 3. Souriau before Deutsch
      if (a.brand !== b.brand) return a.brand === 'souriau' ? -1 : 1;
      return 0;
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. processWireGroups — main entry point
// ─────────────────────────────────────────────────────────────────────────────

export function processWireGroups(wireGroups, brand = 'souriau', fuelImmersible = false) {
  // Step 1 — map each wire group to a contact size
  const mappings = wireGroups.map(g => ({
    name: g.name,
    count: g.count,
    currentA: g.currentA,
    gaugeAWG: g.gaugeAWG,
    mapping: mapWireGroupToContactSize(g.currentA, g.gaugeAWG, brand),
  }));

  // Step 2 — aggregate required contacts by size
  const requiredContacts = {};
  for (const m of mappings) {
    const size = m.mapping.contact_size;
    if (size) {
      requiredContacts[size] = (requiredContacts[size] || 0) + m.count;
    }
  }

  // Step 3 — find matching layouts
  const matches = findMatchingLayouts(requiredContacts, brand, fuelImmersible);

  // Step 4 — rank
  const ranked = rankResults(matches);

  return {
    wire_groups: mappings,
    required_contacts: requiredContacts,
    total_contacts_needed: Object.values(requiredContacts).reduce((a, b) => a + b, 0),
    results: ranked,
    result_count: ranked.length,
    has_warnings: mappings.some(m =>
      m.mapping.gauge_status === 'too_thin' || m.mapping.gauge_status === 'bumped_up'),
    has_errors: mappings.some(m => m.mapping.error != null),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. crossReference — find equivalents in the other manufacturer's catalog
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Given a source connector, find matches in the other manufacturer's database.
 *
 * @param {string} sourceBrand  'souriau' or 'deutsch'
 * @param {string} shellSize    e.g. '12'
 * @param {string} layoutNumber e.g. '35'
 * @returns {{ source, exact, near, unmatchable, notes }}
 */
export function crossReference(sourceBrand, shellSize, layoutNumber) {
  const targetBrand = sourceBrand === 'souriau' ? 'deutsch' : 'souriau';

  // Find the source layout
  const sourcePool = sourceBrand === 'souriau' ? SOURIAU_LAYOUTS : DEUTSCH_LAYOUTS;
  const source = sourcePool.find(
    l => l.shell_size === shellSize && l.layout_number === layoutNumber
      && (sourceBrand === 'souriau' || l.family === 'AS' || l.family === undefined),
  );
  // For Deutsch, also accept non-AS families
  const sourceAny = source || sourcePool.find(
    l => l.shell_size === shellSize && l.layout_number === layoutNumber,
  );

  if (!sourceAny) {
    return { source: null, exact: [], near: [], unmatchable: [], notes: ['Source layout not found.'] };
  }

  const src = sourceAny;
  const srcContacts = src.contacts; // e.g. { '#22D': 22 }

  // Translate source contacts to target brand's contact sizes
  const mapping = sourceBrand === 'souriau' ? SOURIAU_TO_DEUTSCH : DEUTSCH_TO_SOURIAU;
  const translated = {};
  const unmatchable = []; // contact sizes with no equivalent in target brand

  for (const [size, count] of Object.entries(srcContacts)) {
    const mapped = mapping[size];
    if (mapped) {
      translated[mapped] = (translated[mapped] || 0) + count;
    } else if (
      // Sizes that exist in both brands as-is
      size === '#20' || size === '#16'
    ) {
      translated[size] = (translated[size] || 0) + count;
    } else {
      // No equivalent — #12, #8, #4 (Souriau-only), #23 (Deutsch-only), AWG4, etc.
      unmatchable.push({ size, count, notes: `${size} has no ${targetBrand === 'souriau' ? 'Souriau 8STA' : 'Deutsch AS'} equivalent.` });
    }
  }

  const targetPool = targetBrand === 'souriau' ? SOURIAU_LAYOUTS : DEUTSCH_LAYOUTS;
  const notes = [];

  // ── Exact match: same shell size AND same layout number ──
  const exact = [];
  const exactLayout = targetPool.find(
    l => l.shell_size === shellSize && l.layout_number === layoutNumber,
  );
  if (exactLayout && unmatchable.length === 0) {
    // Verify contacts actually match after translation
    let contactsMatch = true;
    for (const [size, count] of Object.entries(translated)) {
      if ((exactLayout.contacts[size] || 0) !== count) { contactsMatch = false; break; }
    }
    for (const [size, count] of Object.entries(exactLayout.contacts)) {
      if ((translated[size] || 0) !== count) { contactsMatch = false; break; }
    }
    if (contactsMatch) {
      exact.push({
        ...exactLayout,
        brand: targetBrand,
        brand_label: targetBrand === 'souriau' ? 'Souriau 8STA' : `Deutsch ${exactLayout.family || 'AS'}`,
        match_type: 'exact',
        match_detail: 'Same shell size, same layout number. Drop-in replacement — confirmed interchangeable per MIL-DTL-38999. Same keyway color = will mate.',
      });
    }
  }

  if (unmatchable.length > 0) {
    const sizes = unmatchable.map(u => `${u.count}\u00d7${u.size}`).join(', ');
    notes.push(`Source has ${sizes} with no equivalent in ${targetBrand === 'souriau' ? 'Souriau 8STA' : 'Deutsch AS'} catalog.`);
  }

  // ── Near matches: different layout but contacts are compatible ──
  const near = [];
  const translatedTotal = Object.values(translated).reduce((a, b) => a + b, 0);

  if (Object.keys(translated).length > 0) {
    for (const layout of targetPool) {
      // Skip the exact match we already found
      if (layout.shell_size === shellSize && layout.layout_number === layoutNumber) continue;

      // Check if this layout can satisfy the translated requirement
      let satisfies = true;
      for (const [size, need] of Object.entries(translated)) {
        if ((layout.contacts[size] || 0) < need) { satisfies = false; break; }
      }
      if (!satisfies) continue;

      const targetTotal = layout.total_contacts;
      const spares = targetTotal - translatedTotal;

      near.push({
        ...layout,
        brand: targetBrand,
        brand_label: targetBrand === 'souriau' ? 'Souriau 8STA' : `Deutsch ${layout.family || 'AS'}`,
        match_type: 'near',
        spares,
        match_detail: unmatchable.length > 0
          ? `Covers the translatable contacts (${Object.entries(translated).map(([s,n]) => `${n}\u00d7${s}`).join(' + ')}). Missing contacts (${unmatchable.map(u => `${u.count}\u00d7${u.size}`).join(', ')}) have no equivalent and must be handled separately.`
          : `Compatible contact distribution with ${spares} spare contact${spares !== 1 ? 's' : ''}.`,
      });
    }

    // Sort near matches: same shell first, then fewest spares, then smallest shell
    near.sort((a, b) => {
      const aShell = SHELL_NUM[a.shell_size] ?? parseInt(a.shell_size, 10);
      const bShell = SHELL_NUM[b.shell_size] ?? parseInt(b.shell_size, 10);
      const aSameShell = a.shell_size === shellSize ? 0 : 1;
      const bSameShell = b.shell_size === shellSize ? 0 : 1;
      if (aSameShell !== bSameShell) return aSameShell - bSameShell;
      if (a.spares !== b.spares) return a.spares - b.spares;
      return aShell - bShell;
    });
  }

  return {
    source: {
      ...src,
      brand: sourceBrand,
      brand_label: sourceBrand === 'souriau' ? 'Souriau 8STA' : `Deutsch ${src.family || 'AS'}`,
    },
    translated_contacts: translated,
    exact,
    near: near.slice(0, 20), // cap at 20
    unmatchable,
    notes,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────
// Run: node spec_engine.js
// Tests only execute in Node (not in browser/Vite)

if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('spec_engine.js')) {

const SEP = '─'.repeat(72);

// ── TEST 1: Sarthak's pressure sensor — THE critical validation ─────────────
console.log(SEP);
console.log('TEST 1: Sarthak scenario — 3 wires, 24 AWG, <1A, Souriau');
console.log(SEP);

const test1 = processWireGroups(
  [{ name: 'Pressure sensor', count: 3, currentA: 0.5, gaugeAWG: 24 }],
  'souriau',
  false,
);

console.log('\nContact mapping:');
test1.wire_groups.forEach(g => {
  const m = g.mapping;
  console.log(`  ${g.name}: ${g.count}× ${m.contact_size}`);
  console.log(`    Current: ${g.currentA}A → ${m.contact_size} rated ${m.current_rating_a}A ✓`);
  console.log(`    Gauge:   ${m.gauge_awg} AWG → ${m.contact_size} terminal accepts ${m.awg_range} AWG → ${m.gauge_status === 'fits' ? '✓ FITS' : '✗ ' + m.gauge_status}`);
});

console.log('\nRequired contacts:', JSON.stringify(test1.required_contacts));
console.log('Total needed:', test1.total_contacts_needed);

const sarthakTarget = test1.results.find(r => r.shell_size === '04' && r.layout_number === '35');
if (sarthakTarget) {
  console.log(`\n✓ 04-35 FOUND: ${sarthakTarget.total_required}/${sarthakTarget.total_contacts} contacts, ${sarthakTarget.spares} spares → "${sarthakTarget.tag}"`);
} else {
  console.log('\n✗ BUG: 04-35 NOT in results');
}

console.log(`\nResults: ${test1.result_count} matching layouts`);
console.log('Rank  Shell-Layout  Brand           Used/Total  Spares  Tag');
test1.results.slice(0, 10).forEach((r, i) => {
  const id = `${r.shell_size}-${r.layout_number}`;
  console.log(
    `  ${i + 1}`.padEnd(6) +
    id.padEnd(14) +
    r.brand_label.padEnd(16) +
    `${r.total_required}/${r.total_contacts}`.padEnd(12) +
    `${r.spares}`.padEnd(8) +
    r.tag
  );
});

// ── TEST 2: Mixed power + signal ─────────────────────────────────────────────
console.log('\n' + SEP);
console.log('TEST 2: Mixed — 8× signal 24AWG 3A + 2× power 16AWG 10A, Souriau');
console.log(SEP);

const test2 = processWireGroups(
  [
    { name: 'Signal', count: 8, currentA: 3, gaugeAWG: 24 },
    { name: 'Power',  count: 2, currentA: 10, gaugeAWG: 16 },
  ],
  'souriau',
  false,
);

console.log('\nContact mapping:');
test2.wire_groups.forEach(g => {
  const m = g.mapping;
  console.log(`  ${g.name}: ${g.count}× ${m.contact_size} (${m.current_rating_a}A, ${m.gauge_awg} AWG → ${m.gauge_status === 'fits' ? '✓ FITS' : m.gauge_status})`);
  if (m.bump_reason) console.log(`    ⚠ ${m.bump_reason}`);
  if (m.warning) console.log(`    ⚠ ${m.warning}`);
});
console.log('\nRequired contacts:', JSON.stringify(test2.required_contacts));
console.log(`Results: ${test2.result_count} matching layouts\n`);

if (test2.result_count > 0) {
  console.log('Top 10:');
  console.log('Rank  Shell-Layout  Brand           Used/Total  Spares  Tag           Contacts');
  test2.results.slice(0, 10).forEach((r, i) => {
    const id = `${r.shell_size}-${r.layout_number}`;
    const contacts = Object.entries(r.contacts).map(([s, n]) => `${n}×${s}`).join(' + ');
    console.log(
      `  ${i + 1}`.padEnd(6) +
      id.padEnd(14) +
      r.brand_label.padEnd(16) +
      `${r.total_required}/${r.total_contacts}`.padEnd(12) +
      `${r.spares}`.padEnd(8) +
      r.tag.padEnd(14) +
      contacts
    );
  });
} else {
  console.log('No matching layouts found.');
}

// ── TEST 3: Cross-brand search ───────────────────────────────────────────────
console.log('\n' + SEP);
console.log('TEST 3: Cross-brand — 3 wires, 24AWG, <1A, brand="both"');
console.log(SEP);

const test3 = processWireGroups(
  [{ name: 'Sensor', count: 3, currentA: 0.5, gaugeAWG: 24 }],
  'both',
  false,
);

console.log('\nContact mapping:');
test3.wire_groups.forEach(g => {
  const m = g.mapping;
  console.log(`  ${g.name}: ${g.count}× ${m.contact_size} (${m.gauge_awg} AWG → ${m.gauge_status === 'fits' ? '✓ FITS' : m.gauge_status})`);
});
console.log('\nRequired contacts:', JSON.stringify(test3.required_contacts));

const souriau3 = test3.results.filter(r => r.brand === 'souriau');
const deutsch3 = test3.results.filter(r => r.brand === 'deutsch');
console.log(`Results: ${test3.result_count} total — ${souriau3.length} Souriau, ${deutsch3.length} Deutsch\n`);

console.log('Top 5 Souriau:');
souriau3.slice(0, 5).forEach((r, i) => {
  console.log(`  ${i + 1}. ${r.shell_size}-${r.layout_number}  ${r.spares} spares  "${r.tag}"`);
});
console.log('Top 5 Deutsch:');
deutsch3.slice(0, 5).forEach((r, i) => {
  console.log(`  ${i + 1}. ${r.brand_label} ${r.shell_size}-${r.layout_number}  ${r.spares} spares  "${r.tag}"`);
});

// ── TEST 4: Fuel-immersible filter ───────────────────────────────────────────
console.log('\n' + SEP);
console.log('TEST 4: Fuel-immersible — 6× signal 24AWG 3A, Souriau');
console.log(SEP);

const test4 = processWireGroups(
  [{ name: 'Fuel sensor', count: 6, currentA: 3, gaugeAWG: 24 }],
  'souriau',
  true,
);

console.log('\nRequired contacts:', JSON.stringify(test4.required_contacts));
console.log(`Results: ${test4.result_count} fuel-immersible layouts\n`);
test4.results.forEach((r, i) => {
  const contacts = Object.entries(r.contacts).map(([s, n]) => `${n}×${s}`).join(' + ');
  console.log(`  ${i + 1}. ${r.shell_size}-${r.layout_number}  ${r.spares} spares  "${r.tag}"  [${contacts}]`);
});

// ── TEST 5: Gauge bump-up ────────────────────────────────────────────────────
console.log('\n' + SEP);
console.log('TEST 5: Gauge bump — 20 AWG wire at 3A (electrically #22D, physically needs #20)');
console.log(SEP);

const bump = mapWireGroupToContactSize(3, 20, 'souriau');
console.log(`\n  Contact: ${bump.contact_size}, Gauge: ${bump.gauge_status}`);
if (bump.bump_reason) console.log(`  ⚠ ${bump.bump_reason}`);

// ── TEST 6: Gauge too-thin warning ───────────────────────────────────────────
console.log('\n' + SEP);
console.log('TEST 6: Thin wire warning — 30 AWG at 4A (maps to #22D, wire too thin)');
console.log(SEP);

const thin = mapWireGroupToContactSize(4, 30, 'souriau');
console.log(`\n  Contact: ${thin.contact_size}, Gauge: ${thin.gauge_status}`);
if (thin.warning) console.log(`  ⚠ ${thin.warning}`);

console.log('\n' + SEP);
console.log('ALL TESTS COMPLETE');
console.log(SEP);

} // end Node-only test guard
