import type { Rule } from "markdownlint";

/**
 * Configuration options for the fenced-code-fence-length rule.
 */
export interface FencedCodeFenceLengthConfig {
  /**
   * Required number of fence characters.
   * @default 4
   */
  readonly fence_length?: number;
}

/**
 * Enforces that fenced code blocks use exactly the specified number of
 * fence characters (default: 4).
 *
 * Using four tildes (`~~~~`) instead of three provides visual distinction
 * and allows embedding triple-tilde blocks inside documentation about
 * Markdown itself.
 *
 * @example
 * Correct (with default fence_length: 4):
 * ```markdown
 * ~~~~ typescript
 * const x = 1;
 * ~~~~
 * ```
 *
 * Incorrect:
 * ```markdown
 * ``` typescript    # Uses backticks
 * const x = 1;
 * ```
 *
 * ~~~ typescript    # Only three tildes
 * const x = 1;
 * ~~~
 * ```
 */
const fencedCodeFenceLength: Rule = {
  names: ["fenced-code-fence-length", "HM002"],
  description: "Fenced code blocks should use the specified fence length",
  tags: ["code", "fence"],
  parser: "none",
  function: (params, onError) => {
    const config = params.config as FencedCodeFenceLengthConfig | undefined;
    const fenceLength = config?.fence_length ?? 4;

    // Matches fenced code block opening/closing lines
    // Captures: (leading whitespace)(fence characters)(info string)
    const fencePattern = /^(\s*)(`{3,}|~{3,})(.*)$/;

    let inCodeBlock = false;
    let openingFence = "";
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
        openingFence = fenceChar;
        openingIndent = indent;

        // Check if it's using backticks instead of tildes
        const isBacktick = fenceChar === "`";
        const wrongLength = actualLength !== fenceLength;

        if (isBacktick || wrongLength) {
          const lineNumber = i + 1;
          let detail: string;

          if (isBacktick && wrongLength) {
            detail =
              `Expected ${fenceLength} tildes, found ${actualLength} backticks`;
          } else if (isBacktick) {
            detail = `Expected tildes, found backticks`;
          } else {
            detail = `Expected ${fenceLength} tildes, found ${actualLength}`;
          }

          onError({
            lineNumber,
            detail,
            context: line.trim(),
            range: [indent.length + 1, actualLength],
            fixInfo: {
              lineNumber,
              deleteCount: line.length,
              insertText: indent + "~".repeat(fenceLength) + info,
            },
          });
        }
      } else {
        // Closing fence - must match opening fence character and be at same
        // or greater indentation
        if (
          fenceChar === openingFence &&
          indent.length >= openingIndent.length
        ) {
          inCodeBlock = false;

          // Check if closing fence needs fixing
          const isBacktick = fenceChar === "`";
          const wrongLength = actualLength !== fenceLength;

          if (isBacktick || wrongLength) {
            const lineNumber = i + 1;
            let detail: string;

            if (isBacktick && wrongLength) {
              detail =
                `Expected ${fenceLength} tildes, found ${actualLength} backticks`;
            } else if (isBacktick) {
              detail = `Expected tildes, found backticks`;
            } else {
              detail = `Expected ${fenceLength} tildes, found ${actualLength}`;
            }

            onError({
              lineNumber,
              detail,
              context: line.trim(),
              range: [indent.length + 1, actualLength],
              fixInfo: {
                lineNumber,
                deleteCount: line.length,
                insertText: indent + "~".repeat(fenceLength),
              },
            });
          }

          openingFence = "";
          openingIndent = "";
        }
      }
    }
  },
};

export default fencedCodeFenceLength;
