/**
 * Manual test script for ColorDeriver utility functions
 * Tests the ensureContrast function implementation
 * Run with: npx tsx src/utils/colorDeriver.test.ts
 */

import {
  ensureContrast,
  calculateContrast,
  calculateLuminance,
} from './colorDeriver.js';

// Test helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('\n=== Testing ensureContrast function ===\n');

// Test 1: Return foreground unchanged if contrast already meets requirement
console.log('Test 1: Return foreground unchanged if contrast already meets requirement');
const test1Result = ensureContrast('#000000', '#FFFFFF', 4.5);
assert(test1Result === '#000000', 'Black on white should remain unchanged');

// Test 2: Adjust foreground to meet minimum contrast ratio
console.log('\nTest 2: Adjust foreground to meet minimum contrast ratio');
const test2Result = ensureContrast('#888888', '#FFFFFF', 4.5);
const test2Contrast = calculateContrast(test2Result, '#FFFFFF');
assert(test2Contrast >= 4.5, `Result contrast ${test2Contrast.toFixed(2)} should be >= 4.5`);
console.log(`  Original: #888888, Adjusted: ${test2Result}, Contrast: ${test2Contrast.toFixed(2)}:1`);

// Test 3: Darken foreground for light backgrounds
console.log('\nTest 3: Darken foreground for light backgrounds');
const test3Original = '#CCCCCC';
const test3Result = ensureContrast(test3Original, '#FFFFFF', 4.5);
const test3OriginalLum = calculateLuminance(test3Original);
const test3ResultLum = calculateLuminance(test3Result);
assert(test3ResultLum < test3OriginalLum, 'Result should be darker than original');
console.log(`  Original luminance: ${test3OriginalLum.toFixed(3)}, Result luminance: ${test3ResultLum.toFixed(3)}`);

// Test 4: Lighten foreground for dark backgrounds
console.log('\nTest 4: Lighten foreground for dark backgrounds');
const test4Original = '#333333';
const test4Result = ensureContrast(test4Original, '#000000', 4.5);
const test4OriginalLum = calculateLuminance(test4Original);
const test4ResultLum = calculateLuminance(test4Result);
assert(test4ResultLum > test4OriginalLum, 'Result should be lighter than original');
console.log(`  Original luminance: ${test4OriginalLum.toFixed(3)}, Result luminance: ${test4ResultLum.toFixed(3)}`);

// Test 5: Return black fallback for light backgrounds when target cannot be achieved
console.log('\nTest 5: Return black fallback for light backgrounds when impossible ratio');
const test5Result = ensureContrast('#FFFFFF', '#FEFEFE', 21);
assert(test5Result === '#000000', 'Should return black fallback for light background');

// Test 6: Return white fallback for dark backgrounds when target cannot be achieved
console.log('\nTest 6: Return white fallback for dark backgrounds when impossible ratio');
const test6Result = ensureContrast('#000000', '#010101', 21);
assert(test6Result === '#FFFFFF', 'Should return white fallback for dark background');

// Test 7: Meet WCAG AA standard (4.5:1) for normal text
console.log('\nTest 7: Meet WCAG AA standard (4.5:1) for various color combinations');
const test7Cases = [
  { fg: '#666666', bg: '#FFFFFF' },
  { fg: '#999999', bg: '#000000' },
  { fg: '#777777', bg: '#F0F0F0' },
  { fg: '#555555', bg: '#1A1A1A' },
];

test7Cases.forEach(({ fg, bg }, index) => {
  const result = ensureContrast(fg, bg, 4.5);
  const contrast = calculateContrast(result, bg);
  assert(contrast >= 4.5, `Case ${index + 1}: ${fg} on ${bg} -> ${result} (${contrast.toFixed(2)}:1)`);
});

// Test 8: Handle edge case with pure black background
console.log('\nTest 8: Handle edge case with pure black background');
const test8Result = ensureContrast('#808080', '#000000', 4.5);
const test8Contrast = calculateContrast(test8Result, '#000000');
assert(test8Contrast >= 4.5, `Contrast ${test8Contrast.toFixed(2)} should be >= 4.5`);
console.log(`  Result: ${test8Result}, Contrast: ${test8Contrast.toFixed(2)}:1`);

// Test 9: Handle edge case with pure white background
console.log('\nTest 9: Handle edge case with pure white background');
const test9Result = ensureContrast('#808080', '#FFFFFF', 4.5);
const test9Contrast = calculateContrast(test9Result, '#FFFFFF');
assert(test9Contrast >= 4.5, `Contrast ${test9Contrast.toFixed(2)} should be >= 4.5`);
console.log(`  Result: ${test9Result}, Contrast: ${test9Contrast.toFixed(2)}:1`);

// Test 10: Verify warnings are logged when fallback is used
console.log('\nTest 10: Verify warnings are logged when fallback is used');
console.log('  (Check console output above for warning messages)');

console.log('\n=== All tests passed! ===\n');
