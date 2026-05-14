#!/usr/bin/env node
/*
 * For every VM-capable product that didn't get populated by
 * populate-vm-guides.js (i.e., no <slug>-public-cloud or
 * <slug>-private-cloud hub), probe the product's own /product/<slug>
 * page for install / deploy / cookbook / VM doc URLs.
 *
 * Just prints findings — does not mutate the JSON. Use the output
 * to decide which links to commit.
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, '..', 'src', 'data', 'products.json');
const DOC_HOST = 'https://docs.fortinet.com';
const UA = 'FortiSearch-Updater/2.1';

const INSTALL_KEYWORDS = [
  'install', 'deploy', 'cookbook', 'vm-', '-vm', 'virtual',
  'aws', 'azure', 'gcp', 'oci', 'kvm', 'esxi', 'hyper-v',
  'openstack', 'nutanix', 'docker', 'kubernetes', 'cloud',
];

function slugFromDocsUrl(url) {
  if (!url) return null;
  const m = url.match(/\/product\/([a-z0-9-]+)/i);
  return m ? m[1] : null;
}

function variantImpliesVm(p) {
  const v = (p.deploymentVariants || []).map((x) => x.toLowerCase());
  return v.some((x) =>
    x === 'vm' || x === 'public cloud' || x === 'private cloud' ||
    x === 'container' || x.includes('cloud-native')
  );
}

async function probe(slug) {
  const res = await fetch(`${DOC_HOST}/product/${slug}`, {
    redirect: 'follow',
    headers: { 'User-Agent': UA, Accept: 'text/html' },
  }).catch(() => null);
  if (!res || !res.ok) return null;
  const html = await res.text();
  const escapedSlug = slug.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const re = new RegExp(`/document/${escapedSlug}/(\\d+\\.\\d+\\.\\d+)/([a-z0-9-]+)`, 'gi');
  const docs = new Map();
  let m;
  while ((m = re.exec(html)) !== null) {
    const [, ver, docSlug] = m;
    if (!INSTALL_KEYWORDS.some((k) => docSlug.includes(k))) continue;
    const key = docSlug;
    const prior = docs.get(key);
    if (!prior || compareSemver(ver, prior.ver) < 0) docs.set(key, { ver });
  }
  return docs;
}

function compareSemver(a, b) {
  const ap = a.split('.').map(Number);
  const bp = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const av = ap[i] || 0;
    const bv = bp[i] || 0;
    if (av !== bv) return bv - av;
  }
  return 0;
}

const raw = await readFile(DATA_PATH, 'utf8');
const data = JSON.parse(raw);

const targets = data.products.filter(
  (p) => variantImpliesVm(p) && !p.links?.vmGuides && !p.links?.cloudHubs
);

console.log(`Probing ${targets.length} VM-capable products with no hub data...\n`);

const report = {};
for (const p of targets) {
  const slug = slugFromDocsUrl(p.links?.docs);
  if (!slug) {
    console.log(`${p.id}: no slug, skipping`);
    continue;
  }
  const docs = await probe(slug);
  if (!docs || !docs.size) {
    console.log(`${p.id}: no install/deploy docs found at /product/${slug}`);
    continue;
  }
  console.log(`${p.id} (${p.name}):`);
  const list = [];
  for (const [docSlug, info] of docs) {
    const url = `${DOC_HOST}/document/${slug}/${info.ver}/${docSlug}`;
    console.log(`  ${url}`);
    list.push({ docSlug, ver: info.ver, url });
  }
  report[p.id] = { slug, docs: list };
  console.log('');
}

await import('node:fs/promises').then((fs) =>
  fs.writeFile(resolve(__dirname, 'probe-report.json'), JSON.stringify(report, null, 2))
);
console.log('Report written to scripts/probe-report.json');
