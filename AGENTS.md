Guidance for LLM-based code agents
===================================

This file provides guidance to LLM-based code agents (e.g., Claude Code,
OpenCode) when working with code in this repository.


Project overview
----------------

This package provides custom markdownlint rules that enforce Hong Minhee's
Markdown style conventions.  The rules extend markdownlint with checks that
cannot be achieved through built-in configuration alone.

The package includes five custom rules:

 -  *HM001*: list-item-marker-space (enforces ` -  ` format)
 -  *HM002*: fenced-code-fence-length (enforces four-character fences)
 -  *HM003*: reference-link-section-placement (links at section end)
 -  *HM004*: setext-heading-blank-lines (two blank lines before h2)
 -  *HM005*: heading-sentence-case (sentence case for headings)


Development commands
--------------------

This is a polyglot package supporting Deno, Node.js, and Bun.
Use [mise] to manage runtime versions.

[mise]: https://mise.jdx.dev/

### Package manager

This project uses Deno as the primary development tool and pnpm for
npm-related tasks (building for npm publishing).

> [!IMPORTANT]
> Do *not* use npm or Yarn as package managers in this project.  Always use
> Deno tasks (`deno task ...`) for development workflows and pnpm
> (`pnpm run ...`) only for npm build tasks.

### Quality checks

~~~~ bash
deno task check  # Type check, lint, format check, and dry-run publish
deno fmt         # Format code
deno lint        # Run linter
~~~~

### Testing

~~~~ bash
deno task test        # Run tests with Deno
deno task test:node   # Run tests with Node.js
deno task test:bun    # Run tests with Bun
~~~~

### Building (for npm publishing)

~~~~ bash
pnpm run build   # Build with tsdown
~~~~


Architecture
------------

### Package structure

 -  *src/index.ts*: Exports all rules as an array
 -  *src/preset.ts*: Exports recommended configuration preset
 -  *src/rules/*: Individual rule implementations with colocated tests
 -  *src/helpers/*: Shared utilities (section parsing, heading utilities)

### Dual publishing

The package is published to both JSR (Deno) and npm (Node.js/Bun):

 -  JSR uses *deno.json* with TypeScript source directly
 -  npm uses *package.json* with tsdown-built *dist/* output (ESM + CJS + .d.ts)


Development practices
---------------------

### Test-driven development

This project follows test-driven development (TDD) practices:

 -  *Write tests first*: Before implementing new functionality, write tests
    that describe the expected behavior.  Confirm that the tests fail before
    proceeding with the implementation.
 -  *Regression tests for bugs*: When fixing bugs, first write a regression
    test that reproduces the bug.  Confirm that the test fails, then fix the
    bug and verify the test passes.

### Commit messages

 -  Do not use Conventional Commits (no `fix:`, `feat:`, etc. prefixes).
    Keep the first line under 50 characters when possible.
 -  Focus on *why* the change was made, not just *what* changed.
 -  When referencing issues or PRs, use permalink URLs instead of just
    numbers (e.g., `#123`).  This preserves context if the repository
    is moved later.
 -  When listing items after a colon, add a blank line after the colon.
 -  When using LLMs or coding agents, include credit via `Co-Authored-By:`.


Code style
----------

### Type safety

 -  All code must be type-safe.  Avoid using the `any` type.
 -  Do not use unsafe type assertions like `as unknown as ...` to bypass
    the type system.
 -  Use the nullish coalescing operator (`??`) instead of the logical OR
    operator (`||`) for default values.

### API documentation

 -  All exported APIs must have JSDoc comments describing their purpose,
    parameters, and return values.
 -  For APIs added in a specific version, include the `@since` tag with the
    version number.

### Testing

 -  Use the `node:test` and `node:assert/strict` APIs to ensure tests run
    across all runtimes (Node.js, Deno, and Bun).
 -  Each rule should have comprehensive tests covering valid cases, invalid
    cases, edge cases, and fix verification where applicable.


Markdown style guide
--------------------

When creating or editing Markdown documentation files in this project,
follow these style conventions to maintain consistency:

### Headings

 -  *Setext-style headings*: Use underline-style for the document title
    (with `=`) and sections (with `-`)
 -  *ATX-style headings*: Use only for subsections within a section
 -  *Heading case*: Use sentence case (capitalize only the first word and
    proper nouns) rather than Title Case

### Text formatting

 -  *Italics* (`*text*`): Use for package names, emphasis, and concepts
 -  *Bold* (`**text**`): Use sparingly for strong emphasis
 -  *Inline code* (`` `code` ``): Use for code spans, function names,
    filenames, and command-line options

### Lists

 -  Use ` -  ` (space-hyphen-two spaces) for unordered list items
 -  Indent nested items with 4 spaces
 -  Align continuation text with the item content

### Code blocks

 -  Use four tildes (`~~~~`) for code fences instead of backticks
 -  Always specify the language identifier

### Links

 -  Use reference-style links placed at the end of each section
 -  Format reference links with consistent spacing

### Spacing and line length

 -  Wrap lines at approximately 80 characters for readability
 -  Use one blank line between sections and major elements
 -  Use two blank lines before Setext-style section headings
 -  Place one blank line before and after code blocks
