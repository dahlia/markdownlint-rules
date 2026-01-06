@hongminhee/markdownlint-rules changelog
========================================

Version 0.2.0
-------------

To be released.

 -  HM001 (`list-item-marker-space`) now skips content inside fenced code blocks.
    Previously, list items in code block examples were incorrectly flagged.

 -  HM005 (`heading-sentence-case`) now allows more common programming terms
    and acronyms by default:

     -  Programming terms: `Boolean`, `Markdown`, `Unicode`, `ASCII`, `UTF`,
        `RegExp`, `URL`, `URI`, `API`
     -  Acronyms with plurals: `CLI`/`CLIs`, `SDK`/`SDKs`, `IDE`/`IDEs`,
        `GUI`/`GUIs`
     -  Libraries: `Zod`, `Valibot`, `Temporal`


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
