import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { LintError, LintResults } from "markdownlint";
import { lint as lintSync } from "markdownlint/sync";
import listItemMarkerSpace from "./list-item-marker-space.ts";

function lint(
  content: string,
  config?: Record<string, unknown>,
): LintResults {
  return lintSync({
    strings: { test: content },
    customRules: [listItemMarkerSpace],
    config: {
      default: false,
      "list-item-marker-space": config ?? true,
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

describe("HM001: list-item-marker-space", () => {
  describe("valid cases", () => {
    it("should pass for correctly formatted top-level list items", () => {
      const content = ` -  First item
 -  Second item
 -  Third item
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should pass for correctly formatted nested list items", () => {
      const content = ` -  First item
     -  Nested item
         -  Deeply nested
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should pass for empty list items", () => {
      const content = ` -  
 -  Item with content
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should ignore non-dash markers", () => {
      const content = `* Item with asterisk
+ Item with plus
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });
  });

  describe("invalid leading spaces", () => {
    it("should report error for no leading space", () => {
      const content = `-  First item
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.match(errors[0].errorDetail ?? "", /Expected 1 leading space/);
    });

    it("should report error for two leading spaces at top level", () => {
      const content = `  -  First item
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.match(errors[0].errorDetail ?? "", /Expected 1 leading space/);
    });

    it("should report error for incorrect nested indentation", () => {
      const content = ` -  First item
   -  Wrong nesting
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      // 3 spaces is closest to 5 spaces (1 nested level), so we expect 5
      assert.match(errors[0].errorDetail ?? "", /Expected 5 leading space/);
    });
  });

  describe("invalid post-marker spaces", () => {
    it("should report error for one space after marker", () => {
      const content = ` - First item
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.match(errors[0].errorDetail ?? "", /Expected 2 space\(s\) after/);
    });

    it("should report error for three spaces after marker", () => {
      const content = ` -   First item
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.match(errors[0].errorDetail ?? "", /Expected 2 space\(s\) after/);
    });
  });

  describe("configuration", () => {
    it("should respect custom nested_indent", () => {
      const content = ` -  First item
   -  Nested with 2-space indent
`;
      // With default (4-space indent), this would be invalid
      const errorsDefault = getErrors(content);
      assert.equal(errorsDefault.length, 1);

      // With 2-space indent, this should be valid
      const errorsCustom = getErrors(content, { nested_indent: 2 });
      assert.equal(errorsCustom.length, 0);
    });

    it("should respect custom post_marker_spaces", () => {
      const content = ` - First item
`;
      // With default (2 spaces), this would be invalid
      const errorsDefault = getErrors(content);
      assert.equal(errorsDefault.length, 1);

      // With 1 space, this should be valid
      const errorsCustom = getErrors(content, { post_marker_spaces: 1 });
      assert.equal(errorsCustom.length, 0);
    });
  });

  describe("fix information", () => {
    it("should provide fix info for leading space errors", () => {
      const content = `-  First item
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.ok(errors[0].fixInfo);
      assert.equal(errors[0].fixInfo?.insertText, " -  First item");
    });

    it("should provide fix info for post-marker space errors", () => {
      const content = ` - First item
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.ok(errors[0].fixInfo);
      assert.equal(errors[0].fixInfo?.insertText, " -  First item");
    });

    it("should provide fix info for nested items", () => {
      const content = `     - Nested item
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.ok(errors[0].fixInfo);
      assert.equal(errors[0].fixInfo?.insertText, "     -  Nested item");
    });
  });

  describe("GFM task list items", () => {
    it("should skip GFM checkbox items (unchecked)", () => {
      const content = `- [ ] Task item
- [ ] Another task
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should skip GFM checkbox items (checked)", () => {
      const content = `- [x] Completed task
- [X] Another completed task
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should skip nested GFM checkbox items", () => {
      const content = `- [ ] Top level task
  - [ ] Nested task
    - [x] Deeply nested completed
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should still enforce rules for non-checkbox items", () => {
      const content = `- [ ] Task item
- Regular item without checkbox
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.equal(errors[0].lineNumber, 2);
    });
  });

  describe("fenced code blocks", () => {
    it("should skip list items inside fenced code blocks (tildes)", () => {
      const content = ` -  Item before code block

    ~~~~
    - Item inside code block
    - Another item inside
    ~~~~

 -  Item after code block
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should skip list items inside fenced code blocks (backticks)", () => {
      const content = ` -  Item before code block

    \`\`\`
    - Item inside code block
    - Another item inside
    \`\`\`

 -  Item after code block
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should handle nested code block examples", () => {
      const content = ` -  When listing items after a colon:

    ~~~~
    This commit includes:

    - Added foo
    - Fixed bar
    ~~~~

 -  Another item
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should report errors for items outside code blocks", () => {
      const content = `- Item before code block

    ~~~~
    - Item inside code block
    ~~~~

- Item after code block
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 2);
      assert.equal(errors[0].lineNumber, 1);
      assert.equal(errors[1].lineNumber, 7);
    });

    it("should handle code blocks with longer fences", () => {
      const content = ` -  Item before

    ~~~~~~
    - Item inside
    ~~~~
    - Still inside (shorter fence doesn't close)
    ~~~~~~

 -  Item after
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });
  });
});
