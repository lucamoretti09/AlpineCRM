const fs = require('fs');
const path = require('path');

const replacements = [
  [/\\u0103/g, 'ă'], [/\\u0102/g, 'Ă'],
  [/\\u0219/g, 'ș'], [/\\u0218/g, 'Ș'],
  [/\\u021[bB]/g, 'ț'], [/\\u021A/g, 'Ț'],
  [/\\u00ee/g, 'î'], [/\\u00EE/g, 'î'],
  [/\\u00ce/g, 'Î'], [/\\u00CE/g, 'Î'],
  [/\\u00e2/g, 'â'], [/\\u00c2/g, 'Â'],
];

let totalFixed = 0;

function fixFile(fp) {
  let c = fs.readFileSync(fp, 'utf8');
  let changed = false;
  for (const [re, ch] of replacements) {
    const before = c;
    c = c.replace(re, ch);
    if (c !== before) changed = true;
  }
  if (changed) {
    fs.writeFileSync(fp, c, 'utf8');
    console.log('Fixed: ' + fp);
    totalFixed++;
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir);
  for (const f of entries) {
    const p = path.join(dir, f);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      if (f === 'node_modules' || f === 'dist' || f === '.git') continue;
      walk(p);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      fixFile(p);
    }
  }
}

walk(path.join(__dirname, 'src'));
console.log('Total files fixed: ' + totalFixed);
