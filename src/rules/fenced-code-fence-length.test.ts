import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { LintError, LintResults } from "markdownlint";
import { lint as lintSync } from "markdownlint/sync";
import fencedCodeFenceLength from "./fenced-code-fence-length.ts";

function lint(
  content: string,
  config?: Record<string, unknown>,
): LintResults {
  return lintSync({
    strings: { test: content },
    customRules: [fencedCodeFenceLength],
    config: {
      default: false,
      "fenced-code-fence-length": config ?? true,
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

describe("HM002: fenced-code-fence-length", () => {
  describe("valid cases", () => {
    it("should pass for code blocks with 4 tildes", () => {
      const content = `~~~~ typescript
const x = 1;
~~~~
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should pass for code blocks with 4 tildes and no language", () => {
      const content = `~~~~
const x = 1;
~~~~
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should pass for indented code blocks with 4 tildes", () => {
      const content = `  ~~~~ typescript
  const x = 1;
  ~~~~
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });
  });

  describe("invalid fence characters", () => {
    it("should report error for backticks", () => {
      const content = `\`\`\`\` typescript
const x = 1;
\`\`\`\`
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 2);
      assert.match(
        errors[0].errorDetail ?? "",
        /Expected tildes, found backticks/,
      );
    });

    it("should report error for 3 backticks", () => {
      const content = `\`\`\` typescript
const x = 1;
\`\`\`
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 2);
      assert.match(
        errors[0].errorDetail ?? "",
        /Expected 4 tildes, found 3 backticks/,
      );
    });
  });

  describe("invalid fence length", () => {
    it("should report error for 3 tildes", () => {
      const content = `~~~ typescript
const x = 1;
~~~
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 2);
      assert.match(errors[0].errorDetail ?? "", /Expected 4 tildes, found 3/);
    });

    it("should report error for 5 tildes", () => {
      const content = `~~~~~ typescript
const x = 1;
~~~~~
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 2);
      assert.match(errors[0].errorDetail ?? "", /Expected 4 tildes, found 5/);
    });
  });

  describe("configuration", () => {
    it("should respect custom fence_length", () => {
      const content = `~~~ typescript
const x = 1;
~~~
`;
      // With default (4), this would be invalid
      const errorsDefault = getErrors(content);
      assert.equal(errorsDefault.length, 2);

      // With fence_length: 3, this should be valid
      const errorsCustom = getErrors(content, { fence_length: 3 });
      assert.equal(errorsCustom.length, 0);
    });
  });

  describe("fix information", () => {
    it("should provide fix info for backticks", () => {
      const content = `\`\`\`\` typescript
const x = 1;
\`\`\`\`
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 2);
      assert.ok(errors[0].fixInfo);
      assert.equal(errors[0].fixInfo?.insertText, "~~~~ typescript");
      assert.equal(errors[1].fixInfo?.insertText, "~~~~");
    });

    it("should provide fix info for wrong length", () => {
      const content = `~~~ typescript
const x = 1;
~~~
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 2);
      assert.ok(errors[0].fixInfo);
      assert.equal(errors[0].fixInfo?.insertText, "~~~~ typescript");
      assert.equal(errors[1].fixInfo?.insertText, "~~~~");
    });

    it("should preserve indentation in fix", () => {
      const content = `  ~~~ typescript
  const x = 1;
  ~~~
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 2);
      assert.equal(errors[0].fixInfo?.insertText, "  ~~~~ typescript");
      assert.equal(errors[1].fixInfo?.insertText, "  ~~~~");
    });
  });

  describe("nested code blocks", () => {
    it("should handle documentation about code blocks", () => {
      // When documenting Markdown code blocks, you use 5 tildes to wrap 4
      const content = `~~~~~ markdown
Here is a code block:

~~~~ typescript
const x = 1;
~~~~
~~~~~
`;
      // The outer fence (5 tildes) should be flagged, inner (4 tildes) should
      // not be checked as it's inside a code block
      const errors = getErrors(content);
      assert.equal(errors.length, 2); // Opening and closing of outer fence
    });
  });
});
