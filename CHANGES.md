@hongminhee/markdownlint-rules changelog
========================================

Version 0.2.3
-------------

Released on January 7, 2026.

 -  Fixed HM003 (`reference-link-section-placement`) to recognize multi-line
    reference link definitions.  Previously, continuation lines (indented lines
    following a reference link definition) were treated as regular content,
    causing false positives when multi-line reference links were placed at
    the content block end.  [[#4]]


Version 0.2.2
-------------

Released on January 6, 2026.

 -  Preset now disables MD027 (`no-multiple-space-blockquote`) to avoid
    conflict with HM001's ` -  ` list style inside blockquotes.  [[#3]]

[#3]: https://github.com/dahlia/markdownlint-rules/issues/3


Version 0.2.1
-------------

Released on January 6, 2026.

 -  Fixed HM003 (`reference-link-section-placement`) to recognize thematic
    breaks (`---`, `***`, `___`, or with spaces like `- - -`) as content block
    boundaries.  Previously, reference link definitions placed before a thematic
    break were incorrectly reported as not being at the content block end.
    [[#1]]

 -  Fixed preset's MD013 configuration to exclude tables from line length
    checking (`tables: false`).  Tables often cannot be wrapped easily, so they
    should not trigger line length errors.  [[#2]]

[#1]: https://github.com/dahlia/markdownlint-rules/issues/1
[#2]: https://github.com/dahlia/markdownlint-rules/issues/2
[#4]: https://github.com/dahlia/markdownlint-rules/issues/4


Version 0.2.0
-------------

Released on January 6, 2026.

 -  HM001 (`list-item-marker-space`) now skips content inside fenced code blocks.
    Previously, list items in code block examples were incorrectly flagged.

 -  HM005 (`heading-sentence-case`) now allows more common programming terms
    and acronyms by default:

     -  Programming terms: `Boolean`, `Markdown`, `Unicode`, `ASCII`, `UTF`,
        `RegExp`, `URL`, `URI`, `API`
     -  Acronyms with plurals: `CLI`/`CLIs`, `SDK`/`SDKs`, `IDE`/`IDEs`,
        `GUI`/`GUIs`
     -  Libraries: `Zod`, `Valibot`, `Temporal`

 -  HM005 (`heading-sentence-case`) now ignores PascalCase words by default,
    as they typically represent type or class names in technical documentation
    (e.g., `LogOutput`, `StringBuilder`).  This can be disabled via the
    `ignore_pascal_case` option.


Version 0.1.2
-------------

Released on January 6, 2026.

 -  Fixed HM003 (`reference-link-section-placement`) to recognize thematic
    breaks (`---`, `***`, `___`, or with spaces like `- - -`) as content block
    boundaries.  Previously, reference link definitions placed before a thematic
    break were incorrectly reported as not being at the content block end.
    [[#1]]

 -  Fixed preset's MD013 configuration to exclude tables from line length
    checking (`tables: false`).  Tables often cannot be wrapped easily, so they
    should not trigger line length errors.  [[#2]]


Version 0.1.1
-------------

Released on January 6, 2026.

 -  Fixed HM005 (`heading-sentence-case`) to allow capitalization after colons
    (e.g., `Blah blah: Blah blah`) and inside quotation marks (e.g.,
    `Did you say "Hello?"`).  Both straight quotes (`"`, `'`) and curly quotes
    (`“`, `”`, `‘`, `’`) are now recognized.

 -  Fixed HM005 (`heading-sentence-case`) to correctly handle headings that
    start with numbers (e.g., `1. Getting started`).  The first alphabetic
    word is now treated as the sentence start.

 -  HM001 (`list-item-marker-space`) now skips GFM task list items (checkbox
    syntax like `- [ ]` and `- [x]`).  These items do not need to follow the
    ` -  ` format.


Version 0.1.0
-------------

Released on January 6, 2026.  Initial release.
