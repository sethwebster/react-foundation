// Test JSX content cleaning
const testInput = `
# Main Title

<RFDS.SemanticCard variant="outlined" className="p-6">
Some content here
</RFDS.SemanticCard>

## Getting Started

Here's a regular paragraph with some text.

<Callout variant="info" title="Important Note">
This is important information.
</Callout>

### Venue Selection

- Item one
- Item two
- Item three

<div className="flex gap-4">
  <span>Some JSX content</span>
</div>

1. First step
2. Second step
3. Third step
`;

// Replicate the cleaning function
function cleanJSXContent(content) {
  let cleaned = content;

  // First, preserve markdown headings by adding markers
  const headings = [];
  let headingIndex = 0;

  cleaned = cleaned.replace(/^(#{1,6}\s+.+)$/gm, (match) => {
    const marker = `__HEADING_${headingIndex}__`;
    headings.push({ marker, original: match });
    headingIndex++;
    return marker;
  });

  // Remove JSX component tags
  cleaned = cleaned.replace(/<[A-Z][A-Za-z0-9.]*(?:\s+[^>]*)?\s*\/?>/g, ' ');
  cleaned = cleaned.replace(/<\/[A-Z][A-Za-z0-9.]*>/g, ' ');

  // Remove standard HTML tags
  cleaned = cleaned.replace(/<\/?[a-z][a-z0-9]*[^>]*>/gi, ' ');

  // Remove JSX expressions
  cleaned = cleaned.replace(/\{[^}]*\}/g, ' ');

  // Remove attributes
  cleaned = cleaned.replace(/className="[^"]*"/g, '');
  cleaned = cleaned.replace(/\w+="[^"]*"/g, '');

  // Restore markdown headings
  headings.forEach(({ marker, original }) => {
    cleaned = cleaned.replace(marker, '\n\n' + original + '\n');
  });

  // Preserve markdown list structure
  cleaned = cleaned.replace(/^(\s*[-*+]\s+)/gm, '\n$1');

  // Preserve numbered lists
  cleaned = cleaned.replace(/^(\s*\d+\.\s+)/gm, '\n$1');

  // Clean up multiple spaces
  cleaned = cleaned.replace(/ +/g, ' ');

  // Clean up excessive newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Clean up spaces around punctuation
  cleaned = cleaned.replace(/\s+([.,;!?])/g, '$1');

  return cleaned.trim();
}

console.log('=== INPUT ===');
console.log(testInput);
console.log('\n=== OUTPUT ===');
console.log(cleanJSXContent(testInput));
console.log('\n=== ANALYSIS ===');

const output = cleanJSXContent(testInput);
const checks = {
  'Preserves main heading': output.includes('# Main Title'),
  'Preserves section heading': output.includes('## Getting Started'),
  'Preserves subsection heading': output.includes('### Venue Selection'),
  'Removes JSX components': !output.includes('<RFDS.'),
  'Removes HTML tags': !output.includes('<div'),
  'Preserves bullet lists': output.includes('- Item one'),
  'Preserves numbered lists': output.includes('1. First step'),
  'Removes className': !output.includes('className='),
  'Keeps readable content': output.includes('Some content here'),
};

console.log('Checks:');
Object.entries(checks).forEach(([check, passed]) => {
  console.log(`  ${passed ? '✅' : '❌'} ${check}`);
});

const allPassed = Object.values(checks).every(v => v);
console.log(`\n${allPassed ? '✅ All checks passed!' : '❌ Some checks failed'}`);
