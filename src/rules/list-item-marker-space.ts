import type { Rule } from "markdownlint";

/**
 * Configuration options for the list-item-marker-space rule.
 */
export interface ListItemMarkerSpaceConfig {
  /**
   * Number of spaces for each nesting level.
   * @default 4
   */
  readonly nested_indent?: number;

  /**
   * Number of spaces after the marker.
   * @default 2
   */
  readonly post_marker_spaces?: number;
}

/**
 * Enforces the ` -  ` format for unordered list items: exactly one space
 * before the marker at top-level and proper indentation for nested items,
 * with exactly two spaces after the marker.
 *
 * This unusual spacing creates visual alignment where the item content
 * starts at column 5. When list items wrap or contain nested content,
 * the 4-space indentation aligns perfectly with the parent content.
 *
 * @example
 * Correct:
 * ```markdown
 *  -  First item
 *  -  Second item
 *      -  Nested item
 * ```
 *
 * Incorrect:
 * ```markdown
 * - First item          # No leading space, only one space after
 *  - Second item        # Only one space after marker
 *   -  Third item       # Two leading spaces instead of one
 * ```
 */
const listItemMarkerSpace: Rule = {
  names: ["list-item-marker-space", "HM001"],
  description:
    "List items should use ' -  ' format (one space before, two after)",
  tags: ["bullet", "ul", "whitespace"],
  parser: "none",
  function: (params, onError) => {
    const config = params.config as ListItemMarkerSpaceConfig | undefined;
    const nestedIndent = config?.nested_indent ?? 4;
    const postMarkerSpaces = config?.post_marker_spaces ?? 2;

    // Regular expression to match unordered list items
    // Captures: (leading spaces)(marker)(spaces after marker)(content)
    const listItemPattern = /^(\s*)(-|\*|\+)(\s+)(.*)$/;

    for (let i = 0; i < params.lines.length; i++) {
      const line = params.lines[i];
      const match = listItemPattern.exec(line);

      if (match == null) continue;

      const [, leadingSpaces, marker, spacesAfter, content] = match;

      // Skip non-dash markers (we only enforce this for dash)
      if (marker !== "-") continue;

      const lineNumber = i + 1;
      const leadingCount = leadingSpaces.length;
      const spacesAfterCount = spacesAfter.length;

      // Calculate expected leading spaces based on nesting level
      // Top-level: 1 space, nested: 1 + nestedIndent * level
      // Valid leading spaces: 1, 1+4=5, 1+8=9, etc.
      const isValidLeading = leadingCount >= 1 &&
        (leadingCount - 1) % nestedIndent === 0;

      // Calculate the nesting level
      const nestingLevel = isValidLeading
        ? Math.floor((leadingCount - 1) / nestedIndent)
        : 0;
      const expectedLeading = 1 + nestingLevel * nestedIndent;

      // Check leading spaces
      if (!isValidLeading || leadingCount !== expectedLeading) {
        // Determine the correct expected leading based on closest valid value
        let correctedLeading: number;
        if (leadingCount < 1) {
          correctedLeading = 1;
        } else {
          // Find the closest valid indentation level
          const level = Math.round((leadingCount - 1) / nestedIndent);
          correctedLeading = 1 + level * nestedIndent;
        }

        onError({
          lineNumber,
          detail:
            `Expected ${correctedLeading} leading space(s), found ${leadingCount}`,
          context: line.trim(),
          range: [1, leadingCount + 1],
          fixInfo: {
            lineNumber,
            deleteCount: line.length,
            insertText: " ".repeat(correctedLeading) +
              "-" +
              " ".repeat(postMarkerSpaces) +
              content,
          },
        });
        continue;
      }

      // Check post-marker spaces
      if (spacesAfterCount !== postMarkerSpaces) {
        onError({
          lineNumber,
          detail:
            `Expected ${postMarkerSpaces} space(s) after marker, found ${spacesAfterCount}`,
          context: line.trim(),
          range: [leadingCount + 2, spacesAfterCount],
          fixInfo: {
            lineNumber,
            deleteCount: line.length,
            insertText: " ".repeat(leadingCount) +
              "-" +
              " ".repeat(postMarkerSpaces) +
              content,
          },
        });
      }
    }
  },
};

export default listItemMarkerSpace;
