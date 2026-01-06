import type { Rule } from "markdownlint";
import {
  findLastContentLine,
  findReferenceLinkDefinitions,
  parseContentBlocks,
} from "../helpers/section-parser.ts";

/**
 * Enforces that reference link definitions appear at the end of their
 * containing content block, not scattered throughout.
 *
 * A content block is the content between one heading and the next heading
 * (of any level).  This means reference links used in introductory content
 * (between a parent heading and its first subheading) should appear before
 * that subheading.
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
 * [intro-link]: https://example.com/intro
 *
 * Intro text with a [link][intro-link].
 *
 * ### Subsection
 *
 * Content here.
 * ```
 */
const referenceLinkSectionPlacement: Rule = {
  names: ["reference-link-section-placement", "HM003"],
  description:
    "Reference link definitions should appear at the end of their content block",
  tags: ["links", "references"],
  parser: "none",
  function: (params, onError) => {
    const blocks = parseContentBlocks(params.lines);

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

      // Check each reference link definition
      for (const refLink of refLinks) {
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
