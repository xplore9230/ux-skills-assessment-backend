#!/usr/bin/env node
/**
 * Export Knowledge Bank to JSON
 * 
 * This script exports the knowledge bank from TypeScript to JSON format
 * for import into the Python vector store.
 * 
 * Usage:
 *   node scripts/export-knowledge-bank.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Read the TypeScript file
const kbPath = join(projectRoot, 'client/src/data/knowledge-bank.ts');
const outputPath = join(projectRoot, 'server_py/knowledge_bank_export.json');

console.log('📖 Reading knowledge bank...');
const content = readFileSync(kbPath, 'utf-8');

// Extract the knowledgeBank array content
// Find: export const knowledgeBank: Resource[] = [
const startMarker = 'export const knowledgeBank: Resource[] = [';
const endMarker = '];';

const startIdx = content.indexOf(startMarker);
if (startIdx === -1) {
  console.error('❌ Could not find knowledgeBank array');
  process.exit(1);
}

const arrayStart = startIdx + startMarker.length;
const arrayEnd = content.lastIndexOf(endMarker, arrayStart + 100000);

if (arrayEnd === -1) {
  console.error('❌ Could not find end of knowledgeBank array');
  process.exit(1);
}

const arrayContent = content.slice(arrayStart, arrayEnd).trim();

// Parse TypeScript objects to JSON
// This is a simplified parser - it handles the basic structure
const resources = [];
let currentObj = '';
let braceDepth = 0;
let inString = false;
let stringChar = '';
let escapeNext = false;

for (let i = 0; i < arrayContent.length; i++) {
  const char = arrayContent[i];
  const prevChar = i > 0 ? arrayContent[i - 1] : '';
  
  if (escapeNext) {
    currentObj += char;
    escapeNext = false;
    continue;
  }
  
  if (char === '\\') {
    escapeNext = true;
    currentObj += char;
    continue;
  }
  
  if ((char === '"' || char === "'") && !escapeNext) {
    if (!inString) {
      inString = true;
      stringChar = char;
      currentObj += char;
    } else if (char === stringChar) {
      inString = false;
      stringChar = '';
      currentObj += char;
    } else {
      currentObj += char;
    }
    continue;
  }
  
  if (!inString) {
    if (char === '{') {
      if (braceDepth === 0) {
        currentObj = '';
      }
      braceDepth++;
      currentObj += char;
    } else if (char === '}') {
      braceDepth--;
      currentObj += char;
      
      if (braceDepth === 0) {
        // Parse this object
        try {
          const obj = parseResourceObject(currentObj.trim());
          if (obj && obj.url) {
            resources.push(obj);
          }
        } catch (e) {
          console.warn(`⚠️  Could not parse resource object: ${e.message}`);
        }
        currentObj = '';
      }
    } else if (braceDepth > 0) {
      currentObj += char;
    }
  } else {
    currentObj += char;
  }
}

function parseResourceObject(objStr) {
  const resource = {};
  
  // Extract fields using regex
  const patterns = {
    id: /id:\s*["']([^"']+)["']/,
    title: /title:\s*["']([^"']+)["']/,
    url: /url:\s*["']([^"']+)["']/,
    type: /type:\s*["']([^"']+)["']/,
    category: /category:\s*["']([^"']+)["']/,
    level: /level:\s*["']([^"']+)["']/,
    summary: /summary:\s*["']((?:[^"']|\\["'])+)["']/,
    duration: /duration:\s*["']([^"']+)["']/,
    source: /source:\s*["']([^"']+)["']/,
    author: /author:\s*["']([^"']+)["']/,
  };
  
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = objStr.match(pattern);
    if (match) {
      resource[key] = match[1].replace(/\\"/g, '"').replace(/\\'/g, "'");
    }
  }
  
  // Extract tags array
  const tagsMatch = objStr.match(/tags:\s*\[(.*?)\]/s);
  if (tagsMatch) {
    const tagsStr = tagsMatch[1];
    const tagPattern = /["']([^"']+)["']/g;
    const tags = [];
    let tagMatch;
    while ((tagMatch = tagPattern.exec(tagsStr)) !== null) {
      tags.push(tagMatch[1]);
    }
    resource.tags = tags;
  } else {
    resource.tags = [];
  }
  
  return resource;
}

// Write JSON file
console.log(`💾 Writing ${resources.length} resources to JSON...`);
writeFileSync(
  outputPath,
  JSON.stringify(resources, null, 2),
  'utf-8'
);

console.log(`✅ Exported ${resources.length} resources to ${outputPath}`);
console.log(`\n📊 Breakdown:`);
const byCategory = {};
const byLevel = {};
const byType = {};

resources.forEach(res => {
  byCategory[res.category] = (byCategory[res.category] || 0) + 1;
  byLevel[res.level] = (byLevel[res.level] || 0) + 1;
  byType[res.type] = (byType[res.type] || 0) + 1;
});

console.log(`\n  By Category:`);
Object.entries(byCategory).forEach(([cat, count]) => {
  console.log(`    ${cat}: ${count}`);
});

console.log(`\n  By Level:`);
Object.entries(byLevel).forEach(([level, count]) => {
  console.log(`    ${level}: ${count}`);
});

console.log(`\n  By Type:`);
Object.entries(byType).forEach(([type, count]) => {
  console.log(`    ${type}: ${count}`);
});

console.log('\n✅ Export complete!\n');

