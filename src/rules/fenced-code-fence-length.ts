import type { Rule } from "markdownlint";

/**
 * Configuration options for the fenced-code-fence-length rule.
 */
export interface FencedCodeFenceLengthConfig {
  /**
   * Minimum number of fence characters required.
   * @default 4
   */
  readonly min_fence_length?: number;
}

/**
 * Enforces that fenced code blocks use tildes with at least the specified
 * number of characters (default: 4), and that opening and closing fences
 * have matching lengths.
 *
 * Using four tildes (`~~~~`) instead of three provides visual distinction
 * and allows embedding triple-tilde blocks inside documentation about
 * Markdown itself.  Longer fences (5+) are allowed for nesting code blocks
 * within documentation.
 *
 * @example
 * Correct (with default min_fence_length: 4):
 * ```markdown
 * ~~~~ typescript
 * const x = 1;
 * ~~~~
 *
 * ~~~~~ markdown
 * Nested example:
 * ~~~~ typescript
 * const y = 2;
 * ~~~~
 * ~~~~~
 * ```
 *
 * Incorrect:
 * ```markdown
 * ``` typescript    # Uses backticks
 * const x = 1;
 * ```
 *
 * ~~~ typescript    # Only three tildes (below minimum)
 * const x = 1;
 * ~~~
 *
 * ~~~~ typescript   # Mismatched fence lengths
 * const x = 1;
 * ~~~~~
 * ```
 */
const fencedCodeFenceLength: Rule = {
  names: ["fenced-code-fence-length", "HM002"],
  description:
    "Fenced code blocks should use tildes with at least the minimum length and matching pairs",
  tags: ["code", "fence"],
  parser: "none",
  function: (params, onError) => {
    const config = params.config as FencedCodeFenceLengthConfig | undefined;
    const minFenceLength = config?.min_fence_length ?? 4;

    // Matches fenced code block opening/closing lines
    // Captures: (leading whitespace)(fence characters)(info string)
    const fencePattern = /^(\s*)(`{3,}|~{3,})(.*)$/;

    let inCodeBlock = false;
    let openingFenceChar = "";
    let openingFenceLength = 0;
    let openingIndent = "";

    for (let i = 0; i < params.lines.length; i++) {
      const line = params.lines[i];
      const match = fencePattern.exec(line);

      if (match == null) continue;

      const [, indent, fence, info] = match;
      const fenceChar = fence[0];
      const actualLength = fence.length;

      if (!inCodeBlock) {
        // Opening fence
        inCodeBlock = true;
        openingFenceChar = fenceChar;
        openingFenceLength = actualLength;
        openingIndent = indent;

        // Check if it's using backticks instead of tildes
        const isBacktick = fenceChar === "`";
        const tooShort = actualLength < minFenceLength;

        if (isBacktick || tooShort) {
          const lineNumber = i + 1;
          let detail: string;

          if (isBacktick && tooShort) {
            detail =
              `Expected at least ${minFenceLength} tildes, found ${actualLength} backticks`;
          } else if (isBacktick) {
            detail = `Expected tildes, found backticks`;
          } else {
            detail =
              `Expected at least ${minFenceLength} tildes, found ${actualLength}`;
          }

          // For fix, use minimum length for too-short fences
          const fixLength = Math.max(actualLength, minFenceLength);

          onError({
            lineNumber,
            detail,
            context: line.trim(),
            range: [indent.length + 1, actualLength],
            fixInfo: {
              lineNumber,
              deleteCount: line.length,
              insertText: indent + "~".repeat(fixLength) + info,
            },
          });
        }
      } else {
        // Closing fence - must match opening fence character, be at same
        // or greater indentation, and have same or greater length
        if (
          fenceChar === openingFenceChar &&
          indent.length >= openingIndent.length &&
          actualLength >= openingFenceLength
        ) {
          inCodeBlock = false;

          const isBacktick = fenceChar === "`";
          const tooShort = actualLength < minFenceLength;
          const mismatchedLength = !tooShort && !isBacktick &&
            actualLength !== openingFenceLength;

          if (isBacktick || tooShort || mismatchedLength) {
            const lineNumber = i + 1;
            let detail: string;

            if (isBacktick && tooShort) {
              detail =
                `Expected at least ${minFenceLength} tildes, found ${actualLength} backticks`;
            } else if (isBacktick) {
              detail = `Expected tildes, found backticks`;
            } else if (tooShort) {
              detail =
                `Expected at least ${minFenceLength} tildes, found ${actualLength}`;
            } else {
              detail =
                `Closing fence length (${actualLength}) does not match opening fence length (${openingFenceLength})`;
            }

            // For fix, match the opening fence length (or minimum if too short)
            const fixLength = Math.max(openingFenceLength, minFenceLength);

            onError({
              lineNumber,
              detail,
              context: line.trim(),
              range: [indent.length + 1, actualLength],
              fixInfo: {
                lineNumber,
                deleteCount: line.length,
                insertText: indent + "~".repeat(fixLength),
              },
            });
          }

          openingFenceChar = "";
          openingFenceLength = 0;
          openingIndent = "";
        }
      }
    }
  },
};

export default fencedCodeFenceLength;
