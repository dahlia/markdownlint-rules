@hongminhee/markdownlint-rules
==============================

Custom [markdownlint] rules that enforce [Hong Minhee's Markdown style
conventions][style].  These rules extend markdownlint with checks that cannot
be achieved through built-in configuration alone.

[markdownlint]: https://github.com/DavidAnson/markdownlint
[style]: ./AGENTS.md#markdown-style-guide


Installation
------------

This package is available on both [JSR] and [npm].

[JSR]: https://jsr.io/@hongminhee/markdownlint-rules
[npm]: https://www.npmjs.com/package/@hongminhee/markdownlint-rules

### Deno

~~~~ sh
deno add jsr:@hongminhee/markdownlint-rules
~~~~

### Node.js (npm)

~~~~ sh
npm add -D @hongminhee/markdownlint-rules
~~~~

### Node.js (pnpm)

~~~~ sh
pnpm add -D @hongminhee/markdownlint-rules
~~~~

### Bun

~~~~ sh
bun add -D @hongminhee/markdownlint-rules
~~~~


Usage
-----

### With markdownlint-cli2

Create a *.markdownlint-cli2.mjs* file in your project root:

~~~~ javascript
import customRules from "@hongminhee/markdownlint-rules";
import preset from "@hongminhee/markdownlint-rules/preset";

export default {
  customRules,
  config: preset,
};
~~~~

### Using individual rules

You can also import and use rules individually:

~~~~ javascript
import {
  fencedCodeFenceLength,
  headingSentenceCase,
  listItemMarkerSpace,
  referenceLinkSectionPlacement,
  setextHeadingBlankLines,
} from "@hongminhee/markdownlint-rules";

export default {
  customRules: [
    listItemMarkerSpace,
    fencedCodeFenceLength,
  ],
  config: {
    "HM001": true,
    "HM002": { "fence_length": 4 },
  },
};
~~~~


Rules
-----

### HM001: list-item-marker-space

Enforces the ` -  ` format for unordered list items: exactly one space before
the marker and exactly two spaces after.

This unusual spacing creates visual alignment where the item content starts at
column 5.  When list items wrap or contain nested content, the 4-space
indentation aligns perfectly with the parent content.

#### Examples

Correct:

~~~~
 -  First item
 -  Second item
     -  Nested item
~~~~

Incorrect:

<!-- markdownlint-disable list-item-marker-space -->
~~~~
- First item          # No leading space, only one space after
 - Second item        # Only one space after marker
  -  Third item       # Two leading spaces instead of one
~~~~
<!-- markdownlint-enable list-item-marker-space -->

#### Parameters

 -  `nested_indent`: Number of spaces for each nesting level.  Default: `4`
 -  `post_marker_spaces`: Number of spaces after the marker.  Default: `2`

---

### HM002: fenced-code-fence-length

Enforces that fenced code blocks use tildes with at least four characters
(configurable), and that opening and closing fences have matching lengths.

Using four tildes (`~~~~`) instead of three provides visual distinction and
allows embedding triple-tilde blocks inside documentation about Markdown
itself.  Longer fences (5+) are allowed for nesting code blocks within
documentation.

#### Examples

Correct:

~~~~~
~~~~ typescript
const x = 1;
~~~~
~~~~~

~~~~~~
~~~~~ markdown
Nested code block example:

~~~~ typescript
const y = 2;
~~~~
~~~~~
~~~~~~

Incorrect:

<!-- markdownlint-disable fenced-code-fence-length MD048 -->
~~~~~~
``` typescript    # Uses backticks
const x = 1;
```

~~~ typescript    # Only three tildes (below minimum)
const x = 1;
~~~

~~~~ typescript   # Mismatched fence lengths
const x = 1;
~~~~~
~~~~~~
<!-- markdownlint-enable fenced-code-fence-length MD048 -->

#### Parameters

 -  `min_fence_length`: Minimum number of fence characters.  Default: `4`

---

### HM003: reference-link-section-placement

Enforces that reference link definitions appear at the end of their content
block—the region between any two headings (of any level).

Placing reference links at the end of content blocks keeps related content
together.  When content is moved or extracted, its links travel with it.

#### Examples

Correct:

<!-- markdownlint-disable MD031 MD040 -->
~~~~
Some section
------------

Here is some text with a [link][example].

[example]: https://example.com/

### Subsection

More content with [another link][other].

[other]: https://other.example.com/
~~~~
<!-- markdownlint-enable MD031 MD040 -->

Incorrect:

<!-- markdownlint-disable MD031 MD040 -->
~~~~
Some section
------------

[example]: https://example.com/

Here is some text with a [link][example].
~~~~
<!-- markdownlint-enable MD031 MD040 -->

---

### HM004: setext-heading-blank-lines

Enforces two blank lines before Setext-style section headings (level 2) and
one blank line before the document title (level 1).

Extra vertical space before major sections improves document scanability.

> [!NOTE]
> When a heading immediately follows a parent heading with no content between
> them (e.g., h2 directly after h1), only one blank line is required.

#### Examples

Correct:

<!-- markdownlint-disable MD031 MD040 -->
~~~~
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
<!-- markdownlint-enable MD031 MD040 -->

Also correct (h2 directly after h1 with no content):

<!-- markdownlint-disable MD031 MD040 -->
~~~~
Document title
==============

First section
-------------

Section content.
~~~~
<!-- markdownlint-enable MD031 MD040 -->

Incorrect:

<!-- markdownlint-disable MD031 MD040 -->
~~~~
Document title
==============

Introduction paragraph here.

First section
-------------

Only one blank line above.
~~~~
<!-- markdownlint-enable MD031 MD040 -->

#### Parameters

 -  `lines_before_h1`: Blank lines required before h1.  Default: `1`
 -  `lines_before_h2`: Blank lines required before h2.  Default: `2`

---

### HM005: heading-sentence-case

Warns when headings do not follow sentence case conventions (capitalizing only
the first word and proper nouns).

Sentence case is easier to read and more consistent than title case,
especially for technical documentation with many proper nouns and acronyms.

#### Examples

Correct:

<!-- markdownlint-disable MD031 MD040 -->
~~~~
Development commands
API reference for JavaScript
~~~~
<!-- markdownlint-enable MD031 MD040 -->

Incorrect:

<!-- markdownlint-disable MD031 MD040 -->
~~~~
Development Commands        # "Commands" should be lowercase
Api Reference For Javascript # Multiple violations
~~~~
<!-- markdownlint-enable MD031 MD040 -->

#### Parameters

 -  `allowed_words`: List of words allowed to be capitalized.  Default includes
    common proper nouns like “JavaScript”, “TypeScript”, “GitHub”, etc.
 -  `ignore_acronyms`: Whether to ignore all-caps words.  Default: `true`


Configuration preset
--------------------

The package exports a recommended configuration preset that combines built-in
markdownlint rules with the custom rules:

~~~~ javascript
import preset from "@hongminhee/markdownlint-rules/preset";
~~~~

The preset configures:

<!-- markdownlint-disable MD007 MD030 -->
 -  *MD003*: Setext headings with ATX for subsections
 -  *MD004*: Dash list markers
 -  *MD007*: 4-space list indentation
 -  *MD013*: 80-character line length
 -  *MD022*: Blank lines around headings
 -  *MD030*: Disabled (replaced by HM001)
 -  *MD048*: Tilde code fences
 -  All five custom rules (HM001-HM005)
<!-- markdownlint-enable MD007 MD030 -->

<!-- markdownlint-disable MD012 -->


Development
-----------

This is a polyglot package supporting Deno, Node.js, and Bun.

### Prerequisites

Install [mise] to manage runtime versions:

[mise]: https://mise.jdx.dev/

~~~~ sh
mise install
~~~~

### Commands

~~~~ sh
deno task check      # Type check, lint, format check, and dry-run publish
deno task test       # Run tests with Deno
deno task test:node  # Run tests with Node.js
deno task test:bun   # Run tests with Bun
pnpm run build       # Build for npm publishing
~~~~


License
-------

Distributed under the [MIT License].  See the *LICENSE* file for details.

[MIT License]: https://minhee.mit-license.org/2026/
