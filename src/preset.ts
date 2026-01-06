/**
 * Recommended configuration preset that combines built-in markdownlint rules
 * with the custom rules from this package.
 *
 * @example
 * ```javascript
 * // .markdownlint-cli2.mjs
 * import customRules from "@hongminhee/markdownlint-rules";
 * import preset from "@hongminhee/markdownlint-rules/preset";
 *
 * export default {
 *   customRules,
 *   config: preset
 * };
 * ```
 *
 * @module
 */

import type { Configuration } from "markdownlint";

/**
 * Recommended markdownlint configuration preset.
 *
 * This preset configures both built-in rules and custom rules to enforce
 * Hong Minhee's Markdown style conventions:
 *
 * Built-in rules enabled:
 * - MD003: setext_with_atx (Setext for h1/h2, ATX for h3+)
 * - MD004: dash (use dash for unordered lists)
 * - MD013: 80-character line length
 * - MD048: tilde (use tildes for code fences)
 *
 * Built-in rules disabled (conflicts with Hong Minhee style):
 * - MD007: conflicts with ' -  ' list style
 * - MD012: conflicts with 2 blank lines before h2
 * - MD022: conflicts with examples in code blocks
 * - MD024: allows duplicate headings in different sections
 * - MD025: allows multiple h1 in examples
 * - MD030: replaced by HM001
 * - MD031: conflicts with examples in code blocks
 * - MD038: allows spaces in code spans like ` -  `
 * - MD040: allows code blocks without language in examples
 * - MD053: allows duplicate link definitions in examples
 * - MD059: allows non-descriptive link text in examples
 *
 * Custom rules (all enabled with defaults):
 * - HM001: list-item-marker-space
 * - HM002: fenced-code-fence-length (4 tildes)
 * - HM003: reference-link-section-placement
 * - HM004: setext-heading-blank-lines (2 blank lines before h2)
 * - HM005: heading-sentence-case
 */
const preset: Configuration = {
  // Built-in rules configuration
  MD003: { style: "setext_with_atx" },
  MD004: { style: "dash" },
  MD007: false, // Disabled: conflicts with ' -  ' list style (HM001)
  MD012: false, // Disabled: conflicts with 2 blank lines before h2 (HM004)
  MD013: { line_length: 80 },
  MD022: false, // Disabled: conflicts with examples in code blocks
  MD024: false, // Disabled: allows duplicate headings in different sections
  MD025: false, // Disabled: allows multiple h1 in examples
  MD030: false, // Disabled: replaced by HM001
  MD031: false, // Disabled: conflicts with examples in code blocks
  MD038: false, // Disabled: allows spaces in code spans like ` -  `
  MD040: false, // Disabled: allows code blocks without language in examples
  MD048: { style: "tilde" },
  MD053: false, // Disabled: allows duplicate link definitions in examples
  MD059: false, // Disabled: allows non-descriptive link text in examples

  // Custom rules configuration
  "list-item-marker-space": true,
  "fenced-code-fence-length": { fence_length: 4 },
  "reference-link-section-placement": true,
  "setext-heading-blank-lines": { lines_before_h2: 2 },
  "heading-sentence-case": true,
};

export default preset;
