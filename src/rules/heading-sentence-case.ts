import type { Rule } from "markdownlint";

/**
 * Default list of words allowed to be capitalized (proper nouns, etc.).
 */
const DEFAULT_ALLOWED_WORDS: readonly string[] = [
  // Programming languages and technologies
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "Ruby",
  "PHP",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",
  "Scala",
  "Perl",
  "Haskell",
  "Elixir",
  "Erlang",
  "Clojure",
  "Lua",

  // Platforms and tools
  "GitHub",
  "GitLab",
  "Bitbucket",
  "npm",
  "Yarn",
  "Deno",
  "Node",
  "Bun",
  "Docker",
  "Kubernetes",
  "Linux",
  "macOS",
  "Windows",
  "iOS",
  "Android",
  "Unix",

  // Frameworks and libraries
  "React",
  "Vue",
  "Angular",
  "Svelte",
  "Next",
  "Nuxt",
  "Express",
  "Django",
  "Flask",
  "Rails",
  "Laravel",
  "Spring",

  // Databases
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "SQLite",
  "Elasticsearch",

  // Protocols and standards
  "HTTP",
  "HTTPS",
  "HTML",
  "CSS",
  "JSON",
  "XML",
  "YAML",
  "TOML",
  "REST",
  "GraphQL",

  // Companies and products
  "Google",
  "Microsoft",
  "Apple",
  "Amazon",
  "AWS",
  "Azure",
  "OpenAI",

  // Product features/services
  "Actions", // GitHub Actions

  // Misc proper nouns
  "ActivityPub",
  "Fedify",
  "Hollo",
  "BotKit",
  "LogTape",
  "Optique",
  "Upyo",
  "Vertana",
  "Mastodon",
  "Pleroma",
  "Akkoma",
  "Misskey",
  "WebFinger",
  "OAuth",
  "JWT",
];

/**
 * Configuration options for the heading-sentence-case rule.
 */
export interface HeadingSentenceCaseConfig {
  /**
   * List of words allowed to be capitalized (proper nouns, etc.).
   * These are added to the default list.
   */
  readonly allowed_words?: readonly string[];

  /**
   * Whether to ignore all-caps words (acronyms).
   * @default true
   */
  readonly ignore_acronyms?: boolean;
}

/**
 * Warns when headings do not follow sentence case conventions.
 *
 * Sentence case (capitalizing only the first word and proper nouns) is
 * easier to read and more consistent than title case, especially for
 * technical documentation with many proper nouns and acronyms.
 *
 * @example
 * Correct:
 * ```markdown
 * Development commands
 * API reference for JavaScript
 * ```
 *
 * Incorrect:
 * ```markdown
 * Development Commands        # "Commands" should be lowercase
 * Api Reference For Javascript # Multiple violations
 * ```
 */
const headingSentenceCase: Rule = {
  names: ["heading-sentence-case", "HM005"],
  description: "Headings should use sentence case",
  tags: ["headings", "case"],
  parser: "none",
  function: (params, onError) => {
    const config = params.config as HeadingSentenceCaseConfig | undefined;
    const customAllowedWords = config?.allowed_words ?? [];
    const ignoreAcronyms = config?.ignore_acronyms ?? true;

    // Combine default and custom allowed words
    const allowedWords = new Set([
      ...DEFAULT_ALLOWED_WORDS,
      ...customAllowedWords,
    ]);

    // Also add lowercase versions for case-insensitive matching
    const allowedWordsLower = new Set(
      [...allowedWords].map((w) => w.toLowerCase()),
    );

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

      let headingText: string | null = null;
      const lineNumber = i + 1;

      // Check for ATX heading
      const atxMatch = /^(#{1,6})\s+(.*)$/.exec(line);
      if (atxMatch != null) {
        // Remove trailing # from ATX headings
        headingText = atxMatch[2].replace(/\s*#+\s*$/, "").trim();
      }

      // Check for Setext heading
      const nextLine = i + 1 < params.lines.length ? params.lines[i + 1] : "";
      const setextMatch = /^(=+|-+)\s*$/.exec(nextLine);
      if (
        setextMatch != null && line.trim().length > 0 && headingText == null
      ) {
        headingText = line.trim();
      }

      if (headingText == null || headingText.length === 0) continue;

      // Tokenize the heading into words
      // Remove inline code, links, and other markdown formatting first
      const cleanedText = headingText
        .replace(/`[^`]+`/g, "") // Remove inline code
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Replace links with text
        .replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1") // Replace reference links
        .replace(/[*_]+/g, ""); // Remove emphasis markers

      const words = cleanedText.split(/\s+/).filter((w) => w.length > 0);

      if (words.length === 0) continue;

      // Check each word after the first
      const violations: string[] = [];
      for (let j = 1; j < words.length; j++) {
        const word = words[j];

        // Skip punctuation-only tokens
        if (/^[^\p{L}]+$/u.test(word)) continue;

        // Extract the actual word part (strip leading/trailing punctuation)
        const wordMatch = /^[^\p{L}]*(\p{L}+)[^\p{L}]*$/u.exec(word);
        if (wordMatch == null) continue;

        const actualWord = wordMatch[1];

        // Check if word starts with uppercase
        const firstChar = actualWord[0];
        if (firstChar !== firstChar.toUpperCase()) continue;

        // Skip if it's in the allowed words list
        if (allowedWordsLower.has(actualWord.toLowerCase())) continue;

        // Skip acronyms (all caps) if configured
        if (ignoreAcronyms && actualWord === actualWord.toUpperCase()) continue;

        violations.push(actualWord);
      }

      if (violations.length > 0) {
        onError({
          lineNumber,
          detail: `Capitalized word(s) may violate sentence case: ${
            violations.join(", ")
          }`,
          context: headingText,
        });
      }
    }
  },
};

export default headingSentenceCase;
