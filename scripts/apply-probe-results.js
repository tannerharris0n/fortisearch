#!/usr/bin/env node
/*
 * Read scripts/probe-report.json (output of probe-empty-vm.js) and map the
 * discovered install/deploy doc slugs to platform keys, then write into
 * links.vmGuides on the matching product. Products with a single
 * non-platform-specific install/deployment guide get
 * links.installGuide (a single fallback link surfaced in the panel).
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, '..', 'src', 'data', 'products.json');
const REPORT_PATH = resolve(__dirname, 'probe-report.json');

// Each entry: regex that the docSlug must match, mapped platform key.
// Order matters — first match wins.
const PLATFORM_RULES = [
  [/^aws-/, 'aws'],
  [/-aws-/, 'aws'],
  [/^azure-/, 'azure'],
  [/-azure-/, 'azure'],
  [/^gcp-/, 'gcp'],
  [/google-cloud-platform-gcp/, 'gcp'],
  [/^google-cloud/, 'gcp'],
  [/^oracle-cloud-infrastructure-oci/, 'oci'],
  [/^oracle-public-cloud-oci/, 'oci'],
  [/^oci-/, 'oci'],
  [/alibaba-cloud/, 'alicloud'],
  [/^alicloud/, 'alicloud'],
  [/^ibm-/, 'ibm-cloud'],
  [/^vmware-deployment/, 'vmware-esxi'],
  [/^vmware-esxi/, 'vmware-esxi'],
  [/^esx-/, 'vmware-esxi'],
  [/installing-fortipolicy-for-vmware/, 'vmware-esxi'],
  [/^kvm-/, 'kvm'],
  [/^hyper-v-/, 'microsoft-hyper-v'],
  [/^microsoft-hyper-v/, 'microsoft-hyper-v'],
  [/^openstack-/, 'openstack'],
  [/^xen-/, 'xen'],
  [/^nutanix-ahv/, 'nutanix'],
  [/^nutanix-/, 'nutanix'],
  [/^docker-/, 'docker'],
  [/^kubernetes-/, 'kubernetes'],
  [/^proxmox-/, 'proxmox'],
  [/^cisco-aci/, 'cisco-aci'],
];

// Slugs that should be stored as a single generic install/deployment guide
// (links.installGuide) rather than under a platform key.
const GENERIC_INSTALL_PATTERNS = [
  /^vm-installation/,
  /^hardware-and-vm-install/,
  /^deployment-guide$/,
  /^offline-installation-and-upgrade/,
  /^appliance-installation/,
];

function classify(docSlug) {
  for (const [re, key] of PLATFORM_RULES) if (re.test(docSlug)) return { platform: key };
  for (const re of GENERIC_INSTALL_PATTERNS) if (re.test(docSlug)) return { generic: true };
  return null;
}

const raw = await readFile(DATA_PATH, 'utf8');
const data = JSON.parse(raw);
const report = JSON.parse(await readFile(REPORT_PATH, 'utf8'));

const stats = { platformed: 0, generic: 0, products: [] };

for (const [productId, info] of Object.entries(report)) {
  const product = data.products.find((p) => p.id === productId);
  if (!product) continue;

  const vmGuides = {};
  let installGuide = null;
  for (const doc of info.docs) {
    const c = classify(doc.docSlug);
    if (!c) continue;
    if (c.platform) {
      // Prefer the highest version when multiple platform entries exist.
      vmGuides[c.platform] = doc.url;
    } else if (c.generic && !installGuide) {
      installGuide = doc.url;
    }
  }

  if (!product.links) product.links = {};
  let summary = '';
  if (Object.keys(vmGuides).length) {
    product.links.vmGuides = vmGuides;
    stats.platformed += Object.keys(vmGuides).length;
    summary += `${Object.keys(vmGuides).length} platforms`;
  }
  if (installGuide) {
    product.links.installGuide = installGuide;
    stats.generic++;
    summary += (summary ? ' + ' : '') + 'install guide';
  }
  if (summary) stats.products.push(`${product.name}: ${summary}`);
}

await writeFile(DATA_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');

console.log(`Done. ${stats.products.length} products updated.`);
for (const line of stats.products) console.log('  +', line);
