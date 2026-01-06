@hongminhee/markdownlint-rules changelog
========================================

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
