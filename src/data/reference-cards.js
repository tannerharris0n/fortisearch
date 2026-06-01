import memory from './fortigate-memory.json';

// Reference cards are not products — they're searchable knowledge cards that open
// a reference panel instead of a product detail. They flow through the same search
// and grid as products via a `kind: 'reference'` discriminator.
const referenceCards = [
  {
    id: 'ref-memory',
    kind: 'reference',
    name: 'Memory / RAM by Model',
    shortDescription:
      'System memory (RAM) for current FortiGate appliances and FortiGate-VM license tiers.',
    category: 'Reference',
    subcategory: 'Hardware reference',
    uiCategory: 'Reference',
    tags: [
      'memory',
      'RAM',
      'DRAM',
      'system memory',
      'GB',
      'conserve mode',
      'sizing',
      'hardware',
      'spec',
    ],
    reference: memory,
  },
];

export default referenceCards;
