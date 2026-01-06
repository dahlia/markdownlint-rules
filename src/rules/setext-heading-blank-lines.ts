import type { Rule } from "markdownlint";

/**
 * Configuration options for the setext-heading-blank-lines rule.
 */
export interface SetextHeadingBlankLinesConfig {
  /**
   * Blank lines required before h1 (Setext with =).
   * @default 1
   */
  readonly lines_before_h1?: number;

  /**
   * Blank lines required before h2 (Setext with -).
   * @default 2
   */
  readonly lines_before_h2?: number;
}

/**
 * Enforces blank lines before Setext-style headings.
 *
 * Two blank lines before section headings (h2 with ---) improves document
 * scanability. The document title (h1 with ===) needs less space since it
 * typically appears at the top.
 *
 * @example
 * Correct:
 * ```markdown
 * Document title
 * ==============
 *
 * Introduction paragraph here.
 *
 * First section
 * -------------
 *
 * Section content.
 * ```
 *
 * Incorrect:
 * ```markdown
 * Document title
 * ==============
 *
 * Introduction paragraph here.
 *
 * First section
 * -------------
 *
 * Only one blank line above.
 * ```
 */
const setextHeadingBlankLines: Rule = {
  names: ["setext-heading-blank-lines", "HM004"],
  description:
    "Setext headings should have the required number of blank lines before them",
  tags: ["headings", "blank_lines"],
  parser: "none",
  function: (params, onError) => {
    const config = params.config as SetextHeadingBlankLinesConfig | undefined;
    const linesBeforeH1 = config?.lines_before_h1 ?? 1;
    const linesBeforeH2 = config?.lines_before_h2 ?? 2;

    // Track if we're inside a fenced code block
    let inCodeBlock = false;
    let codeBlockFence = "";
    let codeBlockFenceLength = 0;

    for (let i = 0; i < params.lines.length; i++) {
      const line = params.lines[i];

      // Check for fenced code blocks
      const fenceMatch = /^(\s*)(`{3,}|~{3,})/.exec(line);
      if (fenceMatch != null) {
        const [, , fence] = fenceMatch;
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockFence = fence[0];
          codeBlockFenceLength = fence.length;
        } else if (
          fence[0] === codeBlockFence &&
          fence.length >= codeBlockFenceLength
        ) {
          inCodeBlock = false;
          codeBlockFence = "";
          codeBlockFenceLength = 0;
        }
        continue;
      }

      if (inCodeBlock) continue;

      // Check if current line is a Setext underline
      const setextMatch = /^(=+|-+)\s*$/.exec(line);
      if (setextMatch == null) continue;

      // Make sure the previous line is not empty (valid Setext heading)
      if (i === 0) continue;
      const headingText = params.lines[i - 1];
      if (headingText.trim().length === 0) continue;

      const isH1 = setextMatch[1][0] === "=";
      const level = isH1 ? 1 : 2;
      const requiredBlankLines = isH1 ? linesBeforeH1 : linesBeforeH2;

      // Count blank lines before the heading text
      let blankLineCount = 0;
      for (let j = i - 2; j >= 0; j--) {
        if (params.lines[j].trim().length === 0) {
          blankLineCount++;
        } else {
          break;
        }
      }

      // First heading in document (after front matter) doesn't need blank lines
      if (i - 2 - blankLineCount < 0) continue;

      // Check if we have enough blank lines
      if (blankLineCount < requiredBlankLines) {
        const lineNumber = i; // Line number of heading text (1-based is i)
        const detail =
          `Expected ${requiredBlankLines} blank line(s) before h${level}, ` +
          `found ${blankLineCount}`;

        // Calculate how many blank lines to add
        const linesToAdd = requiredBlankLines - blankLineCount;

        onError({
          lineNumber, // The heading text line (1-based)
          detail,
          context: headingText.trim(),
          fixInfo: {
            lineNumber,
            insertText: "\n".repeat(linesToAdd),
          },
        });
      }
    }
  },
};

export default setextHeadingBlankLines;
