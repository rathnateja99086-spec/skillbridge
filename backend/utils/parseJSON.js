/**
 * Robustly extract and parse JSON from AI response text
 * Handles cases where the model adds extra text, markdown, or truncates JSON
 */
const extractJSON = (raw) => {
  // Step 1: Remove markdown code blocks
  raw = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // Step 2: Try direct parse first
  try {
    return JSON.parse(raw);
  } catch (_) {}

  // Step 3: Find the first { and last } to extract JSON object
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(raw.slice(start, end + 1));
    } catch (_) {}
  }

  // Step 4: Try to fix truncated JSON by closing open brackets
  try {
    let partial = start !== -1 ? raw.slice(start) : raw;
    // Count open/close braces and brackets
    let braces = 0, brackets = 0;
    let inString = false, escape = false;
    for (const ch of partial) {
      if (escape) { escape = false; continue; }
      if (ch === '\\' && inString) { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === '{') braces++;
      if (ch === '}') braces--;
      if (ch === '[') brackets++;
      if (ch === ']') brackets--;
    }
    // Close any open arrays first, then objects
    let fixed = partial;
    // Remove trailing comma if any
    fixed = fixed.replace(/,\s*$/, '');
    for (let i = 0; i < brackets; i++) fixed += ']';
    for (let i = 0; i < braces; i++) fixed += '}';
    return JSON.parse(fixed);
  } catch (_) {}

  throw new Error('Could not parse AI response as JSON. Please try again.');
};

module.exports = { extractJSON };
