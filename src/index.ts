/**
 * Custom markdownlint rules for Hong Minhee's Markdown style.
 *
 * This package provides five custom rules:
 *
 * - **HM001**: list-item-marker-space (enforces ` -  ` format)
 * - **HM002**: fenced-code-fence-length (enforces four-character fences)
 * - **HM003**: reference-link-section-placement (links at section end)
 * - **HM004**: setext-heading-blank-lines (two blank lines before h2)
 * - **HM005**: heading-sentence-case (sentence case for headings)
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

import type { Rule } from "markdownlint";
import listItemMarkerSpace from "./rules/list-item-marker-space.ts";
import fencedCodeFenceLength from "./rules/fenced-code-fence-length.ts";
import referenceLinkSectionPlacement from "./rules/reference-link-section-placement.ts";
import setextHeadingBlankLines from "./rules/setext-heading-blank-lines.ts";
import headingSentenceCase from "./rules/heading-sentence-case.ts";

export {
  fencedCodeFenceLength,
  headingSentenceCase,
  listItemMarkerSpace,
  referenceLinkSectionPlacement,
  setextHeadingBlankLines,
};

export type { ListItemMarkerSpaceConfig } from "./rules/list-item-marker-space.ts";
export type { FencedCodeFenceLengthConfig } from "./rules/fenced-code-fence-length.ts";
export type { SetextHeadingBlankLinesConfig } from "./rules/setext-heading-blank-lines.ts";
export type { HeadingSentenceCaseConfig } from "./rules/heading-sentence-case.ts";

/**
 * Array of all custom rules provided by this package.
 *
 * Use this as the `customRules` option in markdownlint configuration.
 */
const rules: Rule[] = [
  listItemMarkerSpace,
  fencedCodeFenceLength,
  referenceLinkSectionPlacement,
  setextHeadingBlankLines,
  headingSentenceCase,
];

export default rules;
