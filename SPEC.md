Specification: @hongminhee/markdownlint-rules
=============================================

This document describes a planned markdownlint plugin that enforces Hong
Minhee's Markdown style conventions.  The plugin extends markdownlint with
custom rules that cannot be achieved through built-in configuration alone.


Background
----------

Hong Minhee maintains a distinctive Markdown style that combines several
uncommon conventions.  This style is used across multiple projects including
[Fedify], [Hollo], [Vertana], and others.  While markdownlint provides
extensive configuration options, certain aspects of this style require custom
rules to enforce mechanically.

This specification covers:

 -  Analysis of which style requirements can use built-in markdownlint
    configuration
 -  Detailed design for custom rules that address gaps
 -  Implementation approach and project structure

[Fedify]: https://github.com/dahlia/fedify
[Hollo]: https://github.com/dahlia/hollo
[Vertana]: https://github.com/dahlia/vertana


Style guide summary
-------------------

The following conventions are documented in [Vertana's AGENTS.md] file as a
representative example:

[Vertana's AGENTS.md]: https://github.com/dahlia/vertana/blob/main/AGENTS.md

### Headings

 -  Setext-style headings for document title (`===`) and sections (`---`)
 -  ATX-style headings (`###`) only for subsections within a section
 -  Sentence case (capitalize only the first word and proper nouns)

### Text formatting

 -  Italics (`*text*`) for package names, emphasis, and concepts
 -  Bold (`**text**`) used sparingly for strong emphasis
 -  Inline code for code spans, function names, filenames, and options

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

 -  Wrap lines at approximately 80 characters
 -  One blank line between sections and major elements
 -  Two blank lines before Setext-style section headings
 -  One blank line before and after code blocks


Coverage analysis
-----------------

This section analyzes which style requirements can be addressed by built-in
markdownlint rules versus custom rules.

### Achievable with built-in configuration

The following can be enforced using standard markdownlint settings:

| Requirement                  | Rule  | Configuration                    |
| ---------------------------- | ----- | -------------------------------- |
| Setext + ATX headings        | MD003 | `style: "setext_with_atx"`       |
| Code fence character (tilde) | MD048 | `style: "tilde"`                 |
| List marker (dash)           | MD004 | `style: "dash"`                  |
| Line length                  | MD013 | `line_length: 80`                |
| List indentation             | MD007 | `indent: 4`                      |
| Blanks around code blocks    | MD031 | (enabled by default)             |
| Blanks around headings       | MD022 | `lines_above: 1, lines_below: 1` |
| Code block language          | MD040 | (enabled by default)             |

### Requires custom rules

The following requirements cannot be achieved with built-in configuration:

| Requirement                      | Reason                              |
| -------------------------------- | ----------------------------------- |
| List marker format ` -  `        | MD030 controls post-marker spacing  |
|                                  | but not pre-marker spacing          |
| Code fence length (4 tildes)     | MD048 only checks tilde vs backtick |
| Reference links at section end   | No built-in rule exists             |
| Two blank lines before Setext h2 | MD022 cannot distinguish by style   |
| Sentence case in headings        | No built-in rule exists             |


Custom rule specifications
--------------------------

### HM001: list-item-marker-space

Enforces the ` -  ` format for unordered list items: exactly one space before
the marker and exactly two spaces after.

#### Rationale

This unusual spacing creates visual alignment where the item content starts at
column 5.  When list items wrap or contain nested content, the 4-space
indentation aligns perfectly with the parent content.

#### Detection logic

~~~~ text
For each line in the document:
  If line matches unordered list item pattern:
    Extract leading_spaces, marker, post_marker_spaces
    If marker is "-":
      If leading_spaces != 1 (for top-level) or != 5 (for nested):
        Report error
      If post_marker_spaces != 2:
        Report error
~~~~

#### Parameters

`nested_indent` : Number of spaces for each nesting level.  Default: `4`

`post_marker_spaces` : Number of spaces after the marker.  Default: `2`

#### Examples

Correct:

~~~~ markdown
 -  First item
 -  Second item
     -  Nested item
~~~~

Incorrect:

<!-- markdownlint-disable list-item-marker-space -->
~~~~ markdown
- First item          # No leading space, only one space after
 - Second item        # Only one space after marker
  -  Third item       # Two leading spaces instead of one
~~~~
<!-- markdownlint-enable list-item-marker-space -->

#### Fix information

The rule provides `fixInfo` to automatically correct spacing:

 -  Adjust leading spaces to match expected indentation
 -  Adjust post-marker spaces to exactly 2

---

### HM002: fenced-code-fence-length

Enforces that fenced code blocks use exactly four fence characters.

#### Rationale

Using four tildes (`~~~~`) instead of three provides visual distinction and
allows embedding triple-tilde blocks inside documentation about Markdown
itself.

#### Detection logic

~~~~ text
For each fenced code block token:
  Extract fence_length from token metadata
  If fence_length != 4:
    Report error with current length in detail
~~~~

#### Parameters

`fence_length` : Required number of fence characters.  Default: `4`

#### Examples

Correct:

~~~~ markdown
~~~~ typescript
const x = 1;
~~~~
~~~~

Incorrect:

<!-- markdownlint-disable fenced-code-fence-length -->
~~~~~ markdown
``` typescript    # Uses backticks
const x = 1;
```

~~~ typescript    # Only three tildes
const x = 1;
~~~
~~~~~
<!-- markdownlint-enable fenced-code-fence-length -->

#### Fix information

The rule provides `fixInfo` to:

 -  Replace backticks with tildes
 -  Adjust fence length to exactly 4 characters

---

### HM003: reference-link-section-placement

Enforces that reference link definitions appear at the end of their containing
section, not at the end of the document.

#### Rationale

Placing reference links at section end keeps related content together.  When a
section is moved or extracted, its links travel with it.  This improves
maintainability compared to a single block at document end.

#### Detection logic

~~~~ text
Parse document into sections (split by Setext or ATX h2 headings)
For each section:
  Find all reference link definitions in section
  Find last non-blank, non-reference-link line in section
  For each reference definition:
    If definition appears before last content line:
      Report error
~~~~

#### Parameters

`section_level` : Heading level that defines section boundaries.  Default: `2`

#### Examples

Correct:

~~~~ markdown
Some section
------------

Here is some text with a [link][example].

[example]: https://example.com/


Another section
---------------

More content here.
~~~~

Incorrect:

~~~~ markdown
Some section
------------

[example]: https://example.com/

Here is some text with a [link][example].
~~~~

#### Fix information

This rule does not provide automatic fixing due to the complexity of
determining correct placement.  Manual intervention is required.

---

### HM004: setext-heading-blank-lines

Enforces two blank lines before Setext-style section headings (level 2) and
one blank line before the document title (level 1).

#### Rationale

Extra vertical space before major sections improves document scanability.  The
document title needs less space since it appears at the top.

#### Detection logic

~~~~ text
For each Setext heading:
  Count blank lines immediately preceding the heading text
  If previous non-blank content is a parent heading (higher level):
    Skip blank line check (no extra spacing needed)
  If heading level is 1:
    If blank_lines < 1 and not at document start:
      Report error
  If heading level is 2:
    If blank_lines < 2:
      Report error
~~~~

> [!NOTE]
> When a heading immediately follows a parent heading with no content between
> them, the blank line requirement is waived.  For example, an h2 directly
> after an h1 only needs one blank line (the standard paragraph separation),
> not two.

#### Parameters

`lines_before_h1` : Blank lines required before h1.  Default: `1`

`lines_before_h2` : Blank lines required before h2.  Default: `2`

#### Examples

Correct:

~~~~ markdown
Document title
==============

Introduction paragraph here.


First section
-------------

Section content.


Second section
--------------

More content.
~~~~

Also correct (h2 directly after h1 with no content):

~~~~ markdown
Document title
==============

First section
-------------

Section content.
~~~~

Incorrect:

~~~~ markdown
Document title
==============

Introduction paragraph here.

First section
-------------

Only one blank line above.
~~~~

#### Fix information

The rule provides `fixInfo` to insert additional blank lines as needed.

---

### HM005: heading-sentence-case

Warns when headings do not follow sentence case conventions.

#### Rationale

Sentence case (capitalizing only the first word and proper nouns) is easier to
read and more consistent than title case, especially for technical
documentation with many proper nouns and acronyms.

#### Detection logic

~~~~ text
For each heading:
  Extract heading text
  Tokenize into words
  For each word after the first:
    If word starts with uppercase:
      If word is not in allowed_words list:
        If word is not an acronym (all caps):
          Report warning
~~~~

#### Parameters

`allowed_words` : List of words allowed to be capitalized.  Default includes
common proper nouns like "JavaScript", "TypeScript", "GitHub", "npm", etc.

`ignore_acronyms` : Whether to ignore all-caps words.  Default: `true`

#### Examples

Correct:

~~~~ markdown
Development commands
API reference for JavaScript
~~~~

Incorrect:

~~~~ markdown
Development Commands        # "Commands" should be lowercase
Api Reference For Javascript # Multiple violations
~~~~

#### Fix information

This rule does not provide automatic fixing because determining which words
are proper nouns requires human judgment.

---


Project structure
-----------------

The plugin follows the same project structure conventions used in Hong
Minhee's other TypeScript projects.  It uses Deno as the primary development
tool and pnpm for npm-related tasks.

~~~~ text
@hongminhee/markdownlint-rules/
├── src/
│   ├── index.ts                              # Exports all rules and preset
│   ├── preset.ts                             # Configuration preset
│   ├── rules/
│   │   ├── list-item-marker-space.ts
│   │   ├── list-item-marker-space.test.ts
│   │   ├── fenced-code-fence-length.ts
│   │   ├── fenced-code-fence-length.test.ts
│   │   ├── reference-link-section-placement.ts
│   │   ├── reference-link-section-placement.test.ts
│   │   ├── setext-heading-blank-lines.ts
│   │   ├── setext-heading-blank-lines.test.ts
│   │   ├── heading-sentence-case.ts
│   │   └── heading-sentence-case.test.ts
│   └── helpers/
│       ├── section-parser.ts
│       └── heading-utils.ts
├── dist/                                     # Built output (gitignored)
├── deno.json                                 # Deno configuration and JSR metadata
├── package.json                              # npm configuration
├── tsdown.config.ts                          # Build configuration
├── mise.toml                                 # Runtime version management
├── .gitignore
├── LICENSE
└── README.md
~~~~

### File organization

Test files are colocated with their implementation files in the *src/*
directory, following the `*.test.ts` naming convention.  This allows tests to
run across all supported runtimes (Deno, Node.js, Bun) using each platform's
native test runner.


Configuration preset
--------------------

The package will export a recommended configuration preset that combines
built-in rules with custom rules:

~~~~ javascript
// preset.js
module.exports = {
  // Built-in rules
  "MD003": { "style": "setext_with_atx" },
  "MD004": { "style": "dash" },
  "MD007": { "indent": 4 },
  "MD013": { "line_length": 80 },
  "MD022": { "lines_above": 1, "lines_below": 1 },
  "MD030": false, // Disabled in favor of HM001
  "MD048": { "style": "tilde" },

  // Custom rules
  "HM001": true,
  "HM002": { "fence_length": 4 },
  "HM003": true,
  "HM004": { "lines_before_h2": 2 },
  "HM005": true,
};
~~~~

Users can then reference this preset in their configuration:

~~~~ javascript
// .markdownlint-cli2.mjs
import customRules from "@hongminhee/markdownlint-rules";
import preset from "@hongminhee/markdownlint-rules/preset";

export default {
  customRules,
  config: preset,
};
~~~~


Implementation considerations
-----------------------------

### Development environment

The project uses [mise] to manage runtime versions.  The following tools are
required:

 -  Deno 2.3 or later
 -  Node.js 22 or later
 -  Bun 1.2 or later
 -  pnpm (latest)

The *mise.toml* file specifies exact versions:

~~~~ toml
[tools]
bun = "1.2"
deno = "2.3"
node = "22"
"npm:pnpm" = "latest"
~~~~

[mise]: https://mise.jdx.dev/

### Package configuration

The package requires two configuration files for dual publishing:

#### deno.json

Used for Deno development and JSR publishing:

<!-- markdownlint-disable MD013 -->
~~~~ json
{
  "name": "@hongminhee/markdownlint-rules",
  "version": "0.1.0",
  "license": "MIT",
  "exports": {
    ".": "./src/index.ts",
    "./preset": "./src/preset.ts"
  },
  "exclude": ["dist/", "tsdown.config.ts"],
  "tasks": {
    "check": "deno check && deno lint && deno fmt --check && deno publish --dry-run --allow-dirty",
    "test": "deno test --allow-read",
    "test:node": "pnpm build && node --experimental-transform-types --test",
    "test:bun": "pnpm build && bun test"
  }
}
~~~~
<!-- markdownlint-enable MD013 -->

#### package.json

Used for npm publishing and Node.js/Bun compatibility:

~~~~ json
{
  "name": "@hongminhee/markdownlint-rules",
  "version": "0.1.0",
  "description": "Custom markdownlint rules for Hong Minhee's Markdown style",
  "license": "MIT",
  "author": {
    "name": "Hong Minhee",
    "email": "hong@minhee.org",
    "url": "https://hongminhee.org/"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/dahlia/markdownlint-rules.git"
  },
  "engines": {
    "node": ">=22.0.0",
    "bun": ">=1.2.0",
    "deno": ">=2.3.0"
  },
  "type": "module",
  "exports": {
    ".": {
      "types": {
        "require": "./dist/index.d.cts",
        "import": "./dist/index.d.ts"
      },
      "require": "./dist/index.cjs",
      "import": "./dist/index.js"
    },
    "./preset": {
      "types": {
        "require": "./dist/preset.d.cts",
        "import": "./dist/preset.d.ts"
      },
      "require": "./dist/preset.cjs",
      "import": "./dist/preset.js"
    }
  },
  "files": ["dist/", "package.json", "README.md"],
  "sideEffects": false,
  "peerDependencies": {
    "markdownlint": ">=0.37.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "markdownlint": "^0.37.0",
    "tsdown": "^0.9.0",
    "typescript": "^5.8.0"
  },
  "scripts": {
    "build": "tsdown",
    "prepack": "tsdown",
    "test": "node --experimental-transform-types --test",
    "test:bun": "bun test"
  }
}
~~~~

#### tsdown.config.ts

Build configuration for generating npm-compatible output:

~~~~ typescript
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/preset.ts"],
  dts: true,
  format: ["esm", "cjs"],
  unbundle: true,
  platform: "neutral",
});
~~~~

### Development commands

| Command               | Description                    |
| --------------------- | ------------------------------ |
| `mise run install`    | Install dependencies           |
| `deno task check`     | Type check, lint, format check |
| `deno task test`      | Run tests with Deno            |
| `deno task test:node` | Run tests with Node.js         |
| `deno task test:bun`  | Run tests with Bun             |
| `pnpm build`          | Build for npm with tsdown      |

### Parser selection

All custom rules will use the `micromark` parser, which is the default and
recommended parser for markdownlint.  The micromark parser provides:

 -  Full CommonMark compliance
 -  Detailed token information including line numbers and columns
 -  Support for GFM extensions

### Testing strategy

Each rule will have comprehensive tests covering:

 -  Valid cases that should not trigger errors
 -  Invalid cases with expected error details
 -  Edge cases (empty files, nested structures, etc.)
 -  Fix verification where applicable

Tests use `node:test` and `node:assert/strict` APIs to ensure compatibility
across all runtimes (Deno, Node.js, Bun).

### Dual publishing

The package will be published to both registries:

 -  *JSR* (`jsr:@hongminhee/markdownlint-rules`): TypeScript source directly
 -  *npm* (`@hongminhee/markdownlint-rules`): Built output via tsdown (ESM +
    CJS + type declarations)


Future considerations
---------------------

### Additional rules

The following rules may be added in future versions:

 -  Table alignment enforcement
 -  GitHub alert syntax validation (`> [!NOTE]`, etc.)
 -  Consistent emphasis marker (`*` vs `_`)

### Formatter capability

While markdownlint provides `fixInfo` for automatic corrections, a dedicated
formatter tool could provide more comprehensive reformatting.  This could be
implemented as a separate remark-based tool that shares configuration with the
linter.

### Editor integration

The custom rules will work automatically with:

 -  VS Code via [vscode-markdownlint]
 -  Other editors via markdownlint-cli2

No additional editor plugins are required.

[vscode-markdownlint]: https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint


References
----------

 -  [markdownlint documentation]
 -  [markdownlint custom rules guide]
 -  [micromark]

[markdownlint documentation]: https://github.com/DavidAnson/markdownlint
[markdownlint custom rules guide]: https://github.com/DavidAnson/markdownlint/blob/main/doc/CustomRules.md
[micromark]: https://github.com/micromark/micromark
