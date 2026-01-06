import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { LintError, LintResults } from "markdownlint";
import { lint as lintSync } from "markdownlint/sync";
import referenceLinkSectionPlacement from "./reference-link-section-placement.ts";

function lint(
  content: string,
  config?: Record<string, unknown>,
): LintResults {
  return lintSync({
    strings: { test: content },
    customRules: [referenceLinkSectionPlacement],
    config: {
      default: false,
      "reference-link-section-placement": config ?? true,
    },
  });
}

function getErrors(
  content: string,
  config?: Record<string, unknown>,
): LintError[] {
  const results = lint(content, config);
  return results.test ?? [];
}

describe("HM003: reference-link-section-placement", () => {
  describe("valid cases", () => {
    it("should pass when reference links are at content block end", () => {
      const content = `Some section
------------

Here is some text with a [link][example].

[example]: https://example.com/


Another section
---------------

More content here.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should pass when multiple reference links are at content block end", () => {
      const content = `Section
-------

Text with [link1][a] and [link2][b].

[a]: https://example.com/a
[b]: https://example.com/b


Next section
------------

Content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should pass for document with no reference links", () => {
      const content = `Section
-------

Just regular text here.


Another section
---------------

More content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should pass for reference links at end of document (last content block)", () => {
      const content = `Section
-------

Text with a [link][example].

[example]: https://example.com/
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should pass when ref links are before subheading (intro content)", () => {
      const content = `Higher-level heading
--------------------

Blah blah blah [blah].

[blah]: http://example.com/

### Sub-heading

Some text under sub-heading.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should pass when each content block has its own ref links at end", () => {
      const content = `Main section
------------

Intro with [intro-link].

[intro-link]: https://example.com/intro

### Subsection A

Content A with [link-a].

[link-a]: https://example.com/a

### Subsection B

Content B with [link-b].

[link-b]: https://example.com/b
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });
  });

  describe("invalid cases", () => {
    it("should report error when reference link is followed by content", () => {
      const content = `Section
-------

Text with a [link][example].

[example]: https://example.com/

More content after the reference.


Another section
---------------

Content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.match(
        errors[0].errorDetail ?? "",
        /Reference link definition for "example" should be at content block end/,
      );
    });

    it("should report error for reference link in middle of content block", () => {
      const content = `Section
-------

First paragraph.

[link]: https://example.com/

Second paragraph.

Third paragraph.


Another section
---------------

Content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.equal(errors[0].lineNumber, 6); // [link] is on line 6
    });

    it("should report multiple errors for multiple misplaced links", () => {
      const content = `Section
-------

Paragraph.

[a]: https://example.com/a

More text.

[b]: https://example.com/b

Final text.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 2);
    });

    it("should report error when ref link is before intro content ends", () => {
      const content = `Main section
------------

[intro-link]: https://example.com/intro

Intro with [intro-link].

### Subsection

Content here.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.match(
        errors[0].errorDetail ?? "",
        /Reference link definition for "intro-link"/,
      );
    });

    it("should report error when ref link is before subsection content ends", () => {
      const content = `Main section
------------

Intro text.

### Subsection

[sub-link]: https://example.com/sub

Content with [sub-link].
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
    });

    it("should report error when ref link is used in one block but defined in another", () => {
      // This reproduces the AGENTS.md case where [mise] is used in the intro
      // but defined after the "Package manager" subsection
      const content = `Development commands
--------------------

This is a polyglot package supporting Deno, Node.js, and Bun.
Use [mise] to manage runtime versions.

### Package manager

This project uses Deno as the primary development tool.

[mise]: https://mise.jdx.dev/

### Quality checks

Some content here.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.match(
        errors[0].errorDetail ?? "",
        /Reference link definition for "mise"/,
      );
    });
  });

  describe("edge cases", () => {
    it("should handle document with only reference links", () => {
      const content = `Section
-------

[a]: https://example.com/a
[b]: https://example.com/b
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should handle ATX-style headings", () => {
      const content = `## Section

Text with [link][example].

[example]: https://example.com/


## Another section

Content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should handle mixed Setext and ATX headings", () => {
      const content = `Main section
------------

Intro with [intro].

[intro]: https://example.com/intro

### ATX subsection

Sub content with [sub].

[sub]: https://example.com/sub


Another main
------------

More content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should ignore reference-like patterns in code blocks", () => {
      const content = `Section
-------

~~~~
[not-a-link]: this is code
~~~~

Regular text.

[real-link]: https://example.com/
`;
      const errors = getErrors(content);
      // The code block should be ignored, real-link is at end - should pass
      assert.equal(errors.length, 0);
    });

    it("should handle content before first heading", () => {
      const content = `Some intro text with [link].

[link]: https://example.com/


Section
-------

Content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should report error for misplaced link in content before first heading", () => {
      const content = `[intro-link]: https://example.com/

Some intro text with [intro-link].


Section
-------

Content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
    });

    it("should handle deeply nested headings", () => {
      const content = `# Document

Intro [doc-link].

[doc-link]: https://example.com/doc

## Section

Section intro [sec-link].

[sec-link]: https://example.com/sec

### Subsection

Sub content [sub-link].

[sub-link]: https://example.com/sub

#### Deep section

Deep content [deep-link].

[deep-link]: https://example.com/deep
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should handle empty content blocks", () => {
      const content = `## Section A

## Section B

Content with [link].

[link]: https://example.com/
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should recognize thematic break (---) as content block boundary", () => {
      // Regression test for https://github.com/dahlia/markdownlint-rules/issues/1
      const content = `Some section
------------

Here is some text with a [link][example].

[example]: https://example.com/

---

Another section content here.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should recognize thematic break (***) as content block boundary", () => {
      const content = `Section
-------

Text with [link].

[link]: https://example.com/

***

More content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should recognize thematic break (___) as content block boundary", () => {
      const content = `Section
-------

Text with [link].

[link]: https://example.com/

___

More content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should recognize thematic break with spaces as content block boundary", () => {
      const content = `Section
-------

Text with [link].

[link]: https://example.com/

- - -

More content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should report error for misplaced ref link after thematic break", () => {
      const content = `Section
-------

Text with [link].

---

[link]: https://example.com/

More content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.match(
        errors[0].errorDetail ?? "",
        /Reference link definition for "link"/,
      );
    });

    it("should pass for multi-line reference link definitions at content block end", () => {
      // Regression test for https://github.com/dahlia/markdownlint-rules/issues/4
      const content = `Runtime support
---------------

Some text with a footnote.[^1]

[^1]: This is a long footnote that spans
      multiple lines for readability.

### Subsection

More content here.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should pass for multi-line reference links with various continuation indents", () => {
      const content = `Section
-------

Text with [link1] and [link2].

[link1]: https://example.com/very-long-url-that-continues
         on the next line
[link2]: https://example.com/another-url
    with different indentation

### Next section

Content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should report error when multi-line ref link is followed by content", () => {
      const content = `Section
-------

Text with [link].

[link]: https://example.com/
        multi-line definition

More content after the reference.

### Next section

Content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.match(
        errors[0].errorDetail ?? "",
        /Reference link definition for "link"/,
      );
    });
  });
});
