@hongminhee/markdownlint-rules changelog
========================================

Version 0.2.0
-------------

To be released.


Version 0.1.1
-------------

Released on January 6, 2026.

 -  Fixed HM005 (`heading-sentence-case`) to allow capitalization after colons
    (e.g., `Blah blah: Blah blah`) and inside quotation marks (e.g.,
    `Did you say "Hello?"`).  Both straight quotes (`"`, `'`) and curly quotes
    (`"`, `"`, `'`, `'`) are now recognized.

 -  Fixed HM005 (`heading-sentence-case`) to correctly handle headings that
    start with numbers (e.g., `1. Getting started`).  The first alphabetic
    word is now treated as the sentence start.

 -  HM001 (`list-item-marker-space`) now skips GFM task list items (checkbox
    syntax like `- [ ]` and `- [x]`).  These items do not need to follow the
    ` -  ` format.


Version 0.1.0
-------------

Released on January 6, 2026.  Initial release.
