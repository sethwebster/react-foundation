#!/usr/bin/env node

/**
 * Migration Script: Replace Hardcoded Colors with Semantic Colors
 * 
 * This script systematically replaces hardcoded Tailwind colors with semantic,
 * themeable alternatives throughout the codebase.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color mapping from hardcoded to semantic
const colorMappings = {
  // Background colors
  'bg-white': 'bg-background',
  'bg-black': 'bg-foreground',
  'bg-gray-50': 'bg-muted',
  'bg-gray-100': 'bg-muted',
  'bg-gray-200': 'bg-muted',
  'bg-gray-300': 'bg-muted',
  'bg-gray-400': 'bg-muted',
  'bg-gray-500': 'bg-muted',
  'bg-gray-600': 'bg-muted',
  'bg-gray-700': 'bg-muted',
  'bg-gray-800': 'bg-muted',
  'bg-gray-900': 'bg-muted',
  'bg-slate-50': 'bg-muted',
  'bg-slate-100': 'bg-muted',
  'bg-slate-200': 'bg-muted',
  'bg-slate-300': 'bg-muted',
  'bg-slate-400': 'bg-muted',
  'bg-slate-500': 'bg-muted',
  'bg-slate-600': 'bg-muted',
  'bg-slate-700': 'bg-muted',
  'bg-slate-800': 'bg-muted',
  'bg-slate-900': 'bg-muted',
  'bg-slate-950': 'bg-background',
  'bg-zinc-50': 'bg-muted',
  'bg-zinc-100': 'bg-muted',
  'bg-zinc-200': 'bg-muted',
  'bg-zinc-300': 'bg-muted',
  'bg-zinc-400': 'bg-muted',
  'bg-zinc-500': 'bg-muted',
  'bg-zinc-600': 'bg-muted',
  'bg-zinc-700': 'bg-muted',
  'bg-zinc-800': 'bg-muted',
  'bg-zinc-900': 'bg-muted',
  'bg-zinc-950': 'bg-background',
  'bg-neutral-50': 'bg-muted',
  'bg-neutral-100': 'bg-muted',
  'bg-neutral-200': 'bg-muted',
  'bg-neutral-300': 'bg-muted',
  'bg-neutral-400': 'bg-muted',
  'bg-neutral-500': 'bg-muted',
  'bg-neutral-600': 'bg-muted',
  'bg-neutral-700': 'bg-muted',
  'bg-neutral-800': 'bg-muted',
  'bg-neutral-900': 'bg-muted',
  'bg-neutral-950': 'bg-background',
  'bg-stone-50': 'bg-muted',
  'bg-stone-100': 'bg-muted',
  'bg-stone-200': 'bg-muted',
  'bg-stone-300': 'bg-muted',
  'bg-stone-400': 'bg-muted',
  'bg-stone-500': 'bg-muted',
  'bg-stone-600': 'bg-muted',
  'bg-stone-700': 'bg-muted',
  'bg-stone-800': 'bg-muted',
  'bg-stone-900': 'bg-muted',
  'bg-stone-950': 'bg-background',
  
  // Primary colors
  'bg-blue-50': 'bg-primary/10',
  'bg-blue-100': 'bg-primary/20',
  'bg-blue-200': 'bg-primary/30',
  'bg-blue-300': 'bg-primary/40',
  'bg-blue-400': 'bg-primary/50',
  'bg-blue-500': 'bg-primary',
  'bg-blue-600': 'bg-primary',
  'bg-blue-700': 'bg-primary',
  'bg-blue-800': 'bg-primary',
  'bg-blue-900': 'bg-primary',
  'bg-blue-950': 'bg-primary',
  'bg-sky-50': 'bg-primary/10',
  'bg-sky-100': 'bg-primary/20',
  'bg-sky-200': 'bg-primary/30',
  'bg-sky-300': 'bg-primary/40',
  'bg-sky-400': 'bg-primary/50',
  'bg-sky-500': 'bg-primary',
  'bg-sky-600': 'bg-primary',
  'bg-sky-700': 'bg-primary',
  'bg-sky-800': 'bg-primary',
  'bg-sky-900': 'bg-primary',
  'bg-sky-950': 'bg-primary',
  'bg-indigo-50': 'bg-primary/10',
  'bg-indigo-100': 'bg-primary/20',
  'bg-indigo-200': 'bg-primary/30',
  'bg-indigo-300': 'bg-primary/40',
  'bg-indigo-400': 'bg-primary/50',
  'bg-indigo-500': 'bg-primary',
  'bg-indigo-600': 'bg-primary',
  'bg-indigo-700': 'bg-primary',
  'bg-indigo-800': 'bg-primary',
  'bg-indigo-900': 'bg-primary',
  'bg-indigo-950': 'bg-primary',
  'bg-cyan-50': 'bg-primary/10',
  'bg-cyan-100': 'bg-primary/20',
  'bg-cyan-200': 'bg-primary/30',
  'bg-cyan-300': 'bg-primary/40',
  'bg-cyan-400': 'bg-primary/50',
  'bg-cyan-500': 'bg-primary',
  'bg-cyan-600': 'bg-primary',
  'bg-cyan-700': 'bg-primary',
  'bg-cyan-800': 'bg-primary',
  'bg-cyan-900': 'bg-primary',
  'bg-cyan-950': 'bg-primary',
  
  // Success colors
  'bg-green-50': 'bg-success/10',
  'bg-green-100': 'bg-success/20',
  'bg-green-200': 'bg-success/30',
  'bg-green-300': 'bg-success/40',
  'bg-green-400': 'bg-success/50',
  'bg-green-500': 'bg-success',
  'bg-green-600': 'bg-success',
  'bg-green-700': 'bg-success',
  'bg-green-800': 'bg-success',
  'bg-green-900': 'bg-success',
  'bg-green-950': 'bg-success',
  'bg-emerald-50': 'bg-success/10',
  'bg-emerald-100': 'bg-success/20',
  'bg-emerald-200': 'bg-success/30',
  'bg-emerald-300': 'bg-success/40',
  'bg-emerald-400': 'bg-success/50',
  'bg-emerald-500': 'bg-success',
  'bg-emerald-600': 'bg-success',
  'bg-emerald-700': 'bg-success',
  'bg-emerald-800': 'bg-success',
  'bg-emerald-900': 'bg-success',
  'bg-emerald-950': 'bg-success',
  'bg-lime-50': 'bg-success/10',
  'bg-lime-100': 'bg-success/20',
  'bg-lime-200': 'bg-success/30',
  'bg-lime-300': 'bg-success/40',
  'bg-lime-400': 'bg-success/50',
  'bg-lime-500': 'bg-success',
  'bg-lime-600': 'bg-success',
  'bg-lime-700': 'bg-success',
  'bg-lime-800': 'bg-success',
  'bg-lime-900': 'bg-success',
  'bg-lime-950': 'bg-success',
  'bg-teal-50': 'bg-success/10',
  'bg-teal-100': 'bg-success/20',
  'bg-teal-200': 'bg-success/30',
  'bg-teal-300': 'bg-success/40',
  'bg-teal-400': 'bg-success/50',
  'bg-teal-500': 'bg-success',
  'bg-teal-600': 'bg-success',
  'bg-teal-700': 'bg-success',
  'bg-teal-800': 'bg-success',
  'bg-teal-900': 'bg-success',
  'bg-teal-950': 'bg-success',
  
  // Destructive colors
  'bg-red-50': 'bg-destructive/10',
  'bg-red-100': 'bg-destructive/20',
  'bg-red-200': 'bg-destructive/30',
  'bg-red-300': 'bg-destructive/40',
  'bg-red-400': 'bg-destructive/50',
  'bg-red-500': 'bg-destructive',
  'bg-red-600': 'bg-destructive',
  'bg-red-700': 'bg-destructive',
  'bg-red-800': 'bg-destructive',
  'bg-red-900': 'bg-destructive',
  'bg-red-950': 'bg-destructive',
  'bg-rose-50': 'bg-destructive/10',
  'bg-rose-100': 'bg-destructive/20',
  'bg-rose-200': 'bg-destructive/30',
  'bg-rose-300': 'bg-destructive/40',
  'bg-rose-400': 'bg-destructive/50',
  'bg-rose-500': 'bg-destructive',
  'bg-rose-600': 'bg-destructive',
  'bg-rose-700': 'bg-destructive',
  'bg-rose-800': 'bg-destructive',
  'bg-rose-900': 'bg-destructive',
  'bg-rose-950': 'bg-destructive',
  
  // Warning colors
  'bg-yellow-50': 'bg-warning/10',
  'bg-yellow-100': 'bg-warning/20',
  'bg-yellow-200': 'bg-warning/30',
  'bg-yellow-300': 'bg-warning/40',
  'bg-yellow-400': 'bg-warning/50',
  'bg-yellow-500': 'bg-warning',
  'bg-yellow-600': 'bg-warning',
  'bg-yellow-700': 'bg-warning',
  'bg-yellow-800': 'bg-warning',
  'bg-yellow-900': 'bg-warning',
  'bg-yellow-950': 'bg-warning',
  'bg-amber-50': 'bg-warning/10',
  'bg-amber-100': 'bg-warning/20',
  'bg-amber-200': 'bg-warning/30',
  'bg-amber-300': 'bg-warning/40',
  'bg-amber-400': 'bg-warning/50',
  'bg-amber-500': 'bg-warning',
  'bg-amber-600': 'bg-warning',
  'bg-amber-700': 'bg-warning',
  'bg-amber-800': 'bg-warning',
  'bg-amber-900': 'bg-warning',
  'bg-amber-950': 'bg-warning',
  'bg-orange-50': 'bg-warning/10',
  'bg-orange-100': 'bg-warning/20',
  'bg-orange-200': 'bg-warning/30',
  'bg-orange-300': 'bg-warning/40',
  'bg-orange-400': 'bg-warning/50',
  'bg-orange-500': 'bg-warning',
  'bg-orange-600': 'bg-warning',
  'bg-orange-700': 'bg-warning',
  'bg-orange-800': 'bg-warning',
  'bg-orange-900': 'bg-warning',
  'bg-orange-950': 'bg-warning',
  
  // Accent colors
  'bg-purple-50': 'bg-accent/10',
  'bg-purple-100': 'bg-accent/20',
  'bg-purple-200': 'bg-accent/30',
  'bg-purple-300': 'bg-accent/40',
  'bg-purple-400': 'bg-accent/50',
  'bg-purple-500': 'bg-accent',
  'bg-purple-600': 'bg-accent',
  'bg-purple-700': 'bg-accent',
  'bg-purple-800': 'bg-accent',
  'bg-purple-900': 'bg-accent',
  'bg-purple-950': 'bg-accent',
  'bg-violet-50': 'bg-accent/10',
  'bg-violet-100': 'bg-accent/20',
  'bg-violet-200': 'bg-accent/30',
  'bg-violet-300': 'bg-accent/40',
  'bg-violet-400': 'bg-accent/50',
  'bg-violet-500': 'bg-accent',
  'bg-violet-600': 'bg-accent',
  'bg-violet-700': 'bg-accent',
  'bg-violet-800': 'bg-accent',
  'bg-violet-900': 'bg-accent',
  'bg-violet-950': 'bg-accent',
  'bg-fuchsia-50': 'bg-accent/10',
  'bg-fuchsia-100': 'bg-accent/20',
  'bg-fuchsia-200': 'bg-accent/30',
  'bg-fuchsia-300': 'bg-accent/40',
  'bg-fuchsia-400': 'bg-accent/50',
  'bg-fuchsia-500': 'bg-accent',
  'bg-fuchsia-600': 'bg-accent',
  'bg-fuchsia-700': 'bg-accent',
  'bg-fuchsia-800': 'bg-accent',
  'bg-fuchsia-900': 'bg-accent',
  'bg-fuchsia-950': 'bg-accent',
  'bg-pink-50': 'bg-accent/10',
  'bg-pink-100': 'bg-accent/20',
  'bg-pink-200': 'bg-accent/30',
  'bg-pink-300': 'bg-accent/40',
  'bg-pink-400': 'bg-accent/50',
  'bg-pink-500': 'bg-accent',
  'bg-pink-600': 'bg-accent',
  'bg-pink-700': 'bg-accent',
  'bg-pink-800': 'bg-accent',
  'bg-pink-900': 'bg-accent',
  'bg-pink-950': 'bg-accent',
};

// Text color mappings (similar pattern)
const textColorMappings = {
  'text-white': 'text-foreground',
  'text-black': 'text-foreground',
  'text-gray-50': 'text-muted-foreground',
  'text-gray-100': 'text-muted-foreground',
  'text-gray-200': 'text-muted-foreground',
  'text-gray-300': 'text-muted-foreground',
  'text-gray-400': 'text-muted-foreground',
  'text-gray-500': 'text-muted-foreground',
  'text-gray-600': 'text-muted-foreground',
  'text-gray-700': 'text-foreground',
  'text-gray-800': 'text-foreground',
  'text-gray-900': 'text-foreground',
  'text-slate-50': 'text-muted-foreground',
  'text-slate-100': 'text-muted-foreground',
  'text-slate-200': 'text-muted-foreground',
  'text-slate-300': 'text-muted-foreground',
  'text-slate-400': 'text-muted-foreground',
  'text-slate-500': 'text-muted-foreground',
  'text-slate-600': 'text-muted-foreground',
  'text-slate-700': 'text-foreground',
  'text-slate-800': 'text-foreground',
  'text-slate-900': 'text-foreground',
  'text-slate-950': 'text-foreground',
  'text-blue-500': 'text-primary',
  'text-blue-600': 'text-primary',
  'text-blue-700': 'text-primary',
  'text-sky-500': 'text-primary',
  'text-sky-600': 'text-primary',
  'text-sky-700': 'text-primary',
  'text-indigo-500': 'text-primary',
  'text-indigo-600': 'text-primary',
  'text-indigo-700': 'text-primary',
  'text-cyan-500': 'text-primary',
  'text-cyan-600': 'text-primary',
  'text-cyan-700': 'text-primary',
  'text-green-500': 'text-success',
  'text-green-600': 'text-success',
  'text-green-700': 'text-success',
  'text-emerald-500': 'text-success',
  'text-emerald-600': 'text-success',
  'text-emerald-700': 'text-success',
  'text-red-500': 'text-destructive',
  'text-red-600': 'text-destructive',
  'text-red-700': 'text-destructive',
  'text-rose-500': 'text-destructive',
  'text-rose-600': 'text-destructive',
  'text-rose-700': 'text-destructive',
  'text-yellow-500': 'text-warning',
  'text-yellow-600': 'text-warning',
  'text-yellow-700': 'text-warning',
  'text-amber-500': 'text-warning',
  'text-amber-600': 'text-warning',
  'text-amber-700': 'text-warning',
  'text-purple-500': 'text-accent',
  'text-purple-600': 'text-accent',
  'text-purple-700': 'text-accent',
  'text-violet-500': 'text-accent',
  'text-violet-600': 'text-accent',
  'text-violet-700': 'text-accent',
};

// Border color mappings
const borderColorMappings = {
  'border-white': 'border-border',
  'border-black': 'border-border',
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-border',
  'border-slate-200': 'border-border',
  'border-slate-300': 'border-border',
  'border-blue-500': 'border-primary',
  'border-sky-500': 'border-primary',
  'border-indigo-500': 'border-primary',
  'border-cyan-500': 'border-primary',
  'border-green-500': 'border-success',
  'border-emerald-500': 'border-success',
  'border-red-500': 'border-destructive',
  'border-rose-500': 'border-destructive',
  'border-yellow-500': 'border-warning',
  'border-amber-500': 'border-warning',
  'border-purple-500': 'border-accent',
  'border-violet-500': 'border-accent',
};

// Combine all mappings
const allMappings = {
  ...colorMappings,
  ...textColorMappings,
  ...borderColorMappings,
};

function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Apply all color mappings
    for (const [hardcoded, semantic] of Object.entries(allMappings)) {
      const regex = new RegExp(`\\b${hardcoded}\\b`, 'g');
      if (content.includes(hardcoded)) {
        content = content.replace(regex, semantic);
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Migrated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error.message);
    return false;
  }
}

function findTsxFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function main() {
  console.log('🚀 Starting semantic color migration...\n');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const files = findTsxFiles(srcDir);
  
  let migratedCount = 0;
  let totalFiles = files.length;
  
  console.log(`Found ${totalFiles} files to process...\n`);
  
  for (const file of files) {
    if (migrateFile(file)) {
      migratedCount++;
    }
  }
  
  console.log(`\n✨ Migration complete!`);
  console.log(`📊 Migrated ${migratedCount} out of ${totalFiles} files`);
  
  if (migratedCount > 0) {
    console.log('\n🔍 Next steps:');
    console.log('1. Review the changes');
    console.log('2. Test theme switching');
    console.log('3. Run linting: npm run lint');
    console.log('4. Run tests: npm test');
  }
}

if (require.main === module) {
  main();
}

module.exports = { migrateFile, allMappings };
