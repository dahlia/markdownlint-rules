import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { LintError, LintResults } from "markdownlint";
import { lint as lintSync } from "markdownlint/sync";
import setextHeadingBlankLines from "./setext-heading-blank-lines.ts";

function lint(
  content: string,
  config?: Record<string, unknown>,
): LintResults {
  return lintSync({
    strings: { test: content },
    customRules: [setextHeadingBlankLines],
    config: {
      default: false,
      "setext-heading-blank-lines": config ?? true,
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

describe("HM004: setext-heading-blank-lines", () => {
  describe("valid cases", () => {
    it("should pass for document title at start", () => {
      const content = `Document title
==============

Introduction.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should pass for h2 with two blank lines before", () => {
      const content = `Document title
==============

Introduction paragraph.


First section
-------------

Content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should pass for h1 with one blank line before", () => {
      const content = `Some content.

Document title
==============

More content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should pass for multiple sections with proper spacing", () => {
      const content = `Title
=====

Intro.


Section one
-----------

Content.


Section two
-----------

More content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });
  });

  describe("invalid cases", () => {
    it("should report error for h2 with one blank line", () => {
      const content = `Title
=====

Introduction.

First section
-------------

Content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.match(
        errors[0].errorDetail ?? "",
        /Expected 2 blank line\(s\) before h2, found 1/,
      );
    });

    it("should report error for h2 with no blank lines", () => {
      const content = `Title
=====

Introduction.
First section
-------------

Content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.match(
        errors[0].errorDetail ?? "",
        /Expected 2 blank line\(s\) before h2, found 0/,
      );
    });

    it("should report error for h1 with no blank lines (not at start)", () => {
      const content = `Some content.
Another title
=============

More content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.match(
        errors[0].errorDetail ?? "",
        /Expected 1 blank line\(s\) before h1, found 0/,
      );
    });

    it("should report multiple errors for multiple violations", () => {
      const content = `Title
=====

Intro.

Section one
-----------

Content.

Section two
-----------

More content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 2);
    });
  });

  describe("configuration", () => {
    it("should respect custom lines_before_h2", () => {
      const content = `Title
=====

Introduction.

First section
-------------

Content.
`;
      // With default (2 lines), this is invalid
      const errorsDefault = getErrors(content);
      assert.equal(errorsDefault.length, 1);

      // With 1 line, this should be valid
      const errorsCustom = getErrors(content, { lines_before_h2: 1 });
      assert.equal(errorsCustom.length, 0);
    });

    it("should respect custom lines_before_h1", () => {
      const content = `Some content.


Another title
=============

More content.
`;
      // With default (1 line), 2 blank lines is fine
      const errorsDefault = getErrors(content);
      assert.equal(errorsDefault.length, 0);

      // With 3 lines required, this should fail
      const errorsCustom = getErrors(content, { lines_before_h1: 3 });
      assert.equal(errorsCustom.length, 1);
    });
  });

  describe("edge cases", () => {
    it("should ignore ATX headings", () => {
      const content = `# Title

Introduction.

## Section
Content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should ignore Setext-like patterns in code blocks", () => {
      const content = `Title
=====

Introduction.


~~~~
Some text
---------
Not a heading
~~~~


Section
-------

Content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should handle document with only h2 at start", () => {
      const content = `Section
-------

Content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });
  });

  describe("fix information", () => {
    it("should provide fix info for missing blank lines", () => {
      const content = `Title
=====

Introduction.

First section
-------------

Content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.ok(errors[0].fixInfo);
      assert.equal(errors[0].fixInfo?.insertText, "\n");
    });

    it("should provide fix info for multiple missing blank lines", () => {
      const content = `Title
=====

Introduction.
First section
-------------

Content.
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.ok(errors[0].fixInfo);
      assert.equal(errors[0].fixInfo?.insertText, "\n\n");
    });
  });
});
