import type { Rule } from "markdownlint";
import {
  type ContentBlock,
  findLastContentLine,
  findReferenceLinkDefinitions,
  findReferenceLinkUsages,
  parseContentBlocks,
} from "../helpers/section-parser.ts";

/**
 * Enforces that reference link definitions appear at the end of the content
 * block where they are used, not scattered throughout or in different blocks.
 *
 * A content block is the content between one heading and the next heading
 * (of any level).  This means reference links used in introductory content
 * (between a parent heading and its first subheading) should appear before
 * that subheading, not after it.
 *
 * Placing reference links at content block end keeps related content together.
 * When a section is moved or extracted, its links travel with it.
 * This improves maintainability compared to a single block at document end.
 *
 * @example
 * Correct:
 * ```markdown
 * Some section
 * ------------
 *
 * Intro text with a [link][intro-link].
 *
 * [intro-link]: https://example.com/intro
 *
 * ### Subsection
 *
 * Content with another [link][sub-link].
 *
 * [sub-link]: https://example.com/sub
 *
 * Another section
 * ---------------
 *
 * More content here.
 * ```
 *
 * Incorrect:
 * ```markdown
 * Some section
 * ------------
 *
 * Intro text with a [link][intro-link].
 *
 * ### Subsection
 *
 * Content here.
 *
 * [intro-link]: https://example.com/intro
 * ```
 */
const referenceLinkSectionPlacement: Rule = {
  names: ["reference-link-section-placement", "HM003"],
  description:
    "Reference link definitions should appear at the end of the content block where they are used",
  tags: ["links", "references"],
  parser: "none",
  function: (params, onError) => {
    const blocks = parseContentBlocks(params.lines);

    // Build a map of which block each label is used in (first usage)
    const labelUsageBlock = new Map<string, ContentBlock>();
    for (const block of blocks) {
      const usages = findReferenceLinkUsages(
        params.lines,
        block.startLine,
        block.endLine,
      );
      for (const usage of usages) {
        // Only record the first usage of each label
        if (!labelUsageBlock.has(usage.label)) {
          labelUsageBlock.set(usage.label, block);
        }
      }
    }

    // Check each block's reference link definitions
    for (const block of blocks) {
      const refLinks = findReferenceLinkDefinitions(
        params.lines,
        block.startLine,
        block.endLine,
      );

      if (refLinks.length === 0) continue;

      const lastContentLine = findLastContentLine(
        params.lines,
        block.startLine,
        block.endLine,
      );

      for (const refLink of refLinks) {
        const label = refLink.label.toLowerCase();
        const usageBlock = labelUsageBlock.get(label);

        // Check if definition is in a different block than usage
        if (
          usageBlock != null &&
          (usageBlock.startLine !== block.startLine ||
            usageBlock.endLine !== block.endLine)
        ) {
          onError({
            lineNumber: refLink.lineNumber,
            detail:
              `Reference link definition for "${refLink.label}" should be in the same content block where it is used`,
            context: params.lines[refLink.lineNumber - 1].trim(),
          });
          continue;
        }

        // Check if definition is before content ends in its block
        if (refLink.lineNumber < lastContentLine) {
          onError({
            lineNumber: refLink.lineNumber,
            detail:
              `Reference link definition for "${refLink.label}" should be at content block end`,
            context: params.lines[refLink.lineNumber - 1].trim(),
          });
        }
      }
    }
  },
};

export default referenceLinkSectionPlacement;
