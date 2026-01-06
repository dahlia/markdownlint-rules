/**
 * Represents a section in a Markdown document.
 */
export interface Section {
  /**
   * The heading level (1 for h1, 2 for h2, etc.).
   * 0 indicates content before the first heading.
   */
  readonly level: number;

  /**
   * The heading text (empty string for pre-heading content).
   */
  readonly heading: string;

  /**
   * 1-based line number where the section starts.
   * For Setext headings, this is the line with the heading text.
   * For ATX headings, this is the line with the # symbols.
   */
  readonly startLine: number;

  /**
   * 1-based line number where the section ends (inclusive).
   */
  readonly endLine: number;

  /**
   * Whether the heading uses Setext style (underline).
   */
  readonly isSetext: boolean;
}

/**
 * Represents a content block in a Markdown document.
 * A content block is the content between one heading and the next heading
 * (of any level).
 */
export interface ContentBlock {
  /**
   * 1-based line number where the content block starts.
   * This is the line after the heading (or line 1 for content before
   * first heading).
   */
  readonly startLine: number;

  /**
   * 1-based line number where the content block ends (inclusive).
   * This is the line before the next heading.
   */
  readonly endLine: number;
}

/**
 * Parses a Markdown document into sections based on headings.
 *
 * @param lines - Array of lines in the document
 * @param sectionLevel - Heading level that defines section boundaries (default: 2)
 * @returns Array of sections
 */
export function parseSections(
  lines: readonly string[],
  sectionLevel = 2,
): Section[] {
  const sections: Section[] = [];
  let currentSection: Section | null = null;

  // Track if we're inside a fenced code block
  let inCodeBlock = false;
  let codeBlockFence = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : "";

    // Check for fenced code blocks
    const fenceMatch = /^(\s*)(`{3,}|~{3,})/.exec(line);
    if (fenceMatch != null) {
      const [, , fence] = fenceMatch;
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockFence = fence[0];
      } else if (line.trim().startsWith(codeBlockFence.repeat(3))) {
        inCodeBlock = false;
        codeBlockFence = "";
      }
      continue;
    }

    if (inCodeBlock) continue;

    // Check for Setext heading (level 1 or 2)
    const setextMatch = /^(=+|-+)\s*$/.exec(nextLine);
    if (setextMatch != null && line.trim().length > 0) {
      const level = setextMatch[1][0] === "=" ? 1 : 2;

      if (level <= sectionLevel) {
        // Close previous section
        if (currentSection != null) {
          sections.push({
            ...currentSection,
            endLine: i, // Line before this heading
          });
        } else if (i > 0) {
          // Content before first heading
          sections.push({
            level: 0,
            heading: "",
            startLine: 1,
            endLine: i,
            isSetext: false,
          });
        }

        // Start new section
        currentSection = {
          level,
          heading: line.trim(),
          startLine: i + 1, // 1-based
          endLine: -1, // Will be set when section ends
          isSetext: true,
        };

        // Skip the underline
        i++;
        continue;
      }
    }

    // Check for ATX heading
    const atxMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (atxMatch != null) {
      const level = atxMatch[1].length;

      if (level <= sectionLevel) {
        // Close previous section
        if (currentSection != null) {
          sections.push({
            ...currentSection,
            endLine: i, // Line before this heading
          });
        } else if (i > 0) {
          // Content before first heading
          sections.push({
            level: 0,
            heading: "",
            startLine: 1,
            endLine: i,
            isSetext: false,
          });
        }

        // Start new section
        currentSection = {
          level,
          heading: atxMatch[2].replace(/\s*#+\s*$/, "").trim(),
          startLine: i + 1, // 1-based
          endLine: -1, // Will be set when section ends
          isSetext: false,
        };
        continue;
      }
    }
  }

  // Close the last section
  if (currentSection != null) {
    sections.push({
      ...currentSection,
      endLine: lines.length,
    });
  } else if (lines.length > 0) {
    // Document has no headings
    sections.push({
      level: 0,
      heading: "",
      startLine: 1,
      endLine: lines.length,
      isSetext: false,
    });
  }

  return sections;
}

/**
 * Parses a Markdown document into content blocks.
 * Each content block spans from after one heading to before the next heading
 * (of any level). This is useful for determining where reference links
 * should be placed.
 *
 * @param lines - Array of lines in the document
 * @returns Array of content blocks
 */
export function parseContentBlocks(lines: readonly string[]): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let blockStartLine = 1;

  // Track if we're inside a fenced code block
  let inCodeBlock = false;
  let codeBlockFence = "";
  let codeBlockFenceLength = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : "";

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

    // Check for Setext heading (any level)
    const setextMatch = /^(=+|-+)\s*$/.exec(nextLine);
    if (setextMatch != null && line.trim().length > 0) {
      // Found a heading - close current block if it has content
      if (i > blockStartLine - 1) {
        blocks.push({
          startLine: blockStartLine,
          endLine: i, // Line before the heading text (0-based i = line i+1)
        });
      }

      // Next block starts after the underline
      blockStartLine = i + 3; // Skip heading text line and underline

      // Skip the underline
      i++;
      continue;
    }

    // Check for ATX heading (any level)
    const atxMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (atxMatch != null) {
      // Found a heading - close current block if it has content
      if (i > blockStartLine - 1) {
        blocks.push({
          startLine: blockStartLine,
          endLine: i, // Line before the heading (0-based i = line i+1)
        });
      }

      // Next block starts after the heading
      blockStartLine = i + 2; // 1-based, after the heading line
      continue;
    }
  }

  // Close the last block
  if (blockStartLine <= lines.length) {
    blocks.push({
      startLine: blockStartLine,
      endLine: lines.length,
    });
  }

  return blocks;
}

/**
 * Identifies which lines are inside fenced code blocks.
 *
 * @param lines - Array of lines in the document
 * @returns Set of 0-based line indices that are inside code blocks
 */
function findCodeBlockLines(lines: readonly string[]): Set<number> {
  const codeBlockLines = new Set<number>();
  let inCodeBlock = false;
  let codeBlockFence = "";
  let codeBlockFenceLength = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fenceMatch = /^(\s*)(`{3,}|~{3,})/.exec(line);

    if (fenceMatch != null) {
      const [, , fence] = fenceMatch;
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockFence = fence[0];
        codeBlockFenceLength = fence.length;
        codeBlockLines.add(i);
      } else if (
        fence[0] === codeBlockFence &&
        fence.length >= codeBlockFenceLength
      ) {
        codeBlockLines.add(i);
        inCodeBlock = false;
        codeBlockFence = "";
        codeBlockFenceLength = 0;
      } else {
        codeBlockLines.add(i);
      }
    } else if (inCodeBlock) {
      codeBlockLines.add(i);
    }
  }

  return codeBlockLines;
}

/**
 * Finds the line number of the last non-blank, non-reference-link line
 * in a range, excluding lines inside code blocks.
 *
 * @param lines - Array of lines in the document
 * @param startLine - 1-based start line
 * @param endLine - 1-based end line
 * @returns 1-based line number, or 0 if no content found
 */
export function findLastContentLine(
  lines: readonly string[],
  startLine: number,
  endLine: number,
): number {
  const refLinkPattern = /^\s*\[.+\]:\s+\S+/;
  const codeBlockLines = findCodeBlockLines(lines);

  for (let i = endLine - 1; i >= startLine - 1; i--) {
    // Skip lines inside code blocks
    if (codeBlockLines.has(i)) continue;

    const line = lines[i];
    const trimmed = line.trim();

    // Skip blank lines
    if (trimmed.length === 0) continue;

    // Skip reference link definitions
    if (refLinkPattern.test(line)) continue;

    return i + 1; // Convert to 1-based
  }

  return 0;
}

/**
 * Finds all reference link definitions in a range, excluding those
 * inside code blocks.
 *
 * @param lines - Array of lines in the document
 * @param startLine - 1-based start line
 * @param endLine - 1-based end line
 * @returns Array of objects with lineNumber and label
 */
export function findReferenceLinkDefinitions(
  lines: readonly string[],
  startLine: number,
  endLine: number,
): Array<{ lineNumber: number; label: string }> {
  const results: Array<{ lineNumber: number; label: string }> = [];
  const refLinkPattern = /^\s*\[([^\]]+)\]:\s+\S+/;
  const codeBlockLines = findCodeBlockLines(lines);

  for (let i = startLine - 1; i < endLine; i++) {
    // Skip lines inside code blocks
    if (codeBlockLines.has(i)) continue;

    const match = refLinkPattern.exec(lines[i]);
    if (match != null) {
      results.push({
        lineNumber: i + 1, // Convert to 1-based
        label: match[1],
      });
    }
  }

  return results;
}

/**
 * Finds all reference link usages in a range, excluding those inside code
 * blocks. This includes both full reference links `[text][label]` and
 * shortcut reference links `[label]`.
 *
 * @param lines - Array of lines in the document
 * @param startLine - 1-based start line
 * @param endLine - 1-based end line
 * @returns Array of objects with lineNumber and label (lowercase)
 */
export function findReferenceLinkUsages(
  lines: readonly string[],
  startLine: number,
  endLine: number,
): Array<{ lineNumber: number; label: string }> {
  const results: Array<{ lineNumber: number; label: string }> = [];
  const codeBlockLines = findCodeBlockLines(lines);

  // Patterns for reference links:
  // - Full reference: [text][label]
  // - Collapsed reference: [label][]
  // - Shortcut reference: [label] (not followed by : or ()
  // We need to avoid matching reference definitions [label]: url
  const fullRefPattern = /\[[^\]]+\]\[([^\]]+)\]/g;
  const shortcutRefPattern = /\[([^\]]+)\](?!\s*[:\[(])/g;

  for (let i = startLine - 1; i < endLine; i++) {
    // Skip lines inside code blocks
    if (codeBlockLines.has(i)) continue;

    const line = lines[i];

    // Skip reference link definitions
    if (/^\s*\[[^\]]+\]:\s+\S+/.test(line)) continue;

    // Find full reference links [text][label]
    let match: RegExpExecArray | null;
    fullRefPattern.lastIndex = 0;
    while ((match = fullRefPattern.exec(line)) != null) {
      results.push({
        lineNumber: i + 1,
        label: match[1].toLowerCase(),
      });
    }

    // Find shortcut/collapsed reference links [label]
    shortcutRefPattern.lastIndex = 0;
    while ((match = shortcutRefPattern.exec(line)) != null) {
      // Skip if this looks like it's inside a full reference (already captured)
      // or if it's an image reference ![label]
      const beforeMatch = line.slice(0, match.index);
      if (beforeMatch.endsWith("[") || beforeMatch.endsWith("!")) continue;

      results.push({
        lineNumber: i + 1,
        label: match[1].toLowerCase(),
      });
    }
  }

  return results;
}
