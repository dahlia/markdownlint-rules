@hongminhee/markdownlint-rules changelog
========================================

Version 0.1.7
-------------

To be released.


Version 0.1.6
-------------

Released on January 7, 2026.

 -  Preset now disables MD028 (`no-blanks-blockquote`) to avoid false positives
    with GitHub alerts.  MD028 reports errors when there are blank lines
    between consecutive blockquotes, but this creates false positives when
    using GitHub alerts (`> [!NOTE]`, `> [!TIP]`, etc.), which are separate
    blockquote blocks that should be visually separated.  Modern documentation
    generators (GitHub, VitePress, Docusaurus) render these correctly as
    distinct alert boxes, and requiring no blank lines between them would
    reduce source markdown readability.  [[#7]]

 -  Preset now disables MD051 (`link-fragments`) to avoid false positives
    with documentation generators.  MD051 validates link fragments using its
    own heading-to-fragment conversion rules, which often differ from those
    used by actual documentation generators (VitePress, Docusaurus, GitHub,
    etc.).  This mismatch causes false positives when links work correctly
    in the generated documentation but are flagged by markdownlint.  Since
    documentation generators validate fragment links at build time, having
    markdownlint validate them with different rules creates more noise than
    value.  [[#6]]

[#6]: https://github.com/dahlia/markdownlint-rules/issues/6
[#7]: https://github.com/dahlia/markdownlint-rules/issues/7


Version 0.1.5
-------------

Released on January 7, 2026.

 -  Preset now disables MD046 (`code-block-style`) to avoid conflict with
    definition list syntax.  MD046 treats indented content within definition
    lists as indented code blocks and reports false positives.  Since
    markdownlint is based on CommonMark and does not recognize definition
    list syntax (a Markdown extension), it cannot distinguish between
    indented code blocks and definition list content.  [[#5]]

[#5]: https://github.com/dahlia/markdownlint-rules/issues/5


Version 0.1.4
-------------

Released on January 7, 2026.

 -  Fixed HM003 (`reference-link-section-placement`) to recognize multi-line
    reference link definitions.  Previously, continuation lines (indented lines
    following a reference link definition) were treated as regular content,
    causing false positives when multi-line reference links were placed at
    the content block end.  [[#4]]

[#4]: https://github.com/dahlia/markdownlint-rules/issues/4


Version 0.1.3
-------------

Released on January 6, 2026.

 -  Preset now disables MD027 (`no-multiple-space-blockquote`) to avoid conflict
    with HM001's ` -  ` list style inside blockquotes.  [[#3]]

[#3]: https://github.com/dahlia/markdownlint-rules/issues/3


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

[#1]: https://github.com/dahlia/markdownlint-rules/issues/1
[#2]: https://github.com/dahlia/markdownlint-rules/issues/2


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
